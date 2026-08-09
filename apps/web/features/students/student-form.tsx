"use client";
import Link from "next/link";
import { useState } from "react";

const fields = [
  ["lrn", "LRN", "123457000001"], ["firstName", "First name", "Ana"], ["middleName", "Middle name", ""], ["lastName", "Last name", "Santos"],
  ["birthday", "Birthday", "2014-05-18"], ["birthplace", "Birthplace", "Quezon City"], ["address", "Address", "18 Sampaguita Street, Quezon City"],
  ["guardian", "Guardian name", "Maribel Santos"], ["contact", "Contact number", "0917 555 0182"],
];

export function StudentForm({ edit = false }: { edit?: boolean }) {
  const [saved, setSaved] = useState(false);
  return <><Link href="/students" className="back-link">← Students</Link><header className="page-heading"><div><h1>{edit ? "Edit student" : "Add student"}</h1><p>{edit ? "Update Ana Santos’ record." : "Create a student record and first enrollment."}</p></div></header>
    <form className="record-form" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
      <fieldset><legend>Student information</legend><div className="form-grid">{fields.slice(0, 7).map(([key, label, value]) => <label key={key}>{label}<input defaultValue={edit ? value : ""} placeholder={label === "LRN" ? "12-digit learner reference number" : undefined} type={key === "birthday" ? "date" : "text"} required={key === "firstName" || key === "lastName"} className={key === "lrn" ? "tabular" : ""} /></label>)}</div></fieldset>
      <fieldset><legend>Parent and guardian</legend><div className="form-grid">{fields.slice(7).map(([key, label, value]) => <label key={key}>{label}<input defaultValue={edit ? value : ""} type={key === "contact" ? "tel" : "text"} /></label>)}</div></fieldset>
      <fieldset><legend>Current enrollment</legend><div className="form-grid three"><label>School year<select defaultValue="2026–2027"><option>2026–2027</option></select></label><label>Grade<select><option>Grade 6</option><option>Grade 5</option></select></label><label>Section<select><option>Rizal</option><option>Mabini</option></select></label></div></fieldset>
      <fieldset><legend>Remarks</legend><label>Notes<textarea rows={3} defaultValue={edit ? "Prefers guardian contact after 3 PM." : ""} /></label></fieldset>
      <div className="form-actions"><Link href="/students" className="button button-secondary">Cancel</Link><button className="button button-primary" type="submit">{edit ? "Save changes" : "Save student"}</button></div>
      {saved ? <p className="form-success" role="status">{edit ? "Changes saved in the demo." : "Student saved in the demo."} The API adapter will replace this action.</p> : null}
    </form></>;
}
