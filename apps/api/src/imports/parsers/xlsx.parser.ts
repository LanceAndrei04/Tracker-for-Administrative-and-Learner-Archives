import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import * as ExcelJS from 'exceljs';

export type ParsedColumn = {
  index: number;
  header: string;
};

export type ParsedCell = {
  columnIndex: number;
  header: string;
  rawValue: unknown;
  displayValue: string;
};

export type ParsedRow = {
  rowNumber: number;
  cells: ParsedCell[];
};

export type ParsedSheet = {
  name: string;
  headerRowNumber: number;
  rowCount: number;
  columns: ParsedColumn[];
  sampleRows: ParsedRow[];
};

@Injectable()
export class XlsxParser {
  private readonly MAX_HEADER_SCAN_ROWS = 20;
  private readonly SAMPLE_LIMIT = 5;

  async parse(
    fileBuffer: Buffer,
  ): Promise<ParsedSheet[]> {
    const workbook =
      await this.loadWorkbook(fileBuffer);

    const sheets: ParsedSheet[] = [];

    workbook.eachSheet((worksheet) => {
      const headerRowNumber =
        this.detectHeaderRow(worksheet);

      const columns =
        this.extractColumns(
          worksheet,
          headerRowNumber,
        );

      const sampleRows =
        this.extractSampleRows(
          worksheet,
          headerRowNumber,
          columns,
        );

      const dataRows =
        this.extractAllRows(
          worksheet,
          headerRowNumber,
          columns,
        );

      sheets.push({
        name: worksheet.name,

        headerRowNumber,

        /*
         * Count actual non-empty data rows,
         * not worksheet.rowCount - header.
         */
        rowCount: dataRows.length,

        columns,

        sampleRows,
      });
    });

    return sheets;
  }

  async parseSheetRows(
    fileBuffer: Buffer,
    sheetName: string,
    headerRowNumber?: number,
  ): Promise<ParsedRow[]> {
    const workbook =
      await this.loadWorkbook(fileBuffer);

    const worksheet =
      workbook.getWorksheet(sheetName);

    if (!worksheet) {
      throw new BadRequestException(
        `Sheet "${sheetName}" was not found.`,
      );
    }

    /*
     * Preview should normally pass the header row
     * already detected during upload.
     *
     * If it wasn't supplied, detect it again.
     */
    const actualHeaderRow =
      headerRowNumber ??
      this.detectHeaderRow(worksheet);

    const columns =
      this.extractColumns(
        worksheet,
        actualHeaderRow,
      );

    return this.extractAllRows(
      worksheet,
      actualHeaderRow,
      columns,
    );
  }

  private async loadWorkbook(
    fileBuffer: Buffer,
  ): Promise<ExcelJS.Workbook> {
    if (
      !fileBuffer ||
      fileBuffer.length === 0
    ) {
      throw new BadRequestException(
        'Uploaded file is empty.',
      );
    }

    const workbook =
      new ExcelJS.Workbook();

    try {
      await workbook.xlsx.load(
        fileBuffer as any,
      );
    } catch (error) {
      console.error(
        'XLSX PARSE ERROR:',
        error,
      );

      throw new BadRequestException(
        'Unable to read this Excel workbook.',
      );
    }

    return workbook;
  }

  /**
   * Attempts to determine which row contains
   * the actual column headers.
   *
   * This allows worksheets like:
   *
   * Row 1 -> report title
   * Row 2 -> school year
   * Row 3 -> blank
   * Row 4 -> LRN | NAME | BIRTHDAY | ...
   */
  private detectHeaderRow(
    worksheet: ExcelJS.Worksheet,
  ): number {
    const maxRows = Math.min(
      worksheet.rowCount,
      this.MAX_HEADER_SCAN_ROWS,
    );

    let bestRowNumber = 1;
    let bestScore =
      Number.NEGATIVE_INFINITY;

    for (
      let rowNumber = 1;
      rowNumber <= maxRows;
      rowNumber++
    ) {
      const row =
        worksheet.getRow(rowNumber);

      const values =
        this.getRowDisplayValues(row);

      if (values.length < 2) {
        continue;
      }

      const score =
        this.calculateHeaderScore(
          values,
        );

      if (score > bestScore) {
        bestScore = score;
        bestRowNumber =
          rowNumber;
      }
    }

    return bestRowNumber;
  }

