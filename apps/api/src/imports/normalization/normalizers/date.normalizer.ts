import { Injectable } from '@nestjs/common';
import { NormalizationResult } from '../normalization.types';

@Injectable()
export class DateNormalizer {
  normalize(
    value: unknown,
    displayValue?: string,
  ): NormalizationResult<string> {
    if (value === null || value === undefined) {
      return {
        originalValue: value,
        normalizedValue: null,
        success: true,
      };
    }

    // Excel serial date
    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      const date = this.fromExcelSerial(value);

      return {
        originalValue: value,
        normalizedValue: this.formatUTCDate(date),
        success: true,
      };
    }

    // ExcelJS actual Date object
    if (value instanceof Date) {
      return {
        originalValue: value,
        normalizedValue: this.formatLocalDate(value),
        success: true,
      };
    }

    const stringValue = String(value).trim();

    if (!stringValue) {
      return {
        originalValue: value,
        normalizedValue: null,
        success: true,
      };
    }

    /*
     * Already ISO-like:
     * 2014-02-05
     * 2014-02-05T00:00:00.000Z
     */
    const isoMatch = stringValue.match(
      /^(\d{4})-(\d{2})-(\d{2})/,
    );

    if (isoMatch) {
      return {
        originalValue: value,
        normalizedValue:
          `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`,
        success: true,
      };
    }

    /*
     * Common numeric formats:
     * 01/20/2014
     * 1/20/2014
     *
     * Assumption for Tala:
     * MM/DD/YYYY
     */
    const numericMatch = stringValue.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    );

    if (numericMatch) {
      const month = Number(numericMatch[1]);
      const day = Number(numericMatch[2]);
      const year = Number(numericMatch[3]);

      if (this.isValidDate(year, month, day)) {
        return {
          originalValue: value,
          normalizedValue: this.buildDateString(
            year,
            month,
            day,
          ),
          success: true,
        };
      }
    }

    /*
     * Examples:
     * January 20, 2014
     * Jan 20, 2014
     */
    const namedDate =
      this.parseNamedMonthDate(stringValue);

    if (namedDate) {
      return {
        originalValue: value,
        normalizedValue: namedDate,
        success: true,
      };
    }

    /*
     * Last fallback.
     */
    if (displayValue) {
      const displayIso = displayValue.match(
        /^(\d{4})-(\d{2})-(\d{2})/,
      );

      if (displayIso) {
        return {
          originalValue: value,
          normalizedValue:
            `${displayIso[1]}-${displayIso[2]}-${displayIso[3]}`,
          success: true,
        };
      }
    }

    return {
      originalValue: value,
      normalizedValue: null,
      success: false,
      error: `Unable to normalize date value: ${stringValue}`,
    };
  }

  private fromExcelSerial(serial: number): Date {
    const millisecondsPerDay =
      24 * 60 * 60 * 1000;

    const excelEpoch =
      Date.UTC(1899, 11, 30);

    return new Date(
      excelEpoch +
        Math.floor(serial) *
          millisecondsPerDay,
    );
  }

  private parseNamedMonthDate(
    value: string,
  ): string | null {
    const months: Record<string, number> = {
      january: 1,
      jan: 1,

      february: 2,
      feb: 2,

      march: 3,
      mar: 3,

      april: 4,
      apr: 4,

      may: 5,

      june: 6,
      jun: 6,

      july: 7,
      jul: 7,

      august: 8,
      aug: 8,

      september: 9,
      sep: 9,
      sept: 9,

      october: 10,
      oct: 10,

      november: 11,
      nov: 11,

      december: 12,
      dec: 12,
    };

    const match = value.match(
      /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/,
    );

    if (!match) {
      return null;
    }

    const month =
      months[match[1].toLowerCase()];

    const day = Number(match[2]);
    const year = Number(match[3]);

    if (
      !month ||
      !this.isValidDate(year, month, day)
    ) {
      return null;
    }

    return this.buildDateString(
      year,
      month,
      day,
    );
  }

  private isValidDate(
    year: number,
    month: number,
    day: number,
  ): boolean {
    const date = new Date(
      Date.UTC(year, month - 1, day),
    );

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }

  private buildDateString(
    year: number,
    month: number,
    day: number,
  ): string {
    return [
      year,
      String(month).padStart(2, '0'),
      String(day).padStart(2, '0'),
    ].join('-');
  }

  private formatUTCDate(date: Date): string {
    return this.buildDateString(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
    );
  }

  private formatLocalDate(date: Date): string {
    return this.buildDateString(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    );
  }
}