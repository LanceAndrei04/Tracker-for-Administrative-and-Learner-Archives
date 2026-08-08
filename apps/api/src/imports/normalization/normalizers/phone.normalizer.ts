import { Injectable } from '@nestjs/common';
import { NormalizationResult } from '../normalization.types';

@Injectable()
export class PhoneNormalizer {
  normalize(value: unknown): NormalizationResult<string> {
    if (value === null || value === undefined) {
      return {
        originalValue: value,
        normalizedValue: null,
        success: true,
      };
    }

    let phone = String(value)
      .trim()
      .replace(/[^\d+]/g, '');

    if (!phone) {
      return {
        originalValue: value,
        normalizedValue: null,
        success: true,
      };
    }

    if (phone.startsWith('+63')) {
      phone = `0${phone.slice(3)}`;
    }

    if (
      phone.startsWith('9') &&
      phone.length === 10
    ) {
      phone = `0${phone}`;
    }

    let warning: string | undefined;

    if (phone.length !== 11) {
      warning =
        'Contact number does not contain 11 digits after normalization.';
    }

    return {
      originalValue: value,
      normalizedValue: phone,
      success: true,
      warning,
    };
  }
}