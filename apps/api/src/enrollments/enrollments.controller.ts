import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ChangeSectionDto } from './dto/change-section.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto';
import { EnrollmentsService } from './enrollments.service';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Post()
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Patch(':id/section')
  changeSection(
    @Param('id') id: string,
    @Body() dto: ChangeSectionDto,
  ) {
    return this.enrollmentsService.changeSection(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentStatusDto,
  ) {
    return this.enrollmentsService.updateStatus(id, dto);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.enrollmentsService.findByStudent(studentId);
  }
}