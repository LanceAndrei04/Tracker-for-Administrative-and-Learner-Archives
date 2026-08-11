import { Test, TestingModule } from '@nestjs/testing';

jest.mock('./prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  const prisma = {
    schoolYear: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.schoolYear.count.mockResolvedValue(3);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('reports database connectivity and the school-year count', async () => {
      await expect(appController.health()).resolves.toEqual({
        status: 'ok',
        database: 'connected',
        schoolYearCount: 3,
      });
    });
  });
});
