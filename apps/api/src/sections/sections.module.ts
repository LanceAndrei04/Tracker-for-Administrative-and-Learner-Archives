import { Module } from '@nestjs/common';
import { GradesModule } from '../grades/grades.module';
import { SchoolYearsModule } from '../school-years/school-years.module';
import { PrismaModule } from '../prisma/prisma.module';

import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';
import { SectionsRepository } from './sections.repository';

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
})
export class SectionsModule {}