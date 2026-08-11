import { BadRequestException } from '@nestjs/common';

jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { ImportDestinationValidationService } from './import-destination-validation.service';

describe('ImportDestinationValidationService', () => {
  const prisma = {
    section: { findUnique: jest.fn() },
    student: { findMany: jest.fn() },
    enrollment: { findMany: jest.fn() },
  };

  const service = new ImportDestinationValidationService(prisma as never);
  const rows = [
    {
      rowNumber: 5,
      values: {
        lrn: '123456789012',
        firstName: 'Ana',
        lastName: 'Santos',
        grade: 'Grade 5',
      },
      issues: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.section.findUnique.mockResolvedValue({
      id: 'section-1',
      schoolYearId: 'year-1',
      grade: { name: 'Grade 5' },
      schoolYear: { label: '2026-2027' },
    });
    prisma.student.findMany.mockResolvedValue([]);
    prisma.enrollment.findMany.mockResolvedValue([]);
  });

  it('rejects a section from another school year', async () => {
    prisma.section.findUnique.mockResolvedValue({
      id: 'section-1',
      schoolYearId: 'year-2',
      grade: { name: 'Grade 5' },
      schoolYear: { label: '2027-2028' },
    });

    await expect(
      service.validate({
        schoolYearId: 'year-1',
        sectionId: 'section-1',
        rows,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns a blocking issue for a destination grade mismatch', async () => {
    const result = await service.validate({
      schoolYearId: 'year-1',
      sectionId: 'section-1',
      rows: [
        {
          ...rows[0],
          values: { ...rows[0].values, grade: 'Grade 6' },
        },
      ],
    });

    expect(result.canConfirm).toBe(false);
    expect(result.rows[0].issues[0]).toMatchObject({
      type: 'ERROR',
      code: 'DESTINATION_GRADE_MISMATCH',
      field: 'grade',
    });
  });

  it('returns a blocking issue when the student is already enrolled', async () => {
    prisma.student.findMany.mockResolvedValue([
      { id: 'student-1', lrn: '123456789012' },
    ]);
    prisma.enrollment.findMany.mockResolvedValue([
      { studentId: 'student-1' },
    ]);

    const result = await service.validate({
      schoolYearId: 'year-1',
      sectionId: 'section-1',
      rows,
    });

    expect(result.canConfirm).toBe(false);
    expect(result.rows[0].issues[0]).toEqual({
      field: 'lrn',
      type: 'ERROR',
      code: 'ALREADY_ENROLLED_FOR_SCHOOL_YEAR',
      message:
        'This student is already enrolled for school year 2026-2027.',
    });
  });

  it('allows confirmation when destination checks pass', async () => {
    const result = await service.validate({
      schoolYearId: 'year-1',
      sectionId: 'section-1',
      rows,
    });

    expect(result).toMatchObject({
      canConfirm: true,
      summary: {
        totalRows: 1,
        errorRows: 0,
        conflictRows: 0,
        gradeMismatchRows: 0,
      },
      rows: [],
    });
  });
});
