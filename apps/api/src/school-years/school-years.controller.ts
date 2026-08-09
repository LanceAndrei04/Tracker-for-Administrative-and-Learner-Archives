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
import { Roles } from '../auth/roles.decorator';

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
  @Roles('SUPER_ADMIN')
  create(@Body() dto: CreateSchoolYearDto) {
    return this.schoolYearsService.create(dto);
  }

  @Patch(':id/activate')
  @Roles('SUPER_ADMIN')
  activate(@Param('id') id: string) {
    return this.schoolYearsService.activate(id);
  }
}
