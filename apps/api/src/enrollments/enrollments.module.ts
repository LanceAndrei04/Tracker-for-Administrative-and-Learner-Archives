import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EnrollmentsRepository } from './enrollments.repository';

@Module({
  imports: [PrismaModule],
  providers: [EnrollmentsRepository],
  exports: [EnrollmentsRepository],
})
export class EnrollmentsModule {}