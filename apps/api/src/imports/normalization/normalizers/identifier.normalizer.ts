import { Injectable } from '@nestjs/common';
import { NormalizationResult } from '../normalization.types';

@Injectable()
export class IdentifierNormalizer {
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
      .replace(/\s+/g, '');

    if (!normalized) {
      return {
        originalValue: value,
        normalizedValue: null,
        success: true,
      };
    }

    return {
      originalValue: value,
      normalizedValue: normalized,
      success: true,
    };
  }
}