import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SchoolYearsModule } from '../school-years/school-years.module';
import { SectionsModule } from '../sections/sections.module';
import { StudentsModule } from '../students/students.module';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsRepository } from './enrollments.repository';
import { EnrollmentsService } from './enrollments.service';

@Module({
  imports: [
    PrismaModule,
    StudentsModule,
    SectionsModule,
    SchoolYearsModule,
  ],
  controllers: [EnrollmentsController],
  providers: [
    EnrollmentsService,
    EnrollmentsRepository,
  ],
  exports: [EnrollmentsRepository],
})
export class EnrollmentsModule {}