  private calculateHeaderScore(
    values: string[],
  ): number {
    const normalized =
      values
        .map((value) =>
          value.trim(),
        )
        .filter(Boolean);

    if (normalized.length === 0) {
      return -100;
    }

    const uniqueValues =
      new Set(
        normalized.map((value) =>
          value.toUpperCase(),
        ),
      );

    const uniqueRatio =
      uniqueValues.size /
      normalized.length;

    /*
     * Header rows generally contain mostly text.
     */
    const textValues =
      normalized.filter((value) =>
        /[A-Za-z]/.test(value),
      );

    const textRatio =
      textValues.length /
      normalized.length;

    /*
     * Data rows often contain LRNs, phone numbers,
     * dates, Excel serials, etc.
     */
    const dataLikeValues =
      normalized.filter(
        (value) =>
          /^\d+$/.test(value) ||
          /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(
            value,
          ) ||
          /^09\d{9}$/.test(
            value,
          ),
      );

    const dataLikeRatio =
      dataLikeValues.length /
      normalized.length;

    /*
     * Common spreadsheet-header vocabulary.
     *
     * This isn't tied to elementary school
     * grades and doesn't determine mappings.
     * It only helps identify a header row.
     */
    const headerKeywords = [
      'LRN',
      'NAME',
      'BIRTH',
      'BIRTHDAY',
      'ADDRESS',
      'GRADE',
      'SECTION',
      'CONTACT',
      'PHONE',
      'MOTHER',
      'FATHER',
      'GUARDIAN',
      'REMARKS',
      'STATUS',
      'CITY',
      'MUNICIPALITY',
      'BARANGAY',
      'DATE',
      'EMAIL',
      'ID',
      'NUMBER',
      'SEX',
      'GENDER',
    ];

    let keywordMatches = 0;

    for (const value of normalized) {
      const upper =
        value.toUpperCase();

      if (
        headerKeywords.some(
          (keyword) =>
            upper.includes(
              keyword,
            ),
        )
      ) {
        keywordMatches++;
      }
    }

    /*
     * Merged report titles are commonly copied
     * across many cells by ExcelJS.
     *
     * Example:
     *
     * STUDENT MASTER DIRECTORY
     * STUDENT MASTER DIRECTORY
     * STUDENT MASTER DIRECTORY
     *
     * uniqueRatio will be very low, so they
     * receive a heavy penalty.
     */
    const duplicatePenalty =
      uniqueRatio < 0.5
        ? 10
        : 0;

    /*
     * More populated cells generally make
     * a stronger header candidate.
     */
    const populationScore =
      Math.min(
        normalized.length,
        15,
      );

    return (
      populationScore +
      uniqueRatio * 10 +
      textRatio * 5 +
      keywordMatches * 3 -
      dataLikeRatio * 8 -
      duplicatePenalty
    );
  }

  private getRowDisplayValues(
    row: ExcelJS.Row,
  ): string[] {
    const values: string[] =
      [];

    row.eachCell(
      {
        includeEmpty: false,
      },

      (cell) => {
        const text =
          String(
            cell.text ?? '',
          ).trim();

        if (text) {
          values.push(text);
        }
      },
    );

    return values;
  }

  private extractColumns(
    worksheet:
      ExcelJS.Worksheet,
    headerRowNumber: number,
  ): ParsedColumn[] {
    const headerRow =
      worksheet.getRow(
        headerRowNumber,
      );

    const columns:
      ParsedColumn[] = [];

    headerRow.eachCell(
      {
        includeEmpty: true,
      },

      (
        cell,
        columnNumber,
      ) => {
        const header =
          String(
            cell.text ?? '',
          ).trim();

        /*
         * Ignore completely empty header columns.
         */
        if (!header) {
          return;
        }

        columns.push({
          index:
            columnNumber,

          header,
        });
      },
    );

    if (columns.length === 0) {
      throw new BadRequestException(
        `No columns were detected in sheet "${worksheet.name}".`,
      );
    }

    return columns;
  }

  private extractSampleRows(
    worksheet:
      ExcelJS.Worksheet,
    headerRowNumber: number,
    columns: ParsedColumn[],
  ): ParsedRow[] {
    const sampleRows:
      ParsedRow[] = [];

    for (
      let rowNumber =
        headerRowNumber + 1;

      rowNumber <=
        worksheet.rowCount &&
      sampleRows.length <
        this.SAMPLE_LIMIT;

      rowNumber++
    ) {
      const row =
        this.parseRow(
          worksheet,
          rowNumber,
          columns,
        );

      if (!row) {
        continue;
      }

      sampleRows.push(row);
    }

    return sampleRows;
  }

  private extractAllRows(
    worksheet:
      ExcelJS.Worksheet,
    headerRowNumber: number,
    columns: ParsedColumn[],
  ): ParsedRow[] {
    const rows:
      ParsedRow[] = [];

    for (
      let rowNumber =
        headerRowNumber + 1;

      rowNumber <=
        worksheet.rowCount;

      rowNumber++
    ) {
      const row =
        this.parseRow(
          worksheet,
          rowNumber,
          columns,
        );

      if (!row) {
        continue;
      }

      rows.push(row);
    }

    return rows;
  }

  private parseRow(
    worksheet:
      ExcelJS.Worksheet,
    rowNumber: number,
    columns: ParsedColumn[],
  ): ParsedRow | null {
    const row =
      worksheet.getRow(
        rowNumber,
      );

    const cells:
      ParsedCell[] =
        columns.map(
          (column) => {
            const cell =
              row.getCell(
                column.index,
              );

            return {
              columnIndex:
                column.index,

              header:
                column.header,

              rawValue:
                cell.value ??
                null,

              displayValue:
                String(
                  cell.text ?? '',
                ).trim(),
            };
          },
        );

    const hasValue =
      cells.some((cell) => {
        if (
          cell.rawValue ===
            null ||
          cell.rawValue ===
            undefined
        ) {
          return false;
        }

        if (
          typeof cell.rawValue ===
          'string'
        ) {
          return (
            cell.rawValue.trim() !==
            ''
          );
        }

        return true;
      });

    if (!hasValue) {
      return null;
    }

    return {
      rowNumber,
      cells,
    };
  }
}