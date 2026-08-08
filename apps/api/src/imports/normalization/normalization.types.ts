export type NormalizationIssueType =
  | 'WARNING'
  | 'ERROR';

export type NormalizationIssue = {
  field: string;
  type: NormalizationIssueType;
  message: string;
};

export type NormalizationResult<T = unknown> = {
  originalValue: unknown;
  normalizedValue: T | null;
  success: boolean;

  warning?: string;
  error?: string;
};

export type PersonNameValue = {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  suffix: string | null;
};

export type NormalizedImportRow = {
  rowNumber: number;

  values: Record<string, unknown>;

  issues: NormalizationIssue[];
};

export type MappedCell = {
  columnIndex: number;
  header: string;
  targetField: string;
  rawValue: unknown;
  displayValue: string;
};

export type MappedImportRow = {
  rowNumber: number;
  cells: MappedCell[];
};