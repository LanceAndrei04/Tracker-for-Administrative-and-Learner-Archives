import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { ImportsService } from './imports.service';

@Controller('imports')
export class ImportsController {
  constructor(
    private readonly importsService: ImportsService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.importsService.upload(file);
  }

  @Get('test-normalizers')
  testNormalizers() {
  return this.importsService.testNormalizers();
}

@Get('test-patterns')
testPatterns() {
  return this.importsService.testPatterns();
}
}