import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { XlsxParser } from './parsers/xlsx.parser';
import { ColumnMapperService } from './mapping/column-mapper.service';

import { TextNormalizer } from './normalization/normalizers/text.normalizer';
import { IdentifierNormalizer } from './normalization/normalizers/identifier.normalizer';
import { PhoneNormalizer } from './normalization/normalizers/phone.normalizer';
import { DateNormalizer } from './normalization/normalizers/date.normalizer';
import { PersonNameNormalizer } from './normalization/normalizers/person-name.normalizer';
import { GradeNormalizer } from './normalization/normalizers/grade.normalizer';

@Injectable()
export class ImportsService {
  constructor(
    private readonly xlsxParser: XlsxParser,
    private readonly columnMapper: ColumnMapperService,

  private readonly textNormalizer: TextNormalizer,
  private readonly identifierNormalizer: IdentifierNormalizer,
  private readonly phoneNormalizer: PhoneNormalizer,
  private readonly dateNormalizer: DateNormalizer,
  private readonly personNameNormalizer: PersonNameNormalizer,
  private readonly gradeNormalizer: GradeNormalizer,
  ) {}

  async upload(file: Express.Multer.File) {
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

    const mappedSheets = sheets.map((sheet) => {
      const columns = sheet.columns.map((column) => {
        const sampleValues = sheet.sampleRows
          .map((row) => {
            const cell = row.cells.find(
              (item) =>
                item.columnIndex === column.index,
            );

            return cell?.displayValue ?? '';
          })
          .filter((value) => value !== '');

        return {
          index: column.index,
          header: column.header,
          sampleValues,
        };
      });

      const suggestedMappings =
        this.columnMapper.mapColumns(
          'STUDENT',
          columns,
        );

      return {
        ...sheet,
        suggestedMappings,
      };
    });

    return {
      fileName: file.originalname,
      fileSize: file.size,
      target: 'STUDENT',
      sheets: mappedSheets,
    };
  }

  testNormalizers() {
  return {
    text: [
      this.textNormalizer.normalize(
        '   Talampas,   Bustos, Bulacan   ',
      ),
    ],

    identifier: [
      this.identifierNormalizer.normalize(
        123457000000,
      ),

      this.identifierNormalizer.normalize(
        ' 123456789012 ',
      ),
    ],

    phone: [
      this.phoneNormalizer.normalize(
        '0919 555 0194',
      ),

      this.phoneNormalizer.normalize(
        '+63 919 555 0194',
      ),

      this.phoneNormalizer.normalize(
        9185550193,
      ),
    ],

    date: [
      this.dateNormalizer.normalize(
        '2014-02-05T00:00:00.000Z',
      ),

      this.dateNormalizer.normalize(
        41715,
      ),

      this.dateNormalizer.normalize(
        'January 20, 2014',
      ),
    ],

    grade: [
      this.gradeNormalizer.normalize(6),
      this.gradeNormalizer.normalize('G6'),
      this.gradeNormalizer.normalize('Gr. 6'),
      this.gradeNormalizer.normalize('VI'),
      this.gradeNormalizer.normalize('Grade 6'),
    ],

    names: [
      this.personNameNormalizer.normalize(
        'SANTOS, ANA MARIE',
      ),

      this.personNameNormalizer.normalize(
        'REYES, MARK ANTHONY LUIS',
      ),

      this.personNameNormalizer.normalize(
        'GARCIA, LUIS TOMAS',
      ),
    ],
  };
}
}