import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { XlsxParser } from './parsers/xlsx.parser';
import { ColumnMapperService } from './mapping/column-mapper.service';

@Injectable()
export class ImportsService {
  constructor(
    private readonly xlsxParser: XlsxParser,
    private readonly columnMapper: ColumnMapperService,
  ) {}

  async upload(file: {
    originalname: string;
    buffer: Buffer;
    size: number;
  }) {
    if (!file) {
      throw new BadRequestException(
        'Spreadsheet file is required.',
      );
    }

    const extension = file.originalname
      .split('.')
      .pop()
      ?.toLowerCase();

    if (extension !== 'xlsx') {
      throw new BadRequestException(
        'Only .xlsx files are supported for now.',
      );
    }

    const sheets = await this.xlsxParser.parse(file.buffer);
    console.log({
      name: file.originalname,
      size: file.size,
      bufferLength: file.buffer?.length,
      signature: file.buffer
        ?.subarray(0, 4)
        .toString('hex'),
    });

    return {
      fileName: file.originalname,
      fileSize: file.size,
      sheets,
    };
  }
}