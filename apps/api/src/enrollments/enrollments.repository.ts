import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: true,
        section: {
          include: {
            grade: true,
          },
        },
        schoolYear: true,
      },
    });
  }

  findByStudentAndSchoolYear(
    studentId: string,
    schoolYearId: string,
  ) {
    return this.prisma.enrollment.findUnique({
      where: {
        studentId_schoolYearId: {
          studentId,
          schoolYearId,
        },
      },
    });
  }

  findByStudent(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        studentId,
      },
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
    });
  }

  create(
    studentId: string,
    sectionId: string,
    schoolYearId: string,
  ) {
    return this.prisma.enrollment.create({
      data: {
        studentId,
        sectionId,
        schoolYearId,
      },
      include: {
        section: {
          include: {
            grade: true,
          },
        },
        schoolYear: true,
      },
    });
  }

  changeSection(id: string, sectionId: string) {
    return this.prisma.enrollment.update({
      where: { id },
      data: {
        sectionId,
      },
      include: {
        section: {
          include: {
            grade: true,
          },
        },
        schoolYear: true,
      },
    });
  }

  updateStatus(id: string, status: string) {
    return this.prisma.enrollment.update({
      where: { id },
      data: {
        status,
      },
    });
  }
}