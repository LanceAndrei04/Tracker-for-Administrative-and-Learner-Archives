export type DetectedImportSheet = {
  name: string;
  headerRowNumber: number;
  rowCount: number;
  columns: Array<{
    index: number;
    header: string;
  }>;
  suggestedMappings: Array<{
    columnIndex: number;
    header: string;
    suggestedField: string | null;
    confidence: number;
    requiresConfirmation: boolean;
    ambiguous: boolean;
    reviewRequired?: boolean;
  }>;
};

export type StudentImportUpload = {
  importJobId: string;
  fileName: string;
  fileSize: number;
  target: "STUDENT";
  sheets: DetectedImportSheet[];
};

export type StudentImportMapping = {
  columnIndex: number;
  targetField: string;
};

export type StudentImportPreview = {
  importJobId: string;
  target: "STUDENT";
  sheetName: string;
  rowCount: number;
  mappings: StudentImportMapping[];
  summary: {
    totalRows: number;
    validRows: number;
    warningRows: number;
    errorRows: number;
  };
  rows: Array<{
    rowNumber: number;
    values: Record<string, unknown>;
    issues: Array<{
      field: string;
      type: "WARNING" | "ERROR";
      code: string;
      message: string;
    }>;
  }>;
};

export type StudentImportDestinationValidation = {
  importJobId: string;
  schoolYearId: string;
  sectionId: string;
  canConfirm: boolean;
  summary: {
    totalRows: number;
    errorRows: number;
    conflictRows: number;
    gradeMismatchRows: number;
  };
  rows: Array<{
    rowNumber: number;
    issues: Array<{
      field: string;
      type: "WARNING" | "ERROR";
      code: string;
      message: string;
    }>;
  }>;
};

export type StudentImportCompletion = {
  importJobId: string;
  status: "COMPLETED";
  schoolYearId: string;
  sectionId: string;
  summary: {
    totalRows: number;
    importedRows: number;
    createdStudents: number;
    reusedStudents: number;
    createdEnrollments: number;
  };
};
