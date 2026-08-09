import { Injectable } from '@nestjs/common';

import type {
  NormalizedImportRow,
} from '../normalization/normalization.types';

import type {
  ImportTarget,
} from '../mapping/mapping.types';

import {
  ValidationIssue,
  ValidationResult,
  ValidatedImportRow,
} from './validation.types';

import { StudentValidator } from './validators/student.validator';

import { GradesRepository } from '../../grades/grades.repository';
import { StudentsRepository } from '../../students/students.repository';

@Injectable()
export class ImportValidationService {
  constructor(
    private readonly studentValidator:
      StudentValidator,

    private readonly gradesRepository:
      GradesRepository,

    private readonly studentsRepository:
        StudentsRepository
  ) {}

    async validate(
    target: ImportTarget,
    rows: NormalizedImportRow[],
    ): Promise<ValidationResult> {
    const grades =
        await this.gradesRepository.findAll();

    const configuredGrades = new Set(
        grades.map((grade) => grade.name),
    );

    const validatedRows: ValidatedImportRow[] =
        rows.map((row) => {
        const normalizationIssues =
            this.mapNormalizationIssues(
            row.issues,
            );

        const domainIssues =
            this.validateRow(
            target,
            row.values,
            );

        const gradeIssues =
            this.validateConfiguredGrade(
            row.values,
            configuredGrades,
            );

        return {
            rowNumber: row.rowNumber,
            values: row.values,

            issues: [
            ...normalizationIssues,
            ...domainIssues,
            ...gradeIssues,
            ],
        };
        });

    this.detectDuplicateLrns(
        validatedRows,
    );

    if (target === 'STUDENT') {
        await this.detectExistingStudents(
        validatedRows,
        );
    }

    return {
        rows: validatedRows,
        summary:
        this.buildSummary(
            validatedRows,
        ),
    };
    }

  private validateRow(
    target: ImportTarget,
    values: Record<string, unknown>,
  ): ValidationIssue[] {
    switch (target) {
      case 'STUDENT':
        return this.studentValidator.validate(
          values,
        );

      default:
        return [];
    }
  }

private async detectExistingStudents(
    rows: ValidatedImportRow[],
    ) {
    const lrns = [
        ...new Set(
        rows
            .map((row) =>
            String(
                row.values.lrn ?? '',
            ).trim(),
            )
            .filter((lrn) =>
            /^\d{12}$/.test(lrn),
            ),
        ),
    ];

    if (lrns.length === 0) {
        return;
    }

    const existingStudents =
        await this.studentsRepository.findByLrns(
        lrns,
        );

    const existingByLrn = new Map(
        existingStudents
        .filter(
            (student) =>
            student.lrn !== null,
        )
        .map((student) => [
            student.lrn!,
            student,
        ]),
    );

    for (const row of rows) {
        const lrn = String(
        row.values.lrn ?? '',
        ).trim();

        if (!lrn) {
        continue;
        }

        const existing =
        existingByLrn.get(lrn);

        if (!existing) {
        continue;
        }

        row.issues.push({
        field: 'lrn',
        type: 'ERROR',
        code: 'LRN_ALREADY_EXISTS',
        message:
            `A student with LRN ${lrn} already exists in the system.`,
        });
    }
    }

  private validateConfiguredGrade(
    values: Record<string, unknown>,
    configuredGrades: Set<string>,
  ): ValidationIssue[] {
    const value = values.grade;

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return [];
    }

    const grade = String(value).trim();

    if (configuredGrades.has(grade)) {
      return [];
    }

    return [
      {
        field: 'grade',
        type: 'ERROR',
        code: 'GRADE_NOT_CONFIGURED',
        message:
          `Grade "${grade}" is not configured for this school.`,
      },
    ];
  }

  private detectDuplicateLrns(
    rows: ValidatedImportRow[],
  ) {
    const occurrences = new Map<
      string,
      number[]
    >();

    for (const row of rows) {
      const value = row.values.lrn;

      if (
        value === null ||
        value === undefined ||
        value === ''
      ) {
        continue;
      }

      const lrn =
        String(value).trim();

      /*
       * Ignore invalid LRN values here.
       * StudentValidator already reports them.
       */
      if (!/^\d{12}$/.test(lrn)) {
        continue;
      }

      const rowNumbers =
        occurrences.get(lrn) ?? [];

      rowNumbers.push(
        row.rowNumber,
      );

      occurrences.set(
        lrn,
        rowNumbers,
      );
    }

    for (const [
      lrn,
      rowNumbers,
    ] of occurrences) {
      if (
        rowNumbers.length <= 1
      ) {
        continue;
      }

      for (const row of rows) {
        const rowLrn =
          String(
            row.values.lrn ?? '',
          ).trim();

        if (rowLrn !== lrn) {
          continue;
        }

        row.issues.push({
          field: 'lrn',
          type: 'ERROR',
          code: 'DUPLICATE_LRN',
          message:
            `LRN is duplicated within this import on rows ${rowNumbers.join(', ')}.`,
        });
      }
    }
  }

  private mapNormalizationIssues(
    issues: {
      field: string;
      type: 'WARNING' | 'ERROR';
      message: string;
    }[],
  ): ValidationIssue[] {
    return issues.map((issue) => ({
      field: issue.field,

      type: issue.type,

      code:
        issue.type === 'ERROR'
          ? 'NORMALIZATION_ERROR'
          : 'NORMALIZATION_WARNING',

      message: issue.message,
    }));
  }

  private buildSummary(
    rows: ValidatedImportRow[],
  ) {
    let validRows = 0;
    let warningRows = 0;
    let errorRows = 0;

    for (const row of rows) {
      const hasError =
        row.issues.some(
          (issue) =>
            issue.type === 'ERROR',
        );

      const hasWarning =
        row.issues.some(
          (issue) =>
            issue.type === 'WARNING',
        );

      if (hasError) {
        errorRows++;
        continue;
      }

      if (hasWarning) {
        warningRows++;
        continue;
      }

      validRows++;
    }

    return {
      totalRows: rows.length,
      validRows,
      warningRows,
      errorRows,
    };
  }
}