import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SchoolYearsModule } from '../school-years/school-years.module';
import { SectionsModule } from '../sections/sections.module';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

@Module({
  imports: [
    PrismaModule,
    SectionsModule,
    SchoolYearsModule,
  ],
  controllers: [
    StudentsController,
  ],
  providers: [
    StudentsService,
    StudentsRepository,
  ],
  exports: [
    StudentsRepository,
  ],
})
export class StudentsModule {}