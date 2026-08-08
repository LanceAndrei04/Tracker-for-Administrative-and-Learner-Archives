import { Injectable } from '@nestjs/common';
import { NormalizationResult } from '../normalization.types';

@Injectable()
export class TextNormalizer {
  normalize(value: unknown): NormalizationResult<string> {
    if (value === null || value === undefined) {
      return {
        originalValue: value,
        normalizedValue: null,
        success: true,
      };
    }

    const normalized = String(value)
      .trim()
      .replace(/\s+/g, ' ');

    return {
      originalValue: value,
      normalizedValue:
        normalized.length > 0 ? normalized : null,
      success: true,
    };
  }
}