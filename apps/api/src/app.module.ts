import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SchoolYearsModule } from './school-years/school-years.module';
import { GradesModule } from './grades/grades.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SchoolYearsModule,
    GradesModule,
  ],
})
export class AppModule {}