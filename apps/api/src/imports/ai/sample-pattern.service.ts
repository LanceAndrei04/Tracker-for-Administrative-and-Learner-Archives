import { Injectable } from '@nestjs/common';

@Injectable()
export class SamplePatternService {
  describe(value: unknown): string {
    if (value === null || value === undefined) {
      return 'empty value';
    }

    if (value instanceof Date) {
      return 'date value';
    }

    if (typeof value === 'number') {
      return this.describeNumber(value);
    }

    const text = String(value).trim();

    if (!text) {
      return 'empty value';
    }

    if (this.looksLikeLrn(text)) {
      return '12-digit numeric identifier';
    }

    if (this.looksLikePhone(text)) {
      return 'phone-like numeric value';
    }

    if (this.looksLikeDate(text)) {
      return 'date-like value';
    }

    if (this.looksLikeEmail(text)) {
      return 'email-like value';
    }

    if (this.looksLikeGrade(text)) {
      return 'grade-level value';
    }

    if (this.looksLikePersonName(text)) {
      return 'person-name-like value';
    }

    if (this.looksLikeDetailedAddress(text)) {
      return 'detailed geographic address';
    }

    if (this.looksLikeShortLocation(text)) {
      return 'short geographic location';
    }

    if (this.looksLikeStatus(text)) {
      return 'status-like categorical value';
    }

    return this.describeGeneralText(text);
  }

  describeMany(
    values: unknown[],
    maxPatterns = 5,
  ): string[] {
    const patterns = values
      .map((value) => this.describe(value))
      .filter(Boolean);

    return [...new Set(patterns)].slice(
      0,
      maxPatterns,
    );
  }

  private describeNumber(value: number): string {
    const text = String(value);

    if (text.length === 12) {
      return '12-digit numeric identifier';
    }

    if (
      text.length === 10 ||
      text.length === 11
    ) {
      return 'phone-like numeric value';
    }

    /*
     * Common range where Excel serial dates may appear.
     * We deliberately do not convert it here because
     * this service only describes shape.
     */
    if (value >= 20000 && value <= 80000) {
      return 'possible Excel date serial';
    }

    if (Number.isInteger(value)) {
      return 'integer numeric value';
    }

    return 'decimal numeric value';
  }

  private looksLikeLrn(value: string): boolean {
    const digits = value.replace(/\D/g, '');

    return digits.length === 12;
  }

  private looksLikePhone(value: string): boolean {
    const digits = value.replace(/\D/g, '');

    if (
      digits.length < 10 ||
      digits.length > 13
    ) {
      return false;
    }

    return (
      digits.startsWith('09') ||
      digits.startsWith('9') ||
      digits.startsWith('63')
    );
  }

  private looksLikeDate(value: string): boolean {
    const patterns = [
      /^\d{4}-\d{1,2}-\d{1,2}/,
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
      /^\d{1,2}-\d{1,2}-\d{2,4}$/,
      /^[A-Za-z]+ \d{1,2},? \d{4}$/,
    ];

    return patterns.some((pattern) =>
      pattern.test(value),
    );
  }

  private looksLikeEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value,
    );
  }

  private looksLikeGrade(value: string): boolean {
    const normalized = value
      .toUpperCase()
      .replace(/\./g, '')
      .trim();

    return [
      'K',
      'KINDER',
      'KINDERGARTEN',

      '1',
      '2',
      '3',
      '4',
      '5',
      '6',

      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',

      'G1',
      'G2',
      'G3',
      'G4',
      'G5',
      'G6',

      'GR 1',
      'GR 2',
      'GR 3',
      'GR 4',
      'GR 5',
      'GR 6',

      'GRADE 1',
      'GRADE 2',
      'GRADE 3',
      'GRADE 4',
      'GRADE 5',
      'GRADE 6',
    ].includes(normalized);
  }

 private looksLikePersonName(
  value: string,
): boolean {
  if (!value.includes(',')) {
    return false;
  }

  const [left, right] = value
    .split(',', 2)
    .map((part) => part.trim());

  if (!left || !right) {
    return false;
  }

  const namePattern =
    /^[A-Za-zÀ-ÿ.'-]+(?:\s+[A-Za-zÀ-ÿ.'-]+)*$/;

  if (
    !namePattern.test(left) ||
    !namePattern.test(right)
  ) {
    return false;
  }

  const upper = value.toUpperCase();

  const geographicTerms = [
    'CITY',
    'PROVINCE',
    'MUNICIPALITY',
    'BARANGAY',
    'BRGY',
    'PUROK',
    'SITIO',
  ];

  if (
    geographicTerms.some((term) =>
      upper.includes(term),
    )
  ) {
    return false;
  }

  /*
   * Imported learner names in this format are
   * generally:
   *
   * LAST NAME, FIRST NAME MIDDLE NAME
   *
   * Requiring at least two tokens on the right
   * reduces confusion with:
   *
   * Pulilan, Bulacan
   */
  const rightTokens = right
    .split(/\s+/)
    .filter(Boolean);

  return rightTokens.length >= 2;
}
  private looksLikeDetailedAddress(
    value: string,
  ): boolean {
    const normalized = value.toLowerCase();

    const addressIndicators = [
      'purok',
      'street',
      'st.',
      'barangay',
      'brgy',
      'sitio',
      'blk',
      'block',
      'lot',
      'phase',
      'road',
      'rd.',
    ];

    if (
      addressIndicators.some((indicator) =>
        normalized.includes(indicator),
      )
    ) {
      return true;
    }

    /*
     * Several comma-separated geographic
     * components usually suggest a detailed address.
     */
    return value.split(',').length >= 3;
  }

  private looksLikeShortLocation(
    value: string,
  ): boolean {
    const parts = value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    /*
     * "Pulilan, Bulacan"
     * "Malolos, Bulacan"
     */
    return (
      parts.length === 2 &&
      parts.every((part) =>
        /^[A-Za-zÀ-ÿ0-9.'\-\s]+$/.test(part),
      )
    );
  }

  private looksLikeStatus(value: string): boolean {
    const normalized = value
      .trim()
      .toUpperCase();

    return [
      'ACTIVE',
      'INACTIVE',
      'TRANSFERRED',
      'TRANSFEREE',
      'WITHDRAWN',
      'COMPLETED',
      'GRADUATED',
    ].includes(normalized);
  }

  private describeGeneralText(
    value: string,
  ): string {
    if (value.length <= 20) {
      return 'short text value';
    }

    if (value.length <= 80) {
      return 'medium-length text value';
    }

    return 'long text value';
  }
}