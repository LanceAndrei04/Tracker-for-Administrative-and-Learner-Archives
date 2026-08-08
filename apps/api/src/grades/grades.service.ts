import { ConflictException, Injectable } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { GradesRepository } from './grades.repository';

@Injectable()
export class GradesService {
  constructor(private readonly gradesRepository: GradesRepository) {}

  findAll() {
    return this.gradesRepository.findAll();
  }

  async create(dto: CreateGradeDto) {
    const existingName = await this.gradesRepository.findByName(dto.name);

    if (existingName) {
      throw new ConflictException(`Grade ${dto.name} already exists.`);
    }

    const existingLevel = await this.gradesRepository.findByLevel(dto.level);

    if (existingLevel) {
      throw new ConflictException(
        `Grade level ${dto.level} already exists.`,
      );
    }

    return this.gradesRepository.create(dto.name, dto.level);
  }
}