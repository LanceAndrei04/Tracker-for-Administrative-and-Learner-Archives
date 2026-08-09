import { Injectable } from '@nestjs/common';
import { NormalizationResult } from '../normalization.types';

@Injectable()
export class GradeNormalizer {
  normalize(value: unknown): NormalizationResult<string> {
    if (value === null || value === undefined) {
      return {
        originalValue: value,
        normalizedValue: null,
        success: true,
      };
    }

    const raw = String(value)
      .trim()
      .toUpperCase()
      .replace(/\./g, '');

    if (!raw) {
      return {
        originalValue: value,
        normalizedValue: null,
        success: true,
      };
    }

    if (
      raw === 'K' ||
      raw === 'KINDER' ||
      raw === 'KINDERGARTEN'
    ) {
      return {
        originalValue: value,
        normalizedValue: 'Kinder',
        success: true,
      };
    }

    const numeric = this.extractGradeNumber(raw);

    if (
      numeric !== null &&
      numeric >= 1 &&
      numeric <= 12
    ) {
      return {
        originalValue: value,
        normalizedValue: `Grade ${numeric}`,
        success: true,
      };
    }

    return {
      originalValue: value,
      normalizedValue: null,
      success: false,
      error: `Unknown grade value: ${value}`,
    };
  }

  private extractGradeNumber(
    value: string,
  ): number | null {
    const directPatterns = [
      /^(\d{1,2})$/,
      /^G(\d{1,2})$/,
      /^GR\s*(\d{1,2})$/,
      /^GRADE\s*(\d{1,2})$/,
    ];

    for (const pattern of directPatterns) {
      const match = value.match(pattern);

      if (match) {
        return Number(match[1]);
      }
    }

    const romanMap: Record<string, number> = {
      I: 1,
      II: 2,
      III: 3,
      IV: 4,
      V: 5,
      VI: 6,
      VII: 7,
      VIII: 8,
      IX: 9,
      X: 10,
      XI: 11,
      XII: 12,
    };

    if (romanMap[value]) {
      return romanMap[value];
    }

    const gradeRomanMatch = value.match(
      /^(?:GRADE|GR|G)\s*(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/,
    );

    if (gradeRomanMatch) {
      return romanMap[gradeRomanMatch[1]] ?? null;
    }

    return null;
  }
}