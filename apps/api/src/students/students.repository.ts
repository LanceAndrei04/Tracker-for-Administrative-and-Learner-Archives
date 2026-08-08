import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  findByLrn(lrn: string) {
    return this.prisma.student.findUnique({
      where: { lrn },
    });
  }

  findAll() {
    return this.prisma.student.findMany({
      where: {
        archivedAt: null,
      },
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
    });
  }
}