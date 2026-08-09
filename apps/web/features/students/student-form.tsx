"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field as ShadcnField, FieldError, FieldLabel } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { talaApi, type StudentSaveResult } from "@/lib/api/tala-api";

type FormErrors = Partial<Record<"lrn" | "firstName" | "lastName" | "birthday" | "contactNumber", string>>;
type SaveState = "idle" | "saving" | "success" | "conflict" | "error";

const initialValues = {
  lrn: "123457000001",
  firstName: "Ana",
  middleName: "Marie",
  lastName: "Santos",
  suffix: "",
  birthday: "2014-05-18",
  birthplace: "Quezon City",
  address: "18 Sampaguita Street, Quezon City",
  guardian: "Maribel Santos",
  contactNumber: "0917 555 0182",
  remarks: "Prefers guardian contact after 3 PM.",
};

export function StudentForm({ edit = false }: { edit?: boolean }) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [resultMessage, setResultMessage] = useState("");
  const [photoName, setPhotoName] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);
  const params = useParams<{ id?: string }>();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const backHref = edit && studentId ? "/students/" + studentId : "/students";

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextErrors = validate(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSaveState("idle");
      toast.error("Check the highlighted fields", { description: "Correct the form details before saving the student record." });
      return;
    }

    setSaveState("saving");
    const toastId = toast.loading(edit ? "Saving changes…" : "Saving student…");
    const result = await talaApi.saveStudent();
    setResultMessage(getResultMessage(result, edit));
    setSaveState(result.status);
    if (result.status === "success") toast.success(edit ? "Changes saved" : "Student saved", { id: toastId, description: resultMessage || getResultMessage(result, edit) });
    if (result.status === "conflict") toast.warning("Record updated elsewhere", { id: toastId, description: getResultMessage(result, edit) });
    if (result.status === "error") toast.error("Could not save student", { id: toastId, description: result.message });
  }

  return <><Link href={backHref} className="back-link">← {edit ? "Ana Santos" : "Students"}</Link><header className="page-heading form-heading"><div><h1>{edit ? "Edit student" : "Add student"}</h1><p>{edit ? "Update Ana Santos’ learner record and current enrollment." : "Create a learner record and first enrollment."}</p></div></header>
    <form className="record-form student-form" noValidate onSubmit={submitForm}>
      <fieldset><legend>Learner identity</legend><p className="field-group-note">Use the learner’s official school record. LRN must contain exactly 12 digits.</p><div className="identity-editor"><Button type="button" variant="outline" className="form-photo-picker" onClick={() => photoInput.current?.click()}><span className="form-photo-placeholder">AS</span><span>{photoName ? "Replace photo" : "Add photo"}</span><small>{photoName || "Optional"}</small></Button><input ref={photoInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhotoName(event.target.files?.[0]?.name ?? "")} /><div className="form-grid student-name-grid"><Field label="LRN" name="lrn" error={errors.lrn} className="field-span-full"><Input id="lrn" name="lrn" inputMode="numeric" pattern="[0-9]{12}" maxLength={12} defaultValue={edit ? initialValues.lrn : ""} placeholder="12-digit learner reference number" className="tabular" aria-invalid={Boolean(errors.lrn)} aria-describedby={errors.lrn ? "lrn-error" : undefined} /></Field><Field label="Last name" name="lastName" error={errors.lastName}><Input id="lastName" name="lastName" autoComplete="family-name" defaultValue={edit ? initialValues.lastName : ""} aria-invalid={Boolean(errors.lastName)} aria-describedby={errors.lastName ? "lastName-error" : undefined} /></Field><Field label="First name" name="firstName" error={errors.firstName}><Input id="firstName" name="firstName" autoComplete="given-name" defaultValue={edit ? initialValues.firstName : ""} aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? "firstName-error" : undefined} /></Field><Field label="Middle name" name="middleName"><Input id="middleName" name="middleName" defaultValue={edit ? initialValues.middleName : ""} /></Field><Field label="Suffix" name="suffix"><Input id="suffix" name="suffix" placeholder="Jr., III, if applicable" defaultValue={edit ? initialValues.suffix : ""} /></Field></div></div></fieldset>
      <fieldset><legend>Personal details</legend><div className="form-grid"><Field label="Birthday" name="birthday" error={errors.birthday}><Input id="birthday" name="birthday" type="date" defaultValue={edit ? initialValues.birthday : ""} aria-invalid={Boolean(errors.birthday)} aria-describedby={errors.birthday ? "birthday-error" : undefined} /></Field><Field label="Birthplace" name="birthplace"><Input id="birthplace" name="birthplace" defaultValue={edit ? initialValues.birthplace : ""} /></Field><Field label="Address" name="address" className="field-span-full"><Input id="address" name="address" defaultValue={edit ? initialValues.address : ""} /></Field></div></fieldset>
      <fieldset><legend>Parent and guardian</legend><div className="form-grid"><Field label="Guardian name" name="guardian"><Input id="guardian" name="guardian" defaultValue={edit ? initialValues.guardian : ""} /></Field><Field label="Contact number" name="contactNumber" error={errors.contactNumber}><Input id="contactNumber" name="contactNumber" inputMode="tel" defaultValue={edit ? initialValues.contactNumber : ""} placeholder="09XX XXX XXXX" aria-invalid={Boolean(errors.contactNumber)} aria-describedby={errors.contactNumber ? "contactNumber-error" : undefined} /></Field></div></fieldset>
      <fieldset><legend>Current enrollment</legend><p className="field-group-note">This creates or updates the school-year placement, not the student identity.</p><div className="form-grid three"><Field label="School year" name="schoolYear"><select name="schoolYear" defaultValue="2026–2027"><option>2026–2027</option></select></Field><Field label="Grade" name="grade"><select name="grade" defaultValue="Grade 6"><option>Grade 4</option><option>Grade 5</option><option>Grade 6</option></select></Field><Field label="Section" name="section"><select name="section" defaultValue="Rizal"><option>Rizal</option><option>Mabini</option></select></Field></div></fieldset>
      <fieldset><legend>Remarks</legend><Field label="Notes" name="remarks"><Textarea id="remarks" name="remarks" rows={3} defaultValue={edit ? initialValues.remarks : ""} /></Field></fieldset>
      {edit ? <p className="concurrency-note"><Icon name="alert" />TALA checks the latest saved version before applying changes. If another teacher updates this record first, you will be asked to reload it.</p> : null}
      <div className="form-actions"><Link href={backHref} className="button button-secondary">Cancel</Link><Button type="submit" size="lg" disabled={saveState === "saving"}>{saveState === "saving" ? "Saving…" : edit ? "Save changes" : "Save student"}</Button></div>
      <SaveFeedback state={saveState} message={resultMessage} />
    </form></>;
}

