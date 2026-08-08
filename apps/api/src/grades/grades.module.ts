import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GradesController } from './grades.controller';
import { GradesRepository } from './grades.repository';
import { GradesService } from './grades.service';

@Module({
  imports: [PrismaModule],
  controllers: [GradesController],
  providers: [GradesService, GradesRepository],
})
export class GradesModule {}