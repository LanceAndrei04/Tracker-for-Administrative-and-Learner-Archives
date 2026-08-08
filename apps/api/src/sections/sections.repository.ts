import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SectionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.section.findMany({
      include: {
        grade: true,
        schoolYear: true,
      },
      orderBy: [
        {
          grade: {
            level: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  findById(id: string) {
    return this.prisma.section.findUnique({
      where: { id },
      include: {
        grade: true,
        schoolYear: true,
      },
    });
  }

  findExisting(
    name: string,
    gradeId: string,
    schoolYearId: string,
  ) {
    return this.prisma.section.findUnique({
      where: {
        name_gradeId_schoolYearId: {
          name,
          gradeId,
          schoolYearId,
        },
      },
    });
  }

  create(
    name: string,
    gradeId: string,
    schoolYearId: string,
  ) {
    return this.prisma.section.create({
      data: {
        name,
        gradeId,
        schoolYearId,
      },
      include: {
        grade: true,
        schoolYear: true,
      },
    });
  }
}