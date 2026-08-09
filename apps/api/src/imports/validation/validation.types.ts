export type ValidationIssueType =
  | 'WARNING'
  | 'ERROR';

export type ValidationIssue = {
  field: string;
  type: ValidationIssueType;
  code: string;
  message: string;
};

export type ValidatedImportRow = {
  rowNumber: number;
  values: Record<string, unknown>;
  issues: ValidationIssue[];
};

export type ValidationSummary = {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
};

export type ValidationResult = {
  rows: ValidatedImportRow[];
  summary: ValidationSummary;
};