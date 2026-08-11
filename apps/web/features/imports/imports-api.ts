import { authenticatedFetch } from "@/lib/api/authenticated-fetch";
import type {
  StudentImportMapping,
  StudentImportCompletion,
  StudentImportDestinationValidation,
  StudentImportPreview,
  StudentImportUpload,
} from "./types";

export async function uploadStudentImport(file: File): Promise<StudentImportUpload> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await authenticatedFetch("/imports/upload", {
    method: "POST",
    body: formData,
  });

  const responseBody = (await response.json()) as StudentImportUpload;

  // Keep only the metadata needed for this workflow. The backend response also
  // contains workbook samples, which should not remain in browser state here.
  return {
    importJobId: responseBody.importJobId,
    fileName: responseBody.fileName,
    fileSize: responseBody.fileSize,
    target: responseBody.target,
    sheets: responseBody.sheets.map((sheet) => ({
      name: sheet.name,
      headerRowNumber: sheet.headerRowNumber,
      rowCount: sheet.rowCount,
      columns: sheet.columns,
      suggestedMappings: sheet.suggestedMappings.map((mapping) => ({
        columnIndex: mapping.columnIndex,
        header: mapping.header,
        suggestedField: mapping.suggestedField,
        confidence: mapping.confidence,
        requiresConfirmation: mapping.requiresConfirmation,
        ambiguous: mapping.ambiguous,
        reviewRequired: mapping.reviewRequired,
      })),
    })),
  };
}

export async function previewStudentImport(
  importJobId: string,
  input: { sheetName: string; mappings: StudentImportMapping[] },
): Promise<StudentImportPreview> {
  const response = await authenticatedFetch(`/imports/${importJobId}/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return response.json() as Promise<StudentImportPreview>;
}

export async function validateStudentImportDestination(
  importJobId: string,
  input: { schoolYearId: string; sectionId: string },
): Promise<StudentImportDestinationValidation> {
  const response = await authenticatedFetch(`/imports/${importJobId}/validate-destination`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return response.json() as Promise<StudentImportDestinationValidation>;
}

export async function confirmStudentImport(
  importJobId: string,
  input: { schoolYearId: string; sectionId: string },
): Promise<StudentImportCompletion> {
  const response = await authenticatedFetch(`/imports/${importJobId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return response.json() as Promise<StudentImportCompletion>;
}
