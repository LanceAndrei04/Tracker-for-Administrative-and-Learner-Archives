import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  ValidatedImportRow,
  ValidationIssue,
} from './validation.types';

@Injectable()
export class ImportDestinationValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(input: {
    schoolYearId: string;
    sectionId: string;
    rows: ValidatedImportRow[];
  }) {
    const section = await this.prisma.section.findUnique({
      where: { id: input.sectionId },
      include: {
        grade: true,
        schoolYear: true,
      },
    });

    if (!section) {
      throw new BadRequestException(
        'Selected section was not found.',
      );
    }

    if (section.schoolYearId !== input.schoolYearId) {
      throw new BadRequestException(
        'The selected section does not belong to the selected school year.',
      );
    }

    const lrns = [
      ...new Set(
        input.rows
          .map((row) => String(row.values.lrn ?? '').trim())
          .filter((lrn) => /^\d{12}$/.test(lrn)),
      ),
    ];

    const students = lrns.length
      ? await this.prisma.student.findMany({
          where: { lrn: { in: lrns } },
          select: { id: true, lrn: true },
        })
      : [];

    const enrollments = students.length
      ? await this.prisma.enrollment.findMany({
          where: {
            schoolYearId: input.schoolYearId,
            studentId: {
              in: students.map((student) => student.id),
            },
          },
          select: { studentId: true },
        })
      : [];

    const enrolledStudentIds = new Set(
      enrollments.map((enrollment) => enrollment.studentId),
    );
    const enrolledLrns = new Set(
      students
        .filter((student) => enrolledStudentIds.has(student.id))
        .map((student) => student.lrn)
        .filter((lrn): lrn is string => Boolean(lrn)),
    );

    const rows = input.rows.flatMap((row) => {
      const issues: ValidationIssue[] = [];
      const importedGrade = String(row.values.grade ?? '').trim();
      const lrn = String(row.values.lrn ?? '').trim();

      if (importedGrade && importedGrade !== section.grade.name) {
        issues.push({
          field: 'grade',
          type: 'ERROR',
          code: 'DESTINATION_GRADE_MISMATCH',
          message: `This row belongs to ${importedGrade}, but the selected section belongs to ${section.grade.name}.`,
        });
      }

      if (enrolledLrns.has(lrn)) {
        issues.push({
          field: 'lrn',
          type: 'ERROR',
          code: 'ALREADY_ENROLLED_FOR_SCHOOL_YEAR',
          message: `This student is already enrolled for school year ${section.schoolYear.label}.`,
        });
      }

      return issues.length
        ? [{ rowNumber: row.rowNumber, issues }]
        : [];
    });

    return {
      canConfirm: rows.length === 0,
      summary: {
        totalRows: input.rows.length,
        errorRows: rows.length,
        conflictRows: rows.filter((row) =>
          row.issues.some(
            (issue) =>
              issue.code === 'ALREADY_ENROLLED_FOR_SCHOOL_YEAR',
          ),
        ).length,
        gradeMismatchRows: rows.filter((row) =>
          row.issues.some(
            (issue) => issue.code === 'DESTINATION_GRADE_MISMATCH',
          ),
        ).length,
      },
      rows,
    };
  }
}
