import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { XlsxParser } from './parsers/xlsx.parser';

import { ImportsRepository } from './imports.repository';

import { ColumnMapperService } from './mapping/column-mapper.service';
import { getImportSchema } from './mapping/mapping-registry';

import type {
  ColumnMappingSuggestion,
  ImportTarget,
} from './mapping/mapping.types';

import { SamplePatternService } from './ai/sample-pattern.service';
import { AiMappingService } from './ai/ai-mapping.service';

import { ImportFileStorageService } from './storage/import-file-storage.service';

import { NormalizationService } from './normalization/normalization.service';

import { StudentImportPersistenceService } from './persistence/student-import-persistence.service';

import type {
  AiMappingRequest,
  AiMappingResult,
} from './ai/ai-mapping.types';


import { ImportValidationService } from './validation/import-validation.service';

@Injectable()
export class ImportsService {
  constructor(
    private readonly xlsxParser: XlsxParser,
    private readonly columnMapper: ColumnMapperService,
    private readonly samplePatternService: SamplePatternService,
    private readonly aiMappingService: AiMappingService,
    private readonly importsRepository: ImportsRepository,
    private readonly importFileStorageService: ImportFileStorageService,
    private readonly normalizationService: NormalizationService,
    private readonly importValidationService: ImportValidationService,
    private readonly studentImportPersistenceService: StudentImportPersistenceService,
  ) {}

  async upload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Spreadsheet file is required.',
      );
    }

    const extension = file.originalname
      .split('.')
      .pop()
      ?.toLowerCase();

    if (extension !== 'xlsx') {
      throw new BadRequestException(
        'Only .xlsx files are supported for now.',
      );
    }

    const target: ImportTarget = 'STUDENT';

    const sheets = await this.xlsxParser.parse(
      file.buffer,
    );

    const importJob =
      await this.importsRepository.createJob({
        target,
        fileName: file.originalname,
        fileType: extension,
        fileSize: file.size,
      });

    await this.importFileStorageService.save(
      importJob.id,
      file.buffer,
    );

    const mappedSheets = await Promise.all(
      sheets.map(async (sheet) => {
        const columns = sheet.columns.map(
          (column) => {
            const sampleValues =
              sheet.sampleRows
                .map((row) => {
                  const cell = row.cells.find(
                    (item) =>
                      item.columnIndex ===
                      column.index,
                  );

                  return (
                    cell?.displayValue ?? ''
                  );
                })
                .filter(
                  (value) => value !== '',
                );

            return {
              index: column.index,
              header: column.header,
              sampleValues,
            };
          },
        );

        /*
         * First pass:
         * deterministic mapping.
         */
        const suggestedMappings =
          this.columnMapper.mapColumns(
            target,
            columns,
          );

        /*
         * Only ambiguous / uncertain columns
         * are prepared for AI.
         */
        const aiRequest =
          this.buildAiMappingRequest(
            target,
            {
              ...sheet,
              suggestedMappings,
            },
          );

        /*
         * AI is optional.
         * Failure returns an empty suggestion list.
         */
        const aiResult: AiMappingResult =
          aiRequest
            ? await this.aiMappingService.suggestMappings(
                aiRequest,
              )
            : {
                suggestions: [],
              };

        const finalMappings =
          this.mergeAiSuggestions(
            suggestedMappings,
            aiResult,
          );

        return {
          ...sheet,
          suggestedMappings:
            finalMappings,
        };
      }),
    );

    return {
      importJobId: importJob.id,
      fileName: file.originalname,
      fileSize: file.size,
      target,
      sheets: mappedSheets,
    };
  }

  async preview(
    importJobId: string,
    input: {
      sheetName: string;

      mappings: {
        columnIndex: number;
        targetField: string;
      }[];
    },
  ) {
    if (!input) {
      throw new BadRequestException(
        'Preview request body is required.',
      );
    }

    if (!input.sheetName) {
      throw new BadRequestException(
        'sheetName is required.',
      );
    }

    if (
      !Array.isArray(input.mappings) ||
      input.mappings.length === 0
    ) {
      throw new BadRequestException(
        'At least one column mapping is required.',
      );
    }

    const importJob =
      await this.importsRepository.findJobById(
        importJobId,
      );

    if (!importJob) {
      throw new BadRequestException(
        'Import job was not found.',
      );
    }

    const fileBuffer =
      await this.importFileStorageService.get(
        importJobId,
      );

    const sheets =
      await this.xlsxParser.parse(
        fileBuffer,
      );

    const sheet = sheets.find(
      (item) =>
        item.name === input.sheetName,
    );

    if (!sheet) {
      throw new BadRequestException(
        `Sheet "${input.sheetName}" was not found.`,
      );
    }

    const allRows =
      await this.xlsxParser.parseSheetRows(
        fileBuffer,
        input.sheetName,
        sheet.headerRowNumber,
      );

    const mappedRows =
      allRows.map((row) => {
        const cells = input.mappings
          .map((mapping) => {
            const sourceCell =
              row.cells.find(
                (cell) =>
                  cell.columnIndex ===
                  mapping.columnIndex,
              );

            if (!sourceCell) {
              return null;
            }

            return {
              columnIndex:
                mapping.columnIndex,

              header:
                sourceCell.header,

              targetField:
                mapping.targetField,

              rawValue:
                sourceCell.rawValue,

              displayValue:
                sourceCell.displayValue,
            };
          })
          .filter(
            (
              cell,
            ): cell is NonNullable<
              typeof cell
            > => cell !== null,
          );

        return {
          rowNumber: row.rowNumber,
          cells,
        };
      });

    const target =
      importJob.target as ImportTarget;

    const normalizedRows =
      this.normalizationService.normalizeRows(
        target,
        mappedRows,
      );

   const validation =
      await this.importValidationService.validate(
        target,
        normalizedRows,
      );
    await this.importsRepository.updateMapping(
      importJobId,
      {
        sheetName: input.sheetName,
        mappings: input.mappings,
      },
    );

  return {
      importJobId,
      target,
      sheetName: sheet.name,

      rowCount: allRows.length,

      mappings: input.mappings,

      summary: validation.summary,

      rows: validation.rows,
    };
}



