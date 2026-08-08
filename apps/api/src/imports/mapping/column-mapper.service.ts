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

    const suggestions = columns.map((column) => {
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

      const suggestedField =
        bestScore >= 0.6 ? bestField : null;

      return {
        columnIndex: column.index,
        header: column.header,
        suggestedField,
        confidence: Number(bestScore.toFixed(2)),
        requiresConfirmation: bestScore < 0.9,
        ambiguous: false,
        reason:
              suggestedField === null
            ? 'No sufficiently confident mapping was found.'
            : bestScore < 0.9
              ? 'Mapping confidence is below the automatic acceptance threshold.'
              : undefined,
              };
    });

    return this.detectConflicts(suggestions);
  }

  private detectConflicts(
    suggestions: ColumnMappingSuggestion[],
  ): ColumnMappingSuggestion[] {
    const fieldCounts = new Map<string, number>();

    for (const suggestion of suggestions) {
      if (!suggestion.suggestedField) {
        continue;
      }

      fieldCounts.set(
        suggestion.suggestedField,
        (fieldCounts.get(
          suggestion.suggestedField,
        ) ?? 0) + 1,
      );
    }

    return suggestions.map((suggestion) => {
      if (!suggestion.suggestedField) {
        return suggestion;
      }

      const count =
        fieldCounts.get(
          suggestion.suggestedField,
        ) ?? 0;

      if (count > 1) {
        return {
          ...suggestion,
          ambiguous: true,
          requiresConfirmation: true,
          reason:
            `Multiple source columns were mapped to "${suggestion.suggestedField}".`,
        };
      }

      return suggestion;
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

    const headerWords = new Set(
      header.split(' '),
    );

    const aliasWords = new Set(
      alias.split(' '),
    );

    const intersection = [
      ...headerWords,
    ].filter((word) =>
      aliasWords.has(word),
    );

    const union = new Set([
      ...headerWords,
      ...aliasWords,
    ]);

    if (union.size === 0) {
      return 0;
    }

    return (
      intersection.length /
      union.size
    );
  }
}