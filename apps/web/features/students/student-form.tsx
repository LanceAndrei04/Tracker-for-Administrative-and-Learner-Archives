"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
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
      <fieldset><legend>Learner identity</legend><p className="field-group-note">Use the learner’s official school record. LRN must contain exactly 12 digits.</p><div className="identity-editor"><button type="button" className="form-photo-picker" onClick={() => photoInput.current?.click()}><span className="form-photo-placeholder">AS</span><span>{photoName ? "Replace photo" : "Add photo"}</span><small>{photoName || "Optional"}</small></button><input ref={photoInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhotoName(event.target.files?.[0]?.name ?? "")} /><div className="form-grid student-name-grid"><Field label="LRN" name="lrn" error={errors.lrn} className="field-span-full"><input name="lrn" inputMode="numeric" pattern="[0-9]{12}" maxLength={12} defaultValue={edit ? initialValues.lrn : ""} placeholder="12-digit learner reference number" className="tabular" /></Field><Field label="Last name" name="lastName" error={errors.lastName}><input name="lastName" autoComplete="family-name" defaultValue={edit ? initialValues.lastName : ""} /></Field><Field label="First name" name="firstName" error={errors.firstName}><input name="firstName" autoComplete="given-name" defaultValue={edit ? initialValues.firstName : ""} /></Field><Field label="Middle name" name="middleName"><input name="middleName" defaultValue={edit ? initialValues.middleName : ""} /></Field><Field label="Suffix" name="suffix"><input name="suffix" placeholder="Jr., III, if applicable" defaultValue={edit ? initialValues.suffix : ""} /></Field></div></div></fieldset>
      <fieldset><legend>Personal details</legend><div className="form-grid"><Field label="Birthday" name="birthday" error={errors.birthday}><input name="birthday" type="date" defaultValue={edit ? initialValues.birthday : ""} /></Field><Field label="Birthplace" name="birthplace"><input name="birthplace" defaultValue={edit ? initialValues.birthplace : ""} /></Field><Field label="Address" name="address" className="field-span-full"><input name="address" defaultValue={edit ? initialValues.address : ""} /></Field></div></fieldset>
      <fieldset><legend>Parent and guardian</legend><div className="form-grid"><Field label="Guardian name" name="guardian"><input name="guardian" defaultValue={edit ? initialValues.guardian : ""} /></Field><Field label="Contact number" name="contactNumber" error={errors.contactNumber}><input name="contactNumber" inputMode="tel" defaultValue={edit ? initialValues.contactNumber : ""} placeholder="09XX XXX XXXX" /></Field></div></fieldset>
      <fieldset><legend>Current enrollment</legend><p className="field-group-note">This creates or updates the school-year placement, not the student identity.</p><div className="form-grid three"><Field label="School year" name="schoolYear"><select name="schoolYear" defaultValue="2026–2027"><option>2026–2027</option></select></Field><Field label="Grade" name="grade"><select name="grade" defaultValue="Grade 6"><option>Grade 4</option><option>Grade 5</option><option>Grade 6</option></select></Field><Field label="Section" name="section"><select name="section" defaultValue="Rizal"><option>Rizal</option><option>Mabini</option></select></Field></div></fieldset>
      <fieldset><legend>Remarks</legend><Field label="Notes" name="remarks"><textarea name="remarks" rows={3} defaultValue={edit ? initialValues.remarks : ""} /></Field></fieldset>
      {edit ? <p className="concurrency-note"><Icon name="alert" />TALA checks the latest saved version before applying changes. If another teacher updates this record first, you will be asked to reload it.</p> : null}
      <div className="form-actions"><Link href={backHref} className="button button-secondary">Cancel</Link><button className="button button-primary" type="submit" disabled={saveState === "saving"}>{saveState === "saving" ? "Saving…" : edit ? "Save changes" : "Save student"}</button></div>
      <SaveFeedback state={saveState} message={resultMessage} />
    </form></>;
}

function Field({ label, name, error, className, children }: { label: string; name: string; error?: string; className?: string; children: React.ReactNode }) { return <label className={className}><span>{label}</span>{children}{error ? <small id={name + "-error"} className="field-error">{error}</small> : null}</label>; }

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
  return <p className={className} role={state === "success" ? "status" : "alert"}>{message}{state === "conflict" ? <button className="text-link">Reload latest version</button> : null}</p>;
}
