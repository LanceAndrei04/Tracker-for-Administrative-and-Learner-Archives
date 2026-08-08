import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SchoolYearsController } from './school-years.controller';
import { SchoolYearsRepository } from './school-years.repository';
import { SchoolYearsService } from './school-years.service';

@Module({
  imports: [PrismaModule],
  controllers: [SchoolYearsController],
  providers: [
    SchoolYearsService,
    SchoolYearsRepository,
  ],
})
export class SchoolYearsModule {}