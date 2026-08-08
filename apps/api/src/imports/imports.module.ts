import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { XlsxParser } from './parsers/xlsx.parser';
import { ColumnMapperService } from './mapping/column-mapper.service';

@Module({
  controllers: [ImportsController],
  providers: [
    ImportsService,
    XlsxParser,
    ColumnMapperService
  ],
})
export class ImportsModule {}