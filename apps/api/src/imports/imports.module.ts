import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';

import { XlsxParser } from './parsers/xlsx.parser';
import { ColumnMapperService } from './mapping/column-mapper.service';

import { NormalizationService } from './normalization/normalization.service';

import { TextNormalizer } from './normalization/normalizers/text.normalizer';
import { IdentifierNormalizer } from './normalization/normalizers/identifier.normalizer';
import { PhoneNormalizer } from './normalization/normalizers/phone.normalizer';
import { DateNormalizer } from './normalization/normalizers/date.normalizer';
import { PersonNameNormalizer } from './normalization/normalizers/person-name.normalizer';
import { GradeNormalizer } from './normalization/normalizers/grade.normalizer';

@Module({
  controllers: [ImportsController],

  providers: [
    ImportsService,

    XlsxParser,
    ColumnMapperService,

    NormalizationService,

    TextNormalizer,
    IdentifierNormalizer,
    PhoneNormalizer,
    DateNormalizer,
    PersonNameNormalizer,
    GradeNormalizer,
  ],
})
export class ImportsModule {}