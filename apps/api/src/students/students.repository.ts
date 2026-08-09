import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StudentQueryDto } from './dto/student-query.dto';

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            section: {
              include: {
                grade: true,
              },
            },
            schoolYear: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }


  async findByLrns(lrns: string[]) {
  if (lrns.length === 0) {
    return [];
  }

  return this.prisma.student.findMany({
    where: {
      lrn: {
        in: lrns,
      },
    },

    select: {
      id: true,
      lrn: true,
      firstName: true,
      middleName: true,
      lastName: true,
    },
  });
}

  findByLrn(lrn: string) {
    return this.prisma.student.findUnique({
      where: { lrn },
    });
  }

  async findAll(query: StudentQueryDto) {
    const skip = (query.page - 1) * query.limit;

    const where: Prisma.StudentWhereInput = {
      archivedAt: null,
    };

    if (query.search) {
      where.OR = [
        {
          firstName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          middleName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          lrn: {
            contains: query.search,
          },
        },
      ];
    }

    if (
      query.schoolYearId ||
      query.gradeId ||
      query.sectionId
    ) {
      where.enrollments = {
        some: {
          ...(query.schoolYearId && {
            schoolYearId: query.schoolYearId,
          }),

          ...(query.sectionId && {
            sectionId: query.sectionId,
          }),

          ...(query.gradeId && {
            section: {
              gradeId: query.gradeId,
            },
          }),
        },
      };
    }

    const [students, total] =
      await this.prisma.$transaction([
        this.prisma.student.findMany({
          where,
          skip,
          take: query.limit,

          include: {
            enrollments: {
              include: {
                section: {
                  include: {
                    grade: true,
                  },
                },
                schoolYear: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },

          orderBy: [
            {
              lastName: 'asc',
            },
            {
              firstName: 'asc',
            },
          ],
        }),

        this.prisma.student.count({
          where,
        }),
      ]);

    return {
      data: students,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  update(
  id: string,
  data: {
    lrn?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    birthday?: Date;
    birthplace?: string;
    address?: string;
    fatherName?: string;
    motherName?: string;
    guardianName?: string;
    contactNumber?: string;
    remarks?: string;
  },
) {
  return this.prisma.student.update({
    where: { id },
    data,
  });
}

}