async confirm(
  importJobId: string,
  input: {
    schoolYearId: string;
    sectionId: string;
  },
) {
  if (!input) {
    throw new BadRequestException(
      'Confirm import request body is required.',
    );
  }

  if (!input.schoolYearId) {
    throw new BadRequestException(
      'schoolYearId is required.',
    );
  }

  if (!input.sectionId) {
    throw new BadRequestException(
      'sectionId is required.',
    );
  }

  const importJob =
    await this.importsRepository.findJobById(
      importJobId,
    );

  if (!importJob) {
    throw new BadRequestException(
      'Import job was not found.',
    );
  }

  if (
    importJob.status ===
    'COMPLETED'
  ) {
    throw new BadRequestException(
      'This import job has already been completed.',
    );
  }

  if (!importJob.mappingConfig) {
    throw new BadRequestException(
      'This import has no confirmed column mapping.',
    );
  }

  const mappingConfig =
    importJob.mappingConfig as unknown as {
      sheetName: string;

      mappings: {
        columnIndex: number;
        targetField: string;
      }[];
    };

  if (
    !mappingConfig.sheetName ||
    !Array.isArray(
      mappingConfig.mappings,
    )
  ) {
    throw new BadRequestException(
      'Saved import mapping is invalid.',
    );
  }

  const fileBuffer =
    await this.importFileStorageService.get(
      importJobId,
    );

  /*
   * Important:
   * Confirmation does NOT trust preview output
   * sent back by the frontend.
   *
   * We rebuild everything from the stored file
   * and confirmed server-side mapping.
   */
  const allRows =
    await this.xlsxParser.parseSheetRows(
      fileBuffer,
      mappingConfig.sheetName,
    );

  const mappedRows =
    allRows.map((row) => {
      const cells =
        mappingConfig.mappings
          .map((mapping) => {
            const sourceCell =
              row.cells.find(
                (cell) =>
                  cell.columnIndex ===
                  mapping.columnIndex,
              );

            if (!sourceCell) {
              return null;
            }

            return {
              columnIndex:
                mapping.columnIndex,

              header:
                sourceCell.header,

              targetField:
                mapping.targetField,

              rawValue:
                sourceCell.rawValue,

              displayValue:
                sourceCell.displayValue,
            };
          })
          .filter(
            (
              cell,
            ): cell is NonNullable<
              typeof cell
            > => cell !== null,
          );

      return {
        rowNumber:
          row.rowNumber,

        cells,
      };
    });

  const target =
    importJob.target as ImportTarget;

  if (target !== 'STUDENT') {
    throw new BadRequestException(
      `Import confirmation for target "${target}" is not implemented yet.`,
    );
  }

  const normalizedRows =
    this.normalizationService.normalizeRows(
      target,
      mappedRows,
    );

  /*
   * Always validate again on confirmation.
   *
   * Never trust a preview that may have
   * happened several minutes earlier.
   */
  const validation =
    await this.importValidationService.validate(
      target,
      normalizedRows,
    );

  if (
    validation.summary.errorRows > 0
  ) {
    throw new BadRequestException({
      message:
        'Import cannot be confirmed because validation errors remain.',

      summary:
        validation.summary,

      rows:
        validation.rows.filter(
          (row) =>
            row.issues.some(
              (issue) =>
                issue.type ===
                'ERROR',
            ),
        ),
    });
  }

  const result =
    await this.studentImportPersistenceService.import(
      importJobId,
      {
        schoolYearId:
          input.schoolYearId,

        sectionId:
          input.sectionId,

        rows:
          validation.rows,
      },
    );

  /*
   * DB transaction succeeded,
   * so the temporary workbook is
   * no longer needed.
   */
  await this.importFileStorageService.delete(
    importJobId,
  );

  return {
    importJobId,

    status:
      'COMPLETED',

    schoolYearId:
      input.schoolYearId,

    sectionId:
      input.sectionId,

    summary: {
      totalRows:
        validation.summary.totalRows,

      importedRows:
        result.importedRows,

      createdStudents:
        result.createdStudents,

      reusedStudents:
        result.reusedStudents,

      createdEnrollments:
        result.createdEnrollments,
    },
  };
}

  private buildAiMappingRequest(
    target: ImportTarget,
    sheet: {
      columns: {
        index: number;
        header: string;
      }[];

      sampleRows: {
        rowNumber: number;

        cells: {
          columnIndex: number;
          header: string;
          rawValue: unknown;
          displayValue: string;
        }[];
      }[];

      suggestedMappings:
        ColumnMappingSuggestion[];
    },
  ): AiMappingRequest | null {
    const schema =
      getImportSchema(target);

    const needsAi =
      sheet.suggestedMappings.filter(
        (mapping) =>
          mapping.ambiguous ||
          mapping.requiresConfirmation ||
          mapping.suggestedField === null,
      );

    if (needsAi.length === 0) {
      return null;
    }

    return {
      target,

      availableFields:
        schema.fields.map((field) => ({
          key: field.key,
          label: field.label,
        })),

      columns: needsAi.map(
        (mapping) => {
          /*
           * Raw values stay inside the backend.
           * They are immediately transformed into
           * non-PII structural patterns.
           */
          const rawSamples =
            sheet.sampleRows
              .map((row) =>
                row.cells.find(
                  (cell) =>
                    cell.columnIndex ===
                    mapping.columnIndex,
                ),
              )
              .filter(
                (
                  cell,
                ): cell is NonNullable<
                  typeof cell
                > => Boolean(cell),
              )
              .map(
                (cell) =>
                  cell.rawValue,
              );

          const samplePatterns =
            this.samplePatternService.describeMany(
              rawSamples,
            );

          return {
            columnIndex:
              mapping.columnIndex,

            header:
              mapping.header,

            currentSuggestion:
              mapping.suggestedField,

            samplePatterns,
          };
        },
      ),
    };
  }

  private mergeAiSuggestions(
    mappings:
      ColumnMappingSuggestion[],
    aiResult: AiMappingResult,
  ) {
    return mappings.map(
      (mapping) => {
        const aiSuggestion =
          aiResult.suggestions.find(
            (suggestion) =>
              suggestion.columnIndex ===
              mapping.columnIndex,
          );

        if (!aiSuggestion) {
          return {
            ...mapping,

            aiSuggestion: null,

            reviewRequired:
              mapping.requiresConfirmation ||
              mapping.ambiguous,
          };
        }

        return {
          ...mapping,

          aiSuggestion: {
            suggestedField:
              aiSuggestion.suggestedField,

            confidence:
              aiSuggestion.confidence,

            reason:
              aiSuggestion.reason,
          },

          reviewRequired:
            mapping.requiresConfirmation ||
            mapping.ambiguous ||
            aiSuggestion.confidence < 0.9,
        };
      },
    );
  }
}