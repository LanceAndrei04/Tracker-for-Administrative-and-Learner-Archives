import { Injectable } from '@nestjs/common';

import type {
  ValidationIssue,
} from '../validation.types';

@Injectable()
export class StudentValidator {
  validate(
    values: Record<string, unknown>,
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    this.validateLrn(values, issues);
    this.validateName(values, issues);
    this.validateBirthday(values, issues);
    this.validateContactNumber(
      values,
      issues,
    );

    return issues;
  }

  private validateLrn(
    values: Record<string, unknown>,
    issues: ValidationIssue[],
  ) {
    const value = values.lrn;

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      issues.push({
        field: 'lrn',
        type: 'ERROR',
        code: 'LRN_REQUIRED',
        message:
          'LRN is required for student import.',
      });

      return;
    }

    const lrn = String(value).trim();

    if (!/^\d{12}$/.test(lrn)) {
      issues.push({
        field: 'lrn',
        type: 'ERROR',
        code: 'INVALID_LRN',
        message:
          'LRN must contain exactly 12 digits.',
      });
    }
  }

  private validateName(
    values: Record<string, unknown>,
    issues: ValidationIssue[],
  ) {
    const firstName = String(
      values.firstName ?? '',
    ).trim();

    const lastName = String(
      values.lastName ?? '',
    ).trim();

    if (!firstName) {
      issues.push({
        field: 'firstName',
        type: 'ERROR',
        code: 'FIRST_NAME_REQUIRED',
        message:
          'First name is required.',
      });
    }

    if (!lastName) {
      issues.push({
        field: 'lastName',
        type: 'ERROR',
        code: 'LAST_NAME_REQUIRED',
        message:
          'Last name is required.',
      });
    }
  }

  private validateBirthday(
    values: Record<string, unknown>,
    issues: ValidationIssue[],
  ) {
    const value = values.birthday;

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      issues.push({
        field: 'birthday',
        type: 'WARNING',
        code: 'BIRTHDAY_NOT_PROVIDED',
        message: 'Birthday not provided.',
      });

      return;
    }

    const birthday = new Date(
      String(value),
    );

    if (
      Number.isNaN(
        birthday.getTime(),
      )
    ) {
      issues.push({
        field: 'birthday',
        type: 'ERROR',
        code: 'INVALID_BIRTHDAY',
        message:
          'Birthday is not a valid date.',
      });

      return;
    }

    const today = new Date();

    if (birthday > today) {
      issues.push({
        field: 'birthday',
        type: 'ERROR',
        code: 'BIRTHDAY_IN_FUTURE',
        message:
          'Birthday cannot be in the future.',
      });
    }
  }

  private validateContactNumber(
    values: Record<string, unknown>,
    issues: ValidationIssue[],
  ) {
    const value =
      values.contactNumber;

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return;
    }

    const phone = String(
      value,
    ).trim();

    if (!/^09\d{9}$/.test(phone)) {
      issues.push({
        field: 'contactNumber',
        type: 'WARNING',
        code: 'INVALID_CONTACT_NUMBER',
        message:
          'Contact number does not match the expected Philippine mobile format.',
      });
    }
  }
}
