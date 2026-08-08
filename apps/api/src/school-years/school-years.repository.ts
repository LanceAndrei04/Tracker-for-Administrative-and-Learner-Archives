import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchoolYearsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.schoolYear.findMany({
      orderBy: {
        label: 'desc',
      },
    });
  }

  findById(id: string) {
    return this.prisma.schoolYear.findUnique({
      where: { id },
    });
  }

  findByLabel(label: string) {
    return this.prisma.schoolYear.findUnique({
      where: { label },
    });
  }

  create(label: string) {
    return this.prisma.schoolYear.create({
      data: {
        label,
      },
    });
  }

  async activate(id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.schoolYear.updateMany({
        data: {
          isActive: false,
        },
      });

      return tx.schoolYear.update({
        where: { id },
        data: {
          isActive: true,
        },
      });
    });
  }
}