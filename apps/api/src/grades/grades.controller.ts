import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { GradesService } from './grades.service';

@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get()
  findAll() {
    return this.gradesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateGradeDto) {
    return this.gradesService.create(dto);
  }
}