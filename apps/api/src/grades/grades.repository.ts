import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GradesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.grade.findMany({
      orderBy: {
        level: 'asc',
      },
    });
  }

  findById(id: string) {
    return this.prisma.grade.findUnique({
      where: { id },
    });
  }

  findByName(name: string) {
    return this.prisma.grade.findUnique({
      where: { name },
    });
  }

  findByLevel(level: number) {
    return this.prisma.grade.findUnique({
      where: { level },
    });
  }

  create(name: string, level: number) {
    return this.prisma.grade.create({
      data: {
        name,
        level,
      },
    });
  }
}