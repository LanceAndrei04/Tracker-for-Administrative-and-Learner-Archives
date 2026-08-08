import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { SchoolYearsService } from './school-years.service';

@Controller('school-years')
export class SchoolYearsController {
  constructor(
    private readonly schoolYearsService: SchoolYearsService,
  ) {}

  @Get()
  findAll() {
    return this.schoolYearsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateSchoolYearDto) {
    return this.schoolYearsService.create(dto);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.schoolYearsService.activate(id);
  }
}