import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { SchoolYearsRepository } from './school-years.repository';

@Injectable()
export class SchoolYearsService {
  constructor(
    private readonly schoolYearsRepository: SchoolYearsRepository,
  ) {}

  findAll() {
    return this.schoolYearsRepository.findAll();
  }

  async create(dto: CreateSchoolYearDto) {
    const existing = await this.schoolYearsRepository.findByLabel(dto.label);

    if (existing) {
      throw new ConflictException(
        `School year ${dto.label} already exists.`,
      );
    }

    return this.schoolYearsRepository.create(dto.label);
  }

  async activate(id: string) {
    const schoolYear = await this.schoolYearsRepository.findById(id);

    if (!schoolYear) {
      throw new NotFoundException('School year not found.');
    }

    if (schoolYear.isActive) {
      return schoolYear;
    }

    return this.schoolYearsRepository.activate(id);
  }
}