"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api/authenticated-fetch";
import { getSchoolYears, getSections } from "@/features/students/students-api";
import type { SchoolYear, Section } from "@/features/students/types";
import {
  confirmStudentImport,
  previewStudentImport,
  uploadStudentImport,
  validateStudentImportDestination,
} from "./imports-api";
import type {
  DetectedImportSheet,
  StudentImportMapping,
  StudentImportDestinationValidation,
  StudentImportCompletion,
  StudentImportPreview,
  StudentImportUpload,
} from "./types";

const steps = ["Upload", "Review columns", "Review records", "Destination", "Complete"];
const unmappedValue = "__unmapped__";
type StudentImportField = {
  key: string;
  label: string;
  required?: boolean;
};

const studentImportFields: readonly StudentImportField[] = [
  { key: "lrn", label: "LRN", required: true },
  { key: "fullName", label: "Learner name", required: true },
  { key: "birthday", label: "Birthday" },
  { key: "birthplace", label: "Birthplace" },
  { key: "grade", label: "Grade level" },
  { key: "address", label: "Address" },
  { key: "fatherName", label: "Father's name" },
  { key: "motherName", label: "Mother's name" },
  { key: "guardianName", label: "Guardian's name" },
  { key: "contactNumber", label: "Contact number" },
  { key: "remarks", label: "Remarks" },
] as const;
const requiredStudentImportFields = studentImportFields.filter((field) => field.required);

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(bytes < 10_240 ? 1 : 0)} KB`;
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function displayStudentName(values: Record<string, unknown>) {
  const firstName = String(values.firstName ?? "").trim();
  const middleName = String(values.middleName ?? "").trim();
  const lastName = String(values.lastName ?? "").trim();
  const suffix = String(values.suffix ?? "").trim();
  const givenNames = [firstName, middleName].filter(Boolean).join(" ");
  const name = [lastName, givenNames, suffix].filter(Boolean).join(", ");

  return name || displayValue(values.fullName);
}

function rowStatus(row: StudentImportPreview["rows"][number]) {
  if (row.issues.some((issue) => issue.type === "ERROR")) return "ERROR" as const;
  if (row.issues.some((issue) => issue.type === "WARNING")) return "WARNING" as const;
  return "READY" as const;
}

function initialMappings(sheet: DetectedImportSheet): Record<number, string> {
  const usedFields = new Set<string>();
  const suggestionsByColumn = new Map(
    sheet.suggestedMappings.map((mapping) => [mapping.columnIndex, mapping]),
  );

  return Object.fromEntries(
    sheet.columns.flatMap((column) => {
      const suggestedField = suggestionsByColumn.get(column.index)?.suggestedField;
      if (!suggestedField || usedFields.has(suggestedField)) return [];
      usedFields.add(suggestedField);
      return [[column.index, suggestedField]];
    }),
  );
}

export function ImportWizard() {
  const [step, setStep] = useState(0);
  const [upload, setUpload] = useState<StudentImportUpload>();
  const [selectedSheetName, setSelectedSheetName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [mappingByColumn, setMappingByColumn] = useState<Record<number, string>>({});
  const [preview, setPreview] = useState<StudentImportPreview>();
  const [previewing, setPreviewing] = useState(false);
  const [mappingError, setMappingError] = useState("");
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [destinationLookupsRequested, setDestinationLookupsRequested] = useState(false);
  const [destinationError, setDestinationError] = useState("");
  const [schoolYearId, setSchoolYearId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [destinationValidation, setDestinationValidation] = useState<StudentImportDestinationValidation>();
  const [validatingDestination, setValidatingDestination] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [completion, setCompletion] = useState<StudentImportCompletion>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedSheet = upload?.sheets.find((sheet) => sheet.name === selectedSheetName);
  const mappings: StudentImportMapping[] = Object.entries(mappingByColumn).map(([columnIndex, targetField]) => ({
    columnIndex: Number(columnIndex),
    targetField,
  }));
  const missingRequiredMappings = requiredStudentImportFields.filter((field) => !mappings.some((mapping) => mapping.targetField === field.key));
  const hasPreviewErrors = (preview?.summary.errorRows ?? 0) > 0;
  const selectedDestination = sections.find((section) => section.id === sectionId);

  const next = () => setStep((value) => Math.min(value + 1, 4));

  async function uploadFile(file?: File) {
    if (!file || uploading) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setUploadError("Choose an .xlsx Excel workbook.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUpload(undefined);
    setSelectedSheetName("");
    setMappingByColumn({});
    setPreview(undefined);
    setMappingError("");
    resetDestination();

    try {
      const response = await uploadStudentImport(file);
      if (response.sheets.length === 0) {
        throw new Error("The workbook has no usable worksheets.");
      }

      setUpload(response);
      setSelectedSheetName(response.sheets[0].name);
      setMappingByColumn(initialMappings(response.sheets[0]));
      toast.success("Workbook uploaded", {
        description: "Choose the worksheet to review next.",
      });
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : "We couldn't upload this workbook. Check the file and try again.";
      setUploadError(message);
      toast.error("Workbook upload failed", { description: message });
    } finally {
      setUploading(false);
    }
  }

  function replaceFile() {
    setUpload(undefined);
    setSelectedSheetName("");
    setUploadError("");
    setMappingByColumn({});
    setPreview(undefined);
    setMappingError("");
    resetDestination();
    fileInputRef.current?.click();
  }

  function selectSheet(sheetName: string) {
    const sheet = upload?.sheets.find((item) => item.name === sheetName);
    setSelectedSheetName(sheetName);
    setMappingByColumn(sheet ? initialMappings(sheet) : {});
    setPreview(undefined);
    setMappingError("");
    resetDestination();
  }

  function setColumnMapping(columnIndex: number, targetField?: string) {
    setMappingByColumn((current) => {
      const nextMappings = { ...current };
      if (!targetField) delete nextMappings[columnIndex];
      else nextMappings[columnIndex] = targetField;
      return nextMappings;
    });
    setPreview(undefined);
    setMappingError("");
    resetDestination();
  }

  function resetDestination() {
    setSchoolYears([]);
    setSections([]);
    setDestinationLoading(false);
    setDestinationLookupsRequested(false);
    setDestinationError("");
    setSchoolYearId("");
    setSectionId("");
    setDestinationValidation(undefined);
    setConfirmOpen(false);
    setConfirming(false);
    setConfirmError("");
    setCompletion(undefined);
  }

  function changeSchoolYear(nextSchoolYearId: string) {
    setSchoolYearId(nextSchoolYearId);
    setSectionId("");
    setDestinationValidation(undefined);
    setConfirmError("");
  }

  function changeSection(nextSectionId: string) {
    setSectionId(nextSectionId);
    setDestinationValidation(undefined);
    setConfirmError("");
  }

  async function openDestination() {
    if (hasPreviewErrors) return;

    setStep(3);
    if (destinationLookupsRequested) return;

    setDestinationLoading(true);
    setDestinationLookupsRequested(true);
    setDestinationError("");
    try {
      const [nextSchoolYears, nextSections] = await Promise.all([getSchoolYears(), getSections()]);
      setSchoolYears(nextSchoolYears);
      setSections(nextSections);
      setSchoolYearId((current) => current || nextSchoolYears.find((year) => year.isActive)?.id || nextSchoolYears[0]?.id || "");
    } catch {
      setDestinationError("TALA could not load school years and sections. Return to review and try again.");
      setDestinationLookupsRequested(false);
    } finally {
      setDestinationLoading(false);
    }
  }

  async function validateDestination() {
    if (!upload || !preview || !schoolYearId || !sectionId || validatingDestination) return;

    setValidatingDestination(true);
    setDestinationError("");
    try {
      const response = await validateStudentImportDestination(upload.importJobId, { schoolYearId, sectionId });
      setDestinationValidation(response);
      toast[response.canConfirm ? "success" : "error"](
        response.canConfirm ? "Destination is ready" : "Destination needs attention",
        { description: response.canConfirm ? "TALA has checked this destination against the import." : "Review the destination conflicts before importing." },
      );
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : "TALA could not validate this destination. Try again.";
      setDestinationError(message);
      toast.error("Destination could not be checked", { description: message });
    } finally {
      setValidatingDestination(false);
    }
  }

  async function confirmImport() {
    if (!upload || !schoolYearId || !sectionId || !destinationValidation?.canConfirm || confirming) return;

    setConfirming(true);
    setConfirmError("");
    try {
      const response = await confirmStudentImport(upload.importJobId, { schoolYearId, sectionId });
      setCompletion(response);
      setConfirmOpen(false);
      setStep(4);
      toast.success("Students imported", { description: `${response.summary.createdEnrollments} enrollments were created.` });
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : "TALA could not complete this import. No changes were confirmed by the application.";
      setConfirmError(message);
      toast.error("Import could not be completed", { description: message });
    } finally {
      setConfirming(false);
    }
  }

  function startAnotherImport() {
    setStep(0);
    setUpload(undefined);
    setSelectedSheetName("");
    setUploadError("");
    setMappingByColumn({});
    setPreview(undefined);
    setMappingError("");
    resetDestination();
  }

  async function generatePreview() {
    if (!upload || !selectedSheet || previewing || missingRequiredMappings.length > 0) return;

    setPreviewing(true);
    setMappingError("");
    try {
      const response = await previewStudentImport(upload.importJobId, {
        sheetName: selectedSheet.name,
        mappings,
      });
      setPreview(response);
      setStep(2);
      toast.success("Column mapping saved", {
        description: "TALA has prepared the record validation preview.",
      });
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : "We couldn't prepare a preview for this workbook. Check the mapping and try again.";
      setMappingError(message);
      toast.error("Preview could not be generated", { description: message });
    } finally {
      setPreviewing(false);
    }
  }

  return <>
    <Link href="/students" className="back-link">← Students</Link>
    <header className="page-heading"><div><h1>Import students</h1><p>Add records from an existing Excel masterlist.</p></div></header>
    <ol className="wizard-steps">{steps.map((label, index) => <li key={label} className={index === step ? "active" : index < step ? "complete" : ""}><span>{index < step ? <Icon name="check" /> : index + 1}</span>{label}</li>)}</ol>
    <section className="wizard-panel">
      {step === 0 ? <UploadStep upload={upload} selectedSheetName={selectedSheetName} uploading={uploading} error={uploadError} fileInputRef={fileInputRef} onSelectSheet={selectSheet} onChooseFile={uploadFile} onReplace={replaceFile} /> : null}
      {step === 1 && selectedSheet ? <MappingStep sheet={selectedSheet} mappingByColumn={mappingByColumn} missingRequiredMappings={missingRequiredMappings} previewing={previewing} error={mappingError} onChange={setColumnMapping} /> : null}
      {step === 2 ? <ReviewStep preview={preview} /> : null}
      {step === 3 ? <DestinationStep preview={preview} schoolYears={schoolYears} sections={sections} schoolYearId={schoolYearId} sectionId={sectionId} loading={destinationLoading} error={destinationError} validation={destinationValidation} onSchoolYearChange={changeSchoolYear} onSectionChange={changeSection} /> : null}
      {step === 4 ? <CompleteStep completion={completion} onImportAnother={startAnotherImport} /> : null}
      <div className="wizard-actions">
        {step > 0 && step < 4 ? <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button> : <span />}
        {step === 0 ? <Button disabled={!upload || !selectedSheet} onClick={next}>Continue</Button> : null}
        {step === 1 ? <Button disabled={previewing || missingRequiredMappings.length > 0} onClick={generatePreview}>{previewing ? "Generating preview…" : "Generate preview"}</Button> : null}
        {step === 2 ? <Button disabled={hasPreviewErrors || destinationLoading} onClick={openDestination}>Continue to destination</Button> : null}
        {step === 3 && destinationValidation?.canConfirm ? <Button onClick={() => { setConfirmError(""); setConfirmOpen(true); }}>Confirm import</Button> : null}
        {step === 3 && !destinationValidation?.canConfirm ? <Button disabled={!schoolYearId || !sectionId || destinationLoading || validatingDestination || new Set(preview?.rows.map((row) => String(row.values.grade ?? "").trim()).filter(Boolean)).size > 1} onClick={validateDestination}>{validatingDestination ? "Checking destination…" : "Check destination"}</Button> : null}
      </div>
    </section>
    <Dialog open={confirmOpen} onOpenChange={(open) => { if (!confirming) setConfirmOpen(open); }}>
      <DialogContent showCloseButton={!confirming}>
        <DialogHeader><DialogTitle>Confirm student import</DialogTitle><DialogDescription>Import {preview?.summary.totalRows ?? 0} reviewed records into <strong>{selectedDestination ? `${selectedDestination.schoolYear.label} · ${selectedDestination.grade.name} — ${selectedDestination.name}` : "the selected destination"}</strong>?</DialogDescription></DialogHeader>
        {confirmError ? <Alert variant="destructive"><AlertTitle>Import could not be completed</AlertTitle><AlertDescription>{confirmError}</AlertDescription></Alert> : null}
        <DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={confirming}>Cancel</Button><Button onClick={confirmImport} disabled={confirming}>{confirming ? "Importing students…" : "Confirm import"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}

function UploadStep({ upload, selectedSheetName, uploading, error, fileInputRef, onSelectSheet, onChooseFile, onReplace }: { upload?: StudentImportUpload; selectedSheetName: string; uploading: boolean; error: string; fileInputRef: React.RefObject<HTMLInputElement | null>; onSelectSheet: (sheetName: string) => void; onChooseFile: (file?: File) => void; onReplace: () => void }) {
  const selectedSheet = upload?.sheets.find((sheet) => sheet.name === selectedSheetName);

  return <div className="flex flex-col gap-5">
    <input ref={fileInputRef} className="sr-only" id="student-import-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => { onChooseFile(event.target.files?.[0]); event.currentTarget.value = ""; }} />
    {upload ? <div className="import-file-summary"><span className="file-icon"><Icon name="files" /></span><div><h2>{upload.fileName}</h2><p>{fileSize(upload.fileSize)} · {upload.sheets.length} {upload.sheets.length === 1 ? "worksheet" : "worksheets"} detected</p><small>{selectedSheet ? `${selectedSheet.rowCount} records detected in the selected worksheet` : "Choose a worksheet"}</small></div><Button type="button" variant="outline" size="sm" onClick={onReplace}>Replace file</Button></div> : <div className="upload-step" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onChooseFile(event.dataTransfer.files[0]); }}><Icon name="upload" /><h2>{uploading ? "Uploading Excel workbook…" : "Drop an Excel file here"}</h2><p>{uploading ? "Reading workbook structure securely." : "Choose an Excel masterlist to begin."}</p><Button type="button" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>{uploading ? "Uploading…" : "Choose file"}</Button><small>.xlsx only · Workbook content is processed securely by TALA.</small></div>}
    {upload && upload.sheets.length > 1 ? <Field><FieldLabel htmlFor="student-import-sheet">Worksheet</FieldLabel><select id="student-import-sheet" value={selectedSheetName} onChange={(event) => onSelectSheet(event.target.value)}><option value="">Choose worksheet</option>{upload.sheets.map((sheet) => <option key={sheet.name} value={sheet.name}>{sheet.name} · {sheet.rowCount} records</option>)}</select></Field> : null}
    {upload && upload.sheets.length === 1 ? <p className="field-group-note">Selected worksheet: <strong>{upload.sheets[0].name}</strong></p> : null}
    {error ? <Alert variant="destructive"><AlertTitle>Workbook upload failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
  </div>;
}

function MappingStep({ sheet, mappingByColumn, missingRequiredMappings, previewing, error, onChange }: { sheet: DetectedImportSheet; mappingByColumn: Record<number, string>; missingRequiredMappings: typeof requiredStudentImportFields; previewing: boolean; error: string; onChange: (columnIndex: number, targetField?: string) => void }) {
  const selectedFields = new Set(Object.values(mappingByColumn));
  const suggestionsByColumn = new Map(sheet.suggestedMappings.map((mapping) => [mapping.columnIndex, mapping]));

  return <div>
    <h2>Review columns</h2>
    <p className="section-copy">Confirm how each Excel column should be read before TALA validates the records.</p>
    {missingRequiredMappings.length > 0 ? <Alert className="mt-5"><AlertTitle>Required mappings still needed</AlertTitle><AlertDescription>Map {missingRequiredMappings.map((field) => field.label).join(" and ")} to generate a preview.</AlertDescription></Alert> : null}
    <div className="mapping-table" role="group" aria-label="Column mapping">
      <div><b>Excel column</b><b>Maps to</b></div>
      {sheet.columns.map((column) => {
        const suggestion = suggestionsByColumn.get(column.index);
        const value = mappingByColumn[column.index] ?? unmappedValue;
        const needsReview = suggestion?.reviewRequired || suggestion?.requiresConfirmation || suggestion?.ambiguous;

        return <div key={column.index}>
          <span className="flex min-w-0 flex-wrap items-center gap-2"><strong className="truncate">{column.header || "Untitled column"}</strong>{needsReview ? <Badge variant="outline">Needs review</Badge> : null}</span>
          <Select value={value} onValueChange={(nextValue) => onChange(column.index, nextValue === unmappedValue ? undefined : nextValue ?? undefined)}>
            <SelectTrigger aria-label={`Map Excel column ${column.header || column.index}`} className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={unmappedValue}>Do not import</SelectItem>
                {studentImportFields.map((field) => <SelectItem key={field.key} value={field.key} disabled={selectedFields.has(field.key) && value !== field.key}>{field.label}{field.required ? " (required)" : ""}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>;
      })}
    </div>
    {error ? <Alert variant="destructive" className="mt-5"><AlertTitle>Preview could not be generated</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
    {previewing ? <p className="field-group-note mt-4" aria-live="polite">TALA is validating the selected worksheet…</p> : null}
  </div>;
}

function ReviewStep({ preview }: { preview?: StudentImportPreview }) {
  if (!preview) return <Alert variant="destructive"><AlertTitle>Preview unavailable</AlertTitle><AlertDescription>Return to column review and generate the preview again.</AlertDescription></Alert>;

  const hasErrors = preview.summary.errorRows > 0;

  return <div className="flex flex-col gap-5">
    <div><h2>Review records</h2><p className="section-copy">Check the normalized records and resolve any errors in the source Excel file before continuing.</p></div>
    <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card text-sm sm:grid-cols-4">
      <div className="flex flex-col gap-1 border-b border-border p-4 sm:border-r sm:border-b-0"><dt className="text-muted-foreground">Total records</dt><dd className="m-0 text-lg font-semibold tabular-nums">{preview.summary.totalRows}</dd></div>
      <div className="flex flex-col gap-1 border-b border-border p-4 sm:border-r sm:border-b-0"><dt className="text-muted-foreground">Ready</dt><dd className="m-0 text-lg font-semibold tabular-nums">{preview.summary.validRows}</dd></div>
      <div className="flex flex-col gap-1 border-r border-border p-4 sm:border-r"><dt className="text-muted-foreground">Warnings</dt><dd className="m-0 text-lg font-semibold tabular-nums">{preview.summary.warningRows}</dd></div>
      <div className="flex flex-col gap-1 p-4"><dt className="text-muted-foreground">Errors</dt><dd className="m-0 text-lg font-semibold tabular-nums">{preview.summary.errorRows}</dd></div>
    </dl>
    {hasErrors ? <Alert variant="destructive"><AlertTitle>Import is blocked until errors are fixed</AlertTitle><AlertDescription>Correct the marked rows in the source Excel file, then upload the workbook again. TALA does not save browser-only corrections for imports.</AlertDescription></Alert> : <Alert><AlertTitle>Records are ready for destination review</AlertTitle><AlertDescription>Warnings do not block an import. Destination selection will be connected in the next phase; no records have been imported yet.</AlertDescription></Alert>}
    <Table>
      <TableHeader><TableRow><TableHead>Row</TableHead><TableHead>Student</TableHead><TableHead>LRN</TableHead><TableHead>Birthday</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead><TableHead>Issues</TableHead></TableRow></TableHeader>
      <TableBody>{preview.rows.map((row) => {
        const status = rowStatus(row);
        const badge = status === "ERROR" ? <Badge variant="destructive">Error</Badge> : status === "WARNING" ? <Badge variant="secondary">Warning</Badge> : <Badge>Ready</Badge>;

        return <TableRow key={row.rowNumber}>
          <TableCell className="tabular-nums">{row.rowNumber}</TableCell>
          <TableCell className="font-medium">{displayStudentName(row.values)}</TableCell>
          <TableCell className="tabular-nums">{displayValue(row.values.lrn)}</TableCell>
          <TableCell>{displayValue(row.values.birthday)}</TableCell>
          <TableCell>{displayValue(row.values.grade)}</TableCell>
          <TableCell>{badge}</TableCell>
          <TableCell className="min-w-72 whitespace-normal">{row.issues.length === 0 ? "—" : <details><summary className="cursor-pointer font-medium">{row.issues.length} {row.issues.length === 1 ? "issue" : "issues"}</summary><ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-muted-foreground">{row.issues.map((issue) => <li key={`${issue.code}-${issue.field}`}>{issue.message}</li>)}</ul></details>}</TableCell>
        </TableRow>;
      })}</TableBody>
    </Table>
  </div>;
}

function DestinationStep({ preview, schoolYears, sections, schoolYearId, sectionId, loading, error, validation, onSchoolYearChange, onSectionChange }: { preview?: StudentImportPreview; schoolYears: SchoolYear[]; sections: Section[]; schoolYearId: string; sectionId: string; loading: boolean; error: string; validation?: StudentImportDestinationValidation; onSchoolYearChange: (schoolYearId: string) => void; onSectionChange: (sectionId: string) => void }) {
  const importedGrades = Array.from(new Set(preview?.rows.map((row) => String(row.values.grade ?? "").trim()).filter(Boolean) ?? []));
  const expectedGrade = importedGrades.length === 1 ? importedGrades[0] : undefined;
  const hasMixedGrades = importedGrades.length > 1;
  const availableSections = sections.filter((section) => section.schoolYearId === schoolYearId && (!expectedGrade || section.grade.name === expectedGrade));
  const selectedSchoolYear = schoolYears.find((schoolYear) => schoolYear.id === schoolYearId);
  const selectedSection = availableSections.find((section) => section.id === sectionId);

  if (loading) return <div className="flex flex-col gap-5"><div><h2>Choose destination</h2><p className="section-copy">Loading available school years and sections.</p></div><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>;

  if (error && schoolYears.length === 0) return <div><h2>Choose destination</h2><Alert variant="destructive" className="mt-5"><AlertTitle>Destination options unavailable</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;

  return <div className="flex flex-col gap-5">
    <div><h2>Choose destination</h2><p className="section-copy">Select where the reviewed students will be enrolled. The section determines the grade.</p></div>
    <div className="grid gap-5 sm:grid-cols-2">
      <Field>
        <FieldLabel>School year</FieldLabel>
        <Select value={schoolYearId} onValueChange={(value) => onSchoolYearChange(value ?? "")}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Choose school year">{selectedSchoolYear?.label ?? "Choose school year"}</SelectValue></SelectTrigger>
          <SelectContent><SelectGroup>{schoolYears.map((schoolYear) => <SelectItem key={schoolYear.id} value={schoolYear.id}>{schoolYear.label}{schoolYear.isActive ? " (active)" : ""}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
      </Field>
      <Field data-disabled={!schoolYearId}>
        <FieldLabel>Section</FieldLabel>
        <Select value={sectionId} disabled={!schoolYearId || availableSections.length === 0 || hasMixedGrades} onValueChange={(value) => onSectionChange(value ?? "")}>
          <SelectTrigger className="w-full"><SelectValue placeholder={schoolYearId ? "Choose section" : "Choose school year first"}>{selectedSection ? `${selectedSection.grade.name} — ${selectedSection.name}` : schoolYearId ? "Choose section" : "Choose school year first"}</SelectValue></SelectTrigger>
          <SelectContent><SelectGroup>{availableSections.map((section) => <SelectItem key={section.id} value={section.id}>{section.grade.name} — {section.name}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
      </Field>
    </div>
    {schoolYears.length === 0 ? <Alert variant="destructive"><AlertTitle>No school years configured</AlertTitle><AlertDescription>Create a school year in School Setup before importing students. <Link href="/school-setup" className="text-link">Go to School Setup</Link></AlertDescription></Alert> : null}
    {hasMixedGrades ? <Alert variant="destructive"><AlertTitle>This workbook contains multiple grades</AlertTitle><AlertDescription>TALA imports one destination section at a time. Split the workbook into one file per grade, then upload the correct file again.</AlertDescription></Alert> : null}
    {schoolYearId && !hasMixedGrades && availableSections.length === 0 ? <Alert><AlertTitle>{expectedGrade ? `No ${expectedGrade} sections configured for this school year` : "No sections configured for this school year"}</AlertTitle><AlertDescription>Add a section in School Setup, then return to this import. <Link href="/school-setup" className="text-link">Go to School Setup</Link></AlertDescription></Alert> : null}
    {selectedSection ? <p className="field-group-note">Selected destination: <strong>{selectedSection.schoolYear.label} · {selectedSection.grade.name} — {selectedSection.name}</strong></p> : null}
    {error && schoolYears.length > 0 ? <Alert variant="destructive"><AlertTitle>Destination could not be checked</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
    {validation?.canConfirm ? <Alert><AlertTitle>Destination is ready</AlertTitle><AlertDescription>TALA found no enrollment conflicts for this destination. You can now confirm the import.</AlertDescription></Alert> : null}
    {validation && !validation.canConfirm ? <Alert variant="destructive"><AlertTitle>Destination has blocking conflicts</AlertTitle><AlertDescription><ul className="mt-2 flex list-disc flex-col gap-1 pl-4">{validation.rows.flatMap((row) => row.issues.map((issue) => <li key={`${row.rowNumber}-${issue.code}`}>Row {row.rowNumber}: {issue.message}</li>))}</ul></AlertDescription></Alert> : null}
  </div>;
}

function CompleteStep({ completion, onImportAnother }: { completion?: StudentImportCompletion; onImportAnother: () => void }) {
  if (!completion) return <Alert variant="destructive"><AlertTitle>Import result unavailable</AlertTitle><AlertDescription>Return to Destination and confirm the import again only after checking its status.</AlertDescription></Alert>;

  return <div className="flex flex-col gap-6">
    <div><h2>Import complete</h2><p className="section-copy">Student records and enrollments were created from the confirmed workbook.</p></div>
    <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card text-sm sm:grid-cols-4">
      <div className="flex flex-col gap-1 border-b border-border p-4 sm:border-r sm:border-b-0"><dt className="text-muted-foreground">Rows processed</dt><dd className="m-0 text-lg font-semibold tabular-nums">{completion.summary.totalRows}</dd></div>
      <div className="flex flex-col gap-1 border-b border-border p-4 sm:border-r sm:border-b-0"><dt className="text-muted-foreground">New students</dt><dd className="m-0 text-lg font-semibold tabular-nums">{completion.summary.createdStudents}</dd></div>
      <div className="flex flex-col gap-1 border-r border-border p-4 sm:border-r"><dt className="text-muted-foreground">Existing students reused</dt><dd className="m-0 text-lg font-semibold tabular-nums">{completion.summary.reusedStudents}</dd></div>
      <div className="flex flex-col gap-1 p-4"><dt className="text-muted-foreground">Enrollments created</dt><dd className="m-0 text-lg font-semibold tabular-nums">{completion.summary.createdEnrollments}</dd></div>
    </dl>
    <div className="flex flex-wrap gap-3"><Button variant="outline" onClick={onImportAnother}>Import another file</Button><Link href="/students" className="button button-primary">View students</Link></div>
  </div>;
}
