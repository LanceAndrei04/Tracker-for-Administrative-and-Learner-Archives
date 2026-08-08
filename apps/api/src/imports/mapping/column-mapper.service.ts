import { Injectable } from '@nestjs/common';
import {
  ColumnInput,
  ColumnMappingSuggestion,
  ImportTarget,
} from './mapping.types';
import { getImportSchema } from './mapping-registry';

@Injectable()
export class ColumnMapperService {
  mapColumns(
    target: ImportTarget,
    columns: ColumnInput[],
  ): ColumnMappingSuggestion[] {
    const schema = getImportSchema(target);

    return columns.map((column) => {
      const normalizedHeader =
        this.normalizeHeader(column.header);

      let bestField: string | null = null;
      let bestScore = 0;

      for (const field of schema.fields) {
        for (const alias of field.aliases) {
          const normalizedAlias =
            this.normalizeHeader(alias);

          const score = this.calculateScore(
            normalizedHeader,
            normalizedAlias,
          );

          if (score > bestScore) {
            bestScore = score;
            bestField = field.key;
          }
        }
      }

      return {
        columnIndex: column.index,
        header: column.header,
        suggestedField:
          bestScore >= 0.6 ? bestField : null,
        confidence: Number(bestScore.toFixed(2)),
        requiresConfirmation: bestScore < 0.9,
      };
    });
  }

  private normalizeHeader(value: string): string {
    return value
      .trim()
      .toUpperCase()
      .replace(/[.'"]/g, '')
      .replace(/\s+/g, ' ');
  }

  private calculateScore(
    header: string,
    alias: string,
  ): number {
    if (header === alias) {
      return 1;
    }

    if (
      header.includes(alias) ||
      alias.includes(header)
    ) {
      return 0.8;
    }

    const headerWords = new Set(header.split(' '));
    const aliasWords = new Set(alias.split(' '));

    const intersection = [...headerWords].filter(
      (word) => aliasWords.has(word),
    );

    const union = new Set([
      ...headerWords,
      ...aliasWords,
    ]);

    if (union.size === 0) {
      return 0;
    }

    return intersection.length / union.size;
  }
}