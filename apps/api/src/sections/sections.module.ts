import { Module } from '@nestjs/common';
import { GradesModule } from '../grades/grades.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SchoolYearsModule } from '../school-years/school-years.module';
import { SectionsController } from './sections.controller';
import { SectionsRepository } from './sections.repository';
import { SectionsService } from './sections.service';

@Module({
  imports: [
    PrismaModule,
    GradesModule,
    SchoolYearsModule,
  ],
  controllers: [SectionsController],
  providers: [
    SectionsService,
    SectionsRepository,
  ],
  exports: [
    SectionsRepository,
  ],
})
export class SectionsModule {}