function Field({ label, name, error, className, children }: { label: string; name: string; error?: string; className?: string; children: React.ReactNode }) { return <ShadcnField className={className} data-invalid={Boolean(error)}><FieldLabel htmlFor={name}>{label}</FieldLabel>{children}{error ? <FieldError id={name + "-error"}>{error}</FieldError> : null}</ShadcnField>; }

function validate(data: FormData): FormErrors {
  const lrn = String(data.get("lrn") ?? "").trim();
  const firstName = String(data.get("firstName") ?? "").trim();
  const lastName = String(data.get("lastName") ?? "").trim();
  const birthday = String(data.get("birthday") ?? "");
  const contactNumber = String(data.get("contactNumber") ?? "").replace(/[\s()-]/g, "");
  const errors: FormErrors = {};
  if (!/^\d{12}$/.test(lrn)) errors.lrn = "Enter a 12-digit LRN.";
  if (!firstName) errors.firstName = "Enter the learner’s first name.";
  if (!lastName) errors.lastName = "Enter the learner’s last name.";
  if (birthday && Number.isNaN(new Date(birthday).getTime())) errors.birthday = "Enter a valid birthday.";
  if (contactNumber && !/^(09\d{9}|639\d{9})$/.test(contactNumber)) errors.contactNumber = "Use a valid Philippine mobile number.";
  return errors;
}

function getResultMessage(result: StudentSaveResult, edit: boolean) {
  if (result.status === "success") return edit ? "Changes saved. The record is up to date." : "Student saved. The first enrollment is ready.";
  if (result.status === "conflict") return "This record was updated by someone else. Reload the latest version before saving.";
  return result.message;
}

function SaveFeedback({ state, message }: { state: SaveState; message: string }) {
  if (state !== "conflict") return null;
  const className = "form-conflict";
  return <p className={className} role="alert">{message}<button className="text-link">Reload latest version</button></p>;
}
