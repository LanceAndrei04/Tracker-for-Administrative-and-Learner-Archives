import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SectionsRepository } from '../sections/sections.repository';
import { SchoolYearsRepository } from '../school-years/school-years.repository';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsRepository } from './students.repository';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly sectionsRepository: SectionsRepository,
    private readonly schoolYearsRepository: SchoolYearsRepository,
    private readonly prisma: PrismaService,
  ) {}

    findAll(query: StudentQueryDto) {
    return this.studentsRepository.findAll(query);
    }

  async findById(id: string) {
    const student = await this.studentsRepository.findById(id);

    if (!student) {
      throw new NotFoundException('Student not found.');
    }

    return student;
  }

  async create(dto: CreateStudentDto) {
    if (dto.lrn) {
      const existingStudent =
        await this.studentsRepository.findByLrn(dto.lrn);

      if (existingStudent) {
        throw new ConflictException(
          'A student with this LRN already exists.',
        );
      }
    }

    const schoolYear =
      await this.schoolYearsRepository.findById(dto.schoolYearId);

    if (!schoolYear) {
      throw new NotFoundException('School year not found.');
    }

    const section =
      await this.sectionsRepository.findById(dto.sectionId);

    if (!section) {
      throw new NotFoundException('Section not found.');
    }

    if (section.schoolYearId !== dto.schoolYearId) {
      throw new ConflictException(
        'The selected section does not belong to the selected school year.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          lrn: dto.lrn,
          firstName: dto.firstName,
          middleName: dto.middleName,
          lastName: dto.lastName,
          suffix: dto.suffix,
          birthday: dto.birthday
            ? new Date(dto.birthday)
            : undefined,
          birthplace: dto.birthplace,
          address: dto.address,
          fatherName: dto.fatherName,
          motherName: dto.motherName,
          guardianName: dto.guardianName,
          contactNumber: dto.contactNumber,
          remarks: dto.remarks,
        },
      });

      const enrollment = await tx.enrollment.create({
        data: {
          studentId: student.id,
          sectionId: dto.sectionId,
          schoolYearId: dto.schoolYearId,
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

      return {
        student,
        enrollment,
      };
    });
  }
  async update(id: string, dto: UpdateStudentDto) {
  const student = await this.studentsRepository.findById(id);

  if (!student) {
    throw new NotFoundException('Student not found.');
  }

  if (dto.lrn && dto.lrn !== student.lrn) {
    const existing = await this.studentsRepository.findByLrn(dto.lrn);

    if (existing) {
      throw new ConflictException(
        'A student with this LRN already exists.',
      );
    }
  }

  return this.studentsRepository.update(id, {
    ...dto,
    birthday: dto.birthday
      ? new Date(dto.birthday)
      : undefined,
  });
}
}