import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { GradesService } from './grades.service';
import { Roles } from '../auth/roles.decorator';

@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get()
  findAll() {
    return this.gradesService.findAll();
  }

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() dto: CreateGradeDto) {
    return this.gradesService.create(dto);
  }
}
