import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TeacherQueryDto } from './dto/teacher-query.dto';

const directorySelect = {
  id: true,
  firstName: true,
  middleName: true,
  lastName: true,
  suffix: true,
  employeeNumber: true,
  designation: true,
  stationStatus: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TeacherSelect;

const fullSelect = {
  ...directorySelect,
  gender: true,
  birthday: true,
  civilStatus: true,
  degreeFinished: true,
  prcSpecialization: true,
  minorSpecialization: true,
  postGraduateDegree: true,
  originalAppointmentDate: true,
  stationStartDate: true,
  cellphoneNumber: true,
  personalEmail: true,
  depEdEmail: true,
  office365Account: true,
  r4a3Account: true,
  province: true,
  town: true,
  barangay: true,
  street: true,
} satisfies Prisma.TeacherSelect;

@Injectable()
export class TeachersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllDirectory(query: TeacherQueryDto) {
    const where: Prisma.TeacherWhereInput = { archivedAt: null };
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { middleName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { employeeNumber: { contains: query.search, mode: 'insensitive' } },
        { designation: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.teacher.findMany({ where, skip, take: query.limit, select: directorySelect, orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }] }),
      this.prisma.teacher.count({ where }),
    ]);
    return { data, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  }

  findDirectoryById(id: string) {
    return this.prisma.teacher.findFirst({ where: { id, archivedAt: null }, select: directorySelect });
  }

  findFullById(id: string) {
    return this.prisma.teacher.findFirst({ where: { id, archivedAt: null }, select: fullSelect });
  }

  findByEmployeeNumber(employeeNumber: string) {
    return this.prisma.teacher.findUnique({ where: { employeeNumber }, select: { id: true } });
  }

  create(data: Prisma.TeacherCreateInput) {
    return this.prisma.teacher.create({ data, select: fullSelect });
  }

  update(id: string, data: Prisma.TeacherUpdateInput) {
    return this.prisma.teacher.update({ where: { id }, data, select: fullSelect });
  }
}
