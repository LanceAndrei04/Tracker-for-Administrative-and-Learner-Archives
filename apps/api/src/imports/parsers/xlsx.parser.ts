import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class XlsxParser {
  async parse(fileBuffer: Buffer) {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException(
        'Uploaded file is empty.',
      );
    }

    const signature = fileBuffer
      .subarray(0, 2)
      .toString();

    if (signature !== 'PK') {
      throw new BadRequestException(
        'The uploaded file is not a valid XLSX file.',
      );
    }

    try {
      const workbook = new ExcelJS.Workbook();

      await workbook.xlsx.load(fileBuffer as any);

      return workbook.worksheets.map((worksheet) => {
        const headerRow = worksheet.getRow(1);

        const columns: {
          index: number;
          header: string;
        }[] = [];

        headerRow.eachCell(
          { includeEmpty: true },
          (cell, columnNumber) => {
            columns.push({
              index: columnNumber,
              header: String(cell.text ?? '').trim(),
            });
          },
        );

        const sampleRows: {
          rowNumber: number;
          cells: {
            columnIndex: number;
            header: string;
            rawValue: unknown;
            displayValue: string;
          }[];
        }[] = [];

        const lastSampleRow = Math.min(
          worksheet.rowCount,
          6,
        );

        for (
          let rowNumber = 2;
          rowNumber <= lastSampleRow;
          rowNumber++
        ) {
          const row = worksheet.getRow(rowNumber);

          const cells = columns.map((column) => {
            const cell = row.getCell(column.index);

            return {
              columnIndex: column.index,
              header: column.header,
              rawValue: cell.value ?? null,
              displayValue: cell.text ?? '',
            };
          });

          sampleRows.push({
            rowNumber,
            cells,
          });
        }

        return {
          name: worksheet.name,
          rowCount: worksheet.rowCount,
          columns,
          sampleRows,
        };
      });
    } catch (error) {
      console.error('XLSX PARSE ERROR:', error);

      throw new BadRequestException(
        'Unable to read this Excel workbook.',
      );
    }
  }
}