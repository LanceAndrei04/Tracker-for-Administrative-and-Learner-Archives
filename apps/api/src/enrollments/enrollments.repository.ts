import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

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
}