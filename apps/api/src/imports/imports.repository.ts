import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateImportJobInput = {
  target: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  sheetName?: string;
  schoolYearId?: string;
  totalRows?: number;
};

@Injectable()
export class ImportsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  createJob(input: CreateImportJobInput) {
    return this.prisma.importJob.create({
      data: {
        target: input.target,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        sheetName: input.sheetName,
        schoolYearId: input.schoolYearId,
        totalRows: input.totalRows ?? 0,
        status: 'UPLOADED',
      },
    });
  }

  updateSheet(
  id: string,
  sheetName: string,
) {
  return this.prisma.importJob.update({
    where: { id },

    data: {
      sheetName,
    },
  });
}

  findJobById(id: string) {
    return this.prisma.importJob.findUnique({
      where: { id },
      include: {
        issues: true,
      },
    });
  }

  updateMapping(
    id: string,
    mappingConfig: object,
  ) {
    return this.prisma.importJob.update({
      where: { id },
      data: {
        mappingConfig,
        status: 'MAPPED',
      },
    });
  }
}