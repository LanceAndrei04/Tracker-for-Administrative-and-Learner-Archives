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

    const aliases: Record<string, string> = {
      K: 'Kinder',
      KINDER: 'Kinder',
      KINDERGARTEN: 'Kinder',

      '1': 'Grade 1',
      I: 'Grade 1',
      G1: 'Grade 1',
      'GR 1': 'Grade 1',
      'GRADE 1': 'Grade 1',

      '2': 'Grade 2',
      II: 'Grade 2',
      G2: 'Grade 2',
      'GR 2': 'Grade 2',
      'GRADE 2': 'Grade 2',

      '3': 'Grade 3',
      III: 'Grade 3',
      G3: 'Grade 3',
      'GR 3': 'Grade 3',
      'GRADE 3': 'Grade 3',

      '4': 'Grade 4',
      IV: 'Grade 4',
      G4: 'Grade 4',
      'GR 4': 'Grade 4',
      'GRADE 4': 'Grade 4',

      '5': 'Grade 5',
      V: 'Grade 5',
      G5: 'Grade 5',
      'GR 5': 'Grade 5',
      'GRADE 5': 'Grade 5',

      '6': 'Grade 6',
      VI: 'Grade 6',
      G6: 'Grade 6',
      'GR 6': 'Grade 6',
      'GRADE 6': 'Grade 6',
    };

    const normalized = aliases[raw];

    if (!normalized) {
      return {
        originalValue: value,
        normalizedValue: null,
        success: false,
        error: `Unknown grade value: ${value}`,
      };
    }

    return {
      originalValue: value,
      normalizedValue: normalized,
      success: true,
    };
  }
}