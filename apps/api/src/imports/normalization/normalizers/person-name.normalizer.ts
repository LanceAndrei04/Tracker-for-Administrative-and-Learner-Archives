import { Injectable } from '@nestjs/common';
import {
  NormalizationResult,
  PersonNameValue,
} from '../normalization.types';

@Injectable()
export class PersonNameNormalizer {
  normalize(
    value: unknown,
  ): NormalizationResult<PersonNameValue> {
    if (value === null || value === undefined) {
      return {
        originalValue: value,
        normalizedValue: null,
        success: false,
        error: 'Student name is empty.',
      };
    }

    const raw = String(value)
      .trim()
      .replace(/\s+/g, ' ');

    if (!raw) {
      return {
        originalValue: value,
        normalizedValue: null,
        success: false,
        error: 'Student name is empty.',
      };
    }

    if (raw.includes(',')) {
      return this.parseLastFirstFormat(
        value,
        raw,
      );
    }

    return this.parseFirstLastFormat(
      value,
      raw,
    );
  }

  private parseLastFirstFormat(
    originalValue: unknown,
    value: string,
  ): NormalizationResult<PersonNameValue> {
    const [lastNamePart, remainingPart] =
      value.split(',', 2);

    const lastName =
      this.toTitleCase(lastNamePart);

    const remaining = remainingPart
      ?.trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!remaining?.length) {
      return {
        originalValue,
        normalizedValue: null,
        success: false,
        error: `Unable to parse name: ${value}`,
      };
    }

    const suffix =
      this.extractSuffix(remaining);

    let firstName: string;
    let middleName: string | null = null;

    if (remaining.length === 1) {
      firstName = remaining[0];
    } else {
      /*
       * Initial assumption:
       * last token = middle name/initial
       * everything before it = first name
       *
       * Example:
       * MARK ANTHONY L.
       *
       * firstName  = MARK ANTHONY
       * middleName = L.
       */
      middleName =
        remaining.pop() ?? null;

      firstName = remaining.join(' ');
    }

    return {
      originalValue,
      normalizedValue: {
        firstName:
          this.toTitleCase(firstName),
        middleName: middleName
          ? this.toTitleCase(middleName)
          : null,
        lastName,
        suffix,
      },
      success: true,
    };
  }

  private parseFirstLastFormat(
    originalValue: unknown,
    value: string,
  ): NormalizationResult<PersonNameValue> {
    const parts = value
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length < 2) {
      return {
        originalValue,
        normalizedValue: null,
        success: false,
        error: `Unable to confidently parse name: ${value}`,
      };
    }

    const suffix =
      this.extractSuffix(parts);

    const firstName = parts.shift()!;
    const lastName = parts.pop()!;

    const middleName =
      parts.length > 0
        ? parts.join(' ')
        : null;

    return {
      originalValue,
      normalizedValue: {
        firstName:
          this.toTitleCase(firstName),
        middleName: middleName
          ? this.toTitleCase(middleName)
          : null,
        lastName:
          this.toTitleCase(lastName),
        suffix,
      },
      success: true,
      warning:
        'Name had no comma, so first/middle/last ordering was inferred.',
    };
  }

  private extractSuffix(
    parts: string[],
  ): string | null {
    if (parts.length === 0) {
      return null;
    }

    const last = parts[
      parts.length - 1
    ]
      .replace(/\./g, '')
      .toUpperCase();

    const suffixes = [
      'JR',
      'SR',
      'II',
      'III',
      'IV',
    ];

    if (!suffixes.includes(last)) {
      return null;
    }

    const suffix = parts.pop();

    return suffix
      ? this.toTitleCase(suffix)
      : null;
  }

  private toTitleCase(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase(),
      );
  }
}