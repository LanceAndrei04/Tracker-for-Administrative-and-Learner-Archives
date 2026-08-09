import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { ImportsRepository } from './imports.repository';


import { XlsxParser } from './parsers/xlsx.parser';
import { ColumnMapperService } from './mapping/column-mapper.service';

import { NormalizationService } from './normalization/normalization.service';

import { TextNormalizer } from './normalization/normalizers/text.normalizer';
import { IdentifierNormalizer } from './normalization/normalizers/identifier.normalizer';
import { PhoneNormalizer } from './normalization/normalizers/phone.normalizer';
import { DateNormalizer } from './normalization/normalizers/date.normalizer';
import { PersonNameNormalizer } from './normalization/normalizers/person-name.normalizer';
import { GradeNormalizer } from './normalization/normalizers/grade.normalizer';

import { AiMappingService } from './ai/ai-mapping.service';
import { SamplePatternService } from './ai/sample-pattern.service';
import { AiPrivacyGuard } from './ai/ai-privacy.guard';

import {ImportFileStorageService} from './storage/import-file-storage.service';

import { ImportValidationService } from './validation/import-validation.service';
import { StudentValidator } from './validation/validators/student.validator';

import { GradesModule } from '../grades/grades.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    GradesModule, 
    StudentsModule
  ],

  controllers: [ImportsController],

  providers: [
    ImportsService,
    ImportsRepository,

    XlsxParser,
    ColumnMapperService,

    NormalizationService,

    TextNormalizer,
    IdentifierNormalizer,
    PhoneNormalizer,
    DateNormalizer,
    PersonNameNormalizer,
    GradeNormalizer,

    AiMappingService,
    SamplePatternService,
    AiPrivacyGuard,

    ImportFileStorageService,

    ImportValidationService,
    StudentValidator,

  ],
})
export class ImportsModule {}