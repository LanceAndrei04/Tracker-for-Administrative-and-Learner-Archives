export type ImportTarget = 'STUDENT';

export type NormalizerType =
  | 'TEXT'
  | 'DATE'
  | 'PHONE'
  | 'IDENTIFIER'
  | 'PERSON_NAME'
  | 'GRADE';

export type ImportFieldDefinition = {
  key: string;
  label: string;
  aliases: string[];
  normalizer: NormalizerType;
  required?: boolean;
};

export type ImportSchema = {
  target: ImportTarget;
  fields: ImportFieldDefinition[];
};

export type ColumnInput = {
  index: number;
  header: string;
  sampleValues?: string[];
};

export type ColumnMappingSuggestion = {
  columnIndex: number;
  header: string;

  suggestedField: string | null;

  confidence: number;

  requiresConfirmation: boolean;

  ambiguous: boolean;

  reason?: string;
};