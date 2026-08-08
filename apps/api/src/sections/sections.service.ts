import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GradesRepository } from '../grades/grades.repository';
import { SchoolYearsRepository } from '../school-years/school-years.repository';
import { CreateSectionDto } from './dto/create-section.dto';
import { SectionsRepository } from './sections.repository';

@Injectable()
export class SectionsService {
  constructor(
    private readonly sectionsRepository: SectionsRepository,
    private readonly gradesRepository: GradesRepository,
    private readonly schoolYearsRepository: SchoolYearsRepository,
  ) {}

  findAll() {
    return this.sectionsRepository.findAll();
  }

  async findById(id: string) {
    const section = await this.sectionsRepository.findById(id);

    if (!section) {
      throw new NotFoundException('Section not found.');
    }

    return section;
  }

  async create(dto: CreateSectionDto) {
    const grade = await this.gradesRepository.findById(dto.gradeId);

    if (!grade) {
      throw new NotFoundException('Grade not found.');
    }

    const schoolYear =
      await this.schoolYearsRepository.findById(dto.schoolYearId);

    if (!schoolYear) {
      throw new NotFoundException('School year not found.');
    }

    const existing =
      await this.sectionsRepository.findExisting(
        dto.name,
        dto.gradeId,
        dto.schoolYearId,
      );

    if (existing) {
      throw new ConflictException(
        `Section ${dto.name} already exists for ${grade.name} in school year ${schoolYear.label}.`,
      );
    }

    return this.sectionsRepository.create(
      dto.name,
      dto.gradeId,
      dto.schoolYearId,
    );
  }
}