import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import type {
  ValidatedImportRow,
} from '../validation/validation.types';

@Injectable()
export class StudentImportPersistenceService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async import(
    importJobId: string,
    input: {
      schoolYearId: string;
      sectionId: string;
      rows: ValidatedImportRow[];
    },
  ) {
    const section =
      await this.prisma.section.findUnique({
        where: {
          id: input.sectionId,
        },

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

    if (
      section.schoolYearId !==
      input.schoolYearId
    ) {
      throw new BadRequestException(
        'The selected section does not belong to the selected school year.',
      );
    }

    /*
     * The entire import is transactional.
     *
     * If an unexpected DB failure occurs,
     * we do not leave the import half-finished.
     */
    return this.prisma.$transaction(
      async (tx) => {
        let createdStudents = 0;
        let reusedStudents = 0;
        let createdEnrollments = 0;

        /*
         * Replace old preview issues with
         * the latest confirmed validation state.
         */
        await tx.importIssue.deleteMany({
          where: {
            importJobId,
          },
        });

        for (const row of input.rows) {
          const values = row.values;

          const lrn = String(
            values.lrn ?? '',
          ).trim();

          if (!lrn) {
            throw new BadRequestException(
              `Row ${row.rowNumber} has no LRN.`,
            );
          }

          /*
           * Prevent accidentally importing a
           * Grade 6 row into a Grade 5 section.
           */
          const importedGrade = String(
            values.grade ?? '',
          ).trim();

          if (
            importedGrade &&
            importedGrade !==
              section.grade.name
          ) {
            throw new BadRequestException(
              `Row ${row.rowNumber} belongs to "${importedGrade}" but the selected section belongs to "${section.grade.name}".`,
            );
          }

          let student =
            await tx.student.findUnique({
              where: {
                lrn,
              },
            });

          /*
           * NEW STUDENT
           */
          if (!student) {
            student =
              await tx.student.create({
                data: {
                  lrn,

                  firstName:
                    this.requiredString(
                      values.firstName,
                      'firstName',
                      row.rowNumber,
                    ),

                  middleName:
                    this.optionalString(
                      values.middleName,
                    ),

                  lastName:
                    this.requiredString(
                      values.lastName,
                      'lastName',
                      row.rowNumber,
                    ),

                  suffix:
                    this.optionalString(
                      values.suffix,
                    ),

                  birthday:
                    this.optionalDate(
                      values.birthday,
                    ),

                  birthplace:
                    this.optionalString(
                      values.birthplace,
                    ),

                  address:
                    this.optionalString(
                      values.address,
                    ),

                  fatherName:
                    this.optionalString(
                      values.fatherName,
                    ),

                  motherName:
                    this.optionalString(
                      values.motherName,
                    ),

                  guardianName:
                    this.optionalString(
                      values.guardianName,
                    ),

                  contactNumber:
                    this.optionalString(
                      values.contactNumber,
                    ),

                  remarks:
                    this.optionalString(
                      values.remarks,
                    ),
                },
              });

            createdStudents++;
          } else {
            reusedStudents++;
          }

          /*
           * Existing student is allowed,
           * but only one Enrollment per
           * school year is allowed.
           */
          const existingEnrollment =
            await tx.enrollment.findUnique({
              where: {
                studentId_schoolYearId: {
                  studentId:
                    student.id,

                  schoolYearId:
                    input.schoolYearId,
                },
              },
            });

          if (existingEnrollment) {
            throw new BadRequestException(
              `Student with LRN ${lrn} is already enrolled for school year ${section.schoolYear.label}.`,
            );
          }

          await tx.enrollment.create({
            data: {
              studentId:
                student.id,

              sectionId:
                input.sectionId,

              schoolYearId:
                input.schoolYearId,

              status:
                'ACTIVE',
            },
          });

          createdEnrollments++;

          /*
           * Persist warnings for audit/history.
           *
           * Errors are blocked before this
           * service is called.
           */
          for (const issue of row.issues) {
            await tx.importIssue.create({
              data: {
                importJobId,

                rowNumber:
                  row.rowNumber,

                targetField:
                  issue.field,

                severity:
                  issue.type,

                code:
                  issue.code,

                message:
                  issue.message,

                normalizedValue:
                  this.toNullableString(
                    values[
                      issue.field
                    ],
                  ),
              },
            });
          }
        }

        await tx.importJob.update({
          where: {
            id: importJobId,
          },

          data: {
            schoolYearId:
              input.schoolYearId,

            sheetName:
              null,

            status:
              'COMPLETED',

            totalRows:
              input.rows.length,

            validRows:
              input.rows.filter(
                (row) =>
                  row.issues.length ===
                  0,
              ).length,

            warningRows:
              input.rows.filter(
                (row) =>
                  row.issues.some(
                    (issue) =>
                      issue.type ===
                      'WARNING',
                  ),
              ).length,

            errorRows: 0,

            importedRows:
              createdEnrollments,

            completedAt:
              new Date(),
          },
        });

        return {
          createdStudents,
          reusedStudents,
          createdEnrollments,
          importedRows:
            createdEnrollments,
        };
      },
    );
  }

  private requiredString(
    value: unknown,
    field: string,
    rowNumber: number,
  ) {
    const result =
      this.optionalString(value);

    if (!result) {
      throw new BadRequestException(
        `${field} is required on row ${rowNumber}.`,
      );
    }

    return result;
  }

  private optionalString(
    value: unknown,
  ): string | null {
    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    const result =
      String(value).trim();

    return result || null;
  }

  private optionalDate(
    value: unknown,
  ): Date | null {
    if (!value) {
      return null;
    }

    const date =
      new Date(String(value));

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return null;
    }

    return date;
  }

  private toNullableString(
    value: unknown,
  ): string | null {
    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    return String(value);
  }
}