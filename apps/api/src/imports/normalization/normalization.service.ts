import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { getImportSchema } from '../mapping/mapping-registry';
import { ImportTarget } from '../mapping/mapping.types';
import {
  MappedImportRow,
  NormalizedImportRow,
} from './normalization.types';

import { DateNormalizer } from './normalizers/date.normalizer';
import { GradeNormalizer } from './normalizers/grade.normalizer';
import { IdentifierNormalizer } from './normalizers/identifier.normalizer';
import { PersonNameNormalizer } from './normalizers/person-name.normalizer';
import { PhoneNormalizer } from './normalizers/phone.normalizer';
import { TextNormalizer } from './normalizers/text.normalizer';

@Injectable()
export class NormalizationService {
  constructor(
    private readonly textNormalizer: TextNormalizer,
    private readonly identifierNormalizer: IdentifierNormalizer,
    private readonly phoneNormalizer: PhoneNormalizer,
    private readonly dateNormalizer: DateNormalizer,
    private readonly personNameNormalizer: PersonNameNormalizer,
    private readonly gradeNormalizer: GradeNormalizer,
  ) {}

  normalizeRows(
    target: ImportTarget,
    rows: MappedImportRow[],
  ): NormalizedImportRow[] {
    const schema = getImportSchema(target);

    return rows.map((row) => {
      const values: Record<string, unknown> = {};
      const issues: NormalizedImportRow['issues'] = [];

      for (const cell of row.cells) {
        const fieldDefinition = schema.fields.find(
          (field) => field.key === cell.targetField,
        );

        if (!fieldDefinition) {
          issues.push({
            field: cell.targetField,
            type: 'WARNING',
            message: `No import field definition found for ${cell.targetField}.`,
          });

          continue;
        }

        const result = this.normalizeValue(
          fieldDefinition.normalizer,
          cell.rawValue,
          cell.displayValue,
        );

        if (!result.success) {
          issues.push({
            field: cell.targetField,
            type: 'ERROR',
            message:
              result.error ??
              `Failed to normalize ${cell.targetField}.`,
          });

          continue;
        }

        if (result.warning) {
          issues.push({
            field: cell.targetField,
            type: 'WARNING',
            message: result.warning,
          });
        }

        /*
         * Person name is special because one source field
         * becomes multiple canonical values.
         */
        if (
          fieldDefinition.normalizer ===
            'PERSON_NAME' &&
          result.normalizedValue &&
          typeof result.normalizedValue === 'object'
        ) {
          Object.assign(
            values,
            result.normalizedValue,
          );

          continue;
        }

        values[cell.targetField] =
          result.normalizedValue;
      }

      return {
        rowNumber: row.rowNumber,
        values,
        issues,
      };
    });
  }

  private normalizeValue(
    normalizer: string,
    rawValue: unknown,
    displayValue?: string,
  ) {
    switch (normalizer) {
      case 'TEXT':
        return this.textNormalizer.normalize(
          rawValue,
        );

      case 'IDENTIFIER':
        return this.identifierNormalizer.normalize(
          rawValue,
        );

      case 'PHONE':
        return this.phoneNormalizer.normalize(
          rawValue,
        );

      case 'DATE':
        return this.dateNormalizer.normalize(
          rawValue,
          displayValue,
        );

      case 'PERSON_NAME':
        return this.personNameNormalizer.normalize(
          rawValue,
        );

      case 'GRADE':
        return this.gradeNormalizer.normalize(
          rawValue,
        );

      default:
        throw new InternalServerErrorException(
          `Unsupported normalizer: ${normalizer}`,
        );
    }
  }
}