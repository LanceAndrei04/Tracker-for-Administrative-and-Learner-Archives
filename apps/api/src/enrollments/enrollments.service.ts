import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SectionsRepository } from '../sections/sections.repository';
import { StudentsRepository } from '../students/students.repository';
import { SchoolYearsRepository } from '../school-years/school-years.repository';
import { ChangeSectionDto } from './dto/change-section.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto';
import { EnrollmentsRepository } from './enrollments.repository';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly sectionsRepository: SectionsRepository,
    private readonly schoolYearsRepository: SchoolYearsRepository,
  ) {}

  async create(dto: CreateEnrollmentDto) {
    const student =
      await this.studentsRepository.findById(dto.studentId);

    if (!student) {
      throw new NotFoundException('Student not found.');
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

    const existing =
      await this.enrollmentsRepository.findByStudentAndSchoolYear(
        dto.studentId,
        dto.schoolYearId,
      );

    if (existing) {
      throw new ConflictException(
        'Student already has an enrollment for this school year.',
      );
    }

    return this.enrollmentsRepository.create(
      dto.studentId,
      dto.sectionId,
      dto.schoolYearId,
    );
  }

  async changeSection(id: string, dto: ChangeSectionDto) {
    const enrollment =
      await this.enrollmentsRepository.findById(id);

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found.');
    }

    const section =
      await this.sectionsRepository.findById(dto.sectionId);

    if (!section) {
      throw new NotFoundException('Section not found.');
    }

    if (section.schoolYearId !== enrollment.schoolYearId) {
      throw new ConflictException(
        'Cannot move the student to a section from another school year.',
      );
    }

    return this.enrollmentsRepository.changeSection(
      id,
      dto.sectionId,
    );
  }

  async updateStatus(
    id: string,
    dto: UpdateEnrollmentStatusDto,
  ) {
    const enrollment =
      await this.enrollmentsRepository.findById(id);

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found.');
    }

    return this.enrollmentsRepository.updateStatus(
      id,
      dto.status,
    );
  }

  async findByStudent(studentId: string) {
    const student =
      await this.studentsRepository.findById(studentId);

    if (!student) {
      throw new NotFoundException('Student not found.');
    }

    return this.enrollmentsRepository.findByStudent(studentId);
  }
}