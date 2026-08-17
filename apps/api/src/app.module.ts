import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'node:path';
import { PrismaModule } from './prisma/prisma.module';
import { SchoolYearsModule } from './school-years/school-years.module';
import { GradesModule } from './grades/grades.module';
import { SectionsModule } from './sections/sections.module';
import { StudentsModule } from './students/students.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ImportsModule } from './imports/imports.module';
import { AuthModule } from './auth/auth.module';
import { TeachersModule } from './teachers/teachers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Supports both `npm run dev:api` from the workspace root and direct API commands.
      envFilePath: [
        join(process.cwd(), 'apps/api/.env'),
        join(process.cwd(), '.env'),
      ],
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    SchoolYearsModule,
    GradesModule,
    SectionsModule,
    StudentsModule,
    EnrollmentsModule,
    ImportsModule,
    TeachersModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
