"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api/authenticated-fetch";
import { createTeacher } from "./teachers-api";
import type { CreateTeacherInput, TeacherStationStatus } from "./types";

type Errors = Partial<Record<"firstName" | "lastName" | "employeeNumber" | "designation", string>>;
const stationStatuses: { label: string; value: TeacherStationStatus }[] = [{ label: "Own station", value: "OWN_STATION" }, { label: "Reassigned", value: "REASSIGNED" }, { label: "Borrowed", value: "BORROWED" }, { label: "Clustered", value: "CLUSTERED" }];
const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const optional = (data: FormData, key: string) => text(data, key) || undefined;

export function TeacherForm() {
  const router = useRouter();
  const [stationStatus, setStationStatus] = useState<TeacherStationStatus | "">("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<string>();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Errors = {};
    if (!text(data, "firstName")) next.firstName = "Enter the teacher’s first name.";
    if (!text(data, "lastName")) next.lastName = "Enter the teacher’s last name.";
    if (!text(data, "employeeNumber")) next.employeeNumber = "Enter the employee number.";
    if (!text(data, "designation")) next.designation = "Enter the designation.";
    setErrors(next);
    if (Object.keys(next).length) { toast.error("Check the highlighted fields"); return; }

    const body: CreateTeacherInput = { firstName: text(data, "firstName"), middleName: optional(data, "middleName"), lastName: text(data, "lastName"), suffix: optional(data, "suffix"), employeeNumber: text(data, "employeeNumber"), designation: text(data, "designation"), stationStatus: stationStatus || undefined, gender: optional(data, "gender"), birthday: optional(data, "birthday"), civilStatus: optional(data, "civilStatus"), degreeFinished: optional(data, "degreeFinished"), prcSpecialization: optional(data, "prcSpecialization"), minorSpecialization: optional(data, "minorSpecialization"), postGraduateDegree: optional(data, "postGraduateDegree"), originalAppointmentDate: optional(data, "originalAppointmentDate"), stationStartDate: optional(data, "stationStartDate"), cellphoneNumber: optional(data, "cellphoneNumber"), personalEmail: optional(data, "personalEmail"), depEdEmail: optional(data, "depEdEmail"), office365Account: optional(data, "office365Account"), r4a3Account: optional(data, "r4a3Account"), province: optional(data, "province"), town: optional(data, "town"), barangay: optional(data, "barangay"), street: optional(data, "street") };
    setSaving(true);
    const toastId = toast.loading("Creating teacher record…");
    try {
      const response = await createTeacher(body);
      const created = await response.json() as { id: string };
      toast.success("Teacher record created", { id: toastId, description: "The personnel record is now available in the directory." });
      setCreatedId(created.id);
    } catch (error) {
      toast.error("Could not create teacher", { id: toastId, description: error instanceof ApiError ? error.message : "Please check the details and try again." });
    } finally { setSaving(false); }
  }

  return <><Link href="/teachers" className="back-link">← Teachers</Link><header className="page-heading form-heading"><div><h1>Add teacher</h1><p>Create a personnel record. Fields marked * are required.</p></div></header><form className="record-form teacher-form" noValidate onSubmit={submit}><FieldGroup className="gap-5"><FieldSet><FieldLegend>Identity</FieldLegend><FieldDescription>Use the teacher’s official personnel record. Government ID numbers are intentionally not stored in TALA.</FieldDescription><div className="form-grid teacher-name-grid"><FormField label="Employee Number *" name="employeeNumber" error={errors.employeeNumber} className="field-span-full"><Input id="employeeNumber" name="employeeNumber" autoComplete="off" className="tabular" aria-invalid={Boolean(errors.employeeNumber)} /></FormField><FormField label="Last Name *" name="lastName" error={errors.lastName}><Input id="lastName" name="lastName" autoComplete="family-name" aria-invalid={Boolean(errors.lastName)} /></FormField><FormField label="First Name *" name="firstName" error={errors.firstName}><Input id="firstName" name="firstName" autoComplete="given-name" aria-invalid={Boolean(errors.firstName)} /></FormField><FormField label="Middle Name" name="middleName"><Input id="middleName" name="middleName" /></FormField><FormField label="Suffix" name="suffix"><Input id="suffix" name="suffix" placeholder="Jr., III, if applicable" /></FormField></div></FieldSet><FieldSet><FieldLegend>Appointment and designation</FieldLegend><div className="form-grid"><FormField label="Designation *" name="designation" error={errors.designation}><Input id="designation" name="designation" placeholder="Teacher III" aria-invalid={Boolean(errors.designation)} /></FormField><Field><FieldLabel>Station status</FieldLabel><Select value={stationStatus || null} onValueChange={(value) => setStationStatus((value ?? "") as TeacherStationStatus | "")} items={stationStatuses}><SelectTrigger><SelectValue placeholder="Select station status" /></SelectTrigger><SelectContent><SelectGroup>{stationStatuses.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field><FormField label="Original DepEd appointment" name="originalAppointmentDate"><Input id="originalAppointmentDate" name="originalAppointmentDate" type="date" /></FormField><FormField label="First day at current station" name="stationStartDate"><Input id="stationStartDate" name="stationStartDate" type="date" /></FormField></div></FieldSet><FieldSet><FieldLegend>Personal information</FieldLegend><div className="form-grid three"><FormField label="Gender" name="gender"><Input id="gender" name="gender" /></FormField><FormField label="Birthday" name="birthday"><Input id="birthday" name="birthday" type="date" /></FormField><FormField label="Civil status" name="civilStatus"><Input id="civilStatus" name="civilStatus" /></FormField></div></FieldSet><FieldSet><FieldLegend>Education and specialization</FieldLegend><div className="form-grid"><FormField label="Degree finished / baccalaureate" name="degreeFinished"><Input id="degreeFinished" name="degreeFinished" /></FormField><FormField label="Postgraduate degree" name="postGraduateDegree"><Input id="postGraduateDegree" name="postGraduateDegree" /></FormField><FormField label="PRC specialization" name="prcSpecialization"><Input id="prcSpecialization" name="prcSpecialization" /></FormField><FormField label="Minor specialization" name="minorSpecialization"><Input id="minorSpecialization" name="minorSpecialization" /></FormField></div></FieldSet><FieldSet><FieldLegend>Contact and accounts</FieldLegend><div className="form-grid"><FormField label="Cellphone number" name="cellphoneNumber"><Input id="cellphoneNumber" name="cellphoneNumber" inputMode="tel" /></FormField><FormField label="Personal email" name="personalEmail"><Input id="personalEmail" name="personalEmail" type="email" autoComplete="email" /></FormField><FormField label="DepEd email" name="depEdEmail"><Input id="depEdEmail" name="depEdEmail" type="email" /></FormField><FormField label="Office 365 account" name="office365Account"><Input id="office365Account" name="office365Account" /></FormField><FormField label="R4A-3 account" name="r4a3Account" className="field-span-full"><Input id="r4a3Account" name="r4a3Account" /></FormField></div></FieldSet><FieldSet><FieldLegend>Address</FieldLegend><div className="form-grid"><FormField label="Province" name="province"><Input id="province" name="province" /></FormField><FormField label="Town" name="town"><Input id="town" name="town" /></FormField><FormField label="Barangay" name="barangay"><Input id="barangay" name="barangay" /></FormField><FormField label="Street" name="street"><Input id="street" name="street" /></FormField></div></FieldSet></FieldGroup><div className="form-actions"><Button nativeButton={false} variant="outline" render={<Link href="/teachers" />}>Cancel</Button><Button type="submit" size="lg" disabled={saving}>{saving ? "Saving…" : "Save teacher"}</Button></div></form><Dialog open={Boolean(createdId)}><DialogContent showCloseButton={false} className="max-w-md p-0"><DialogHeader className="gap-3 px-6 pt-6"><DialogTitle className="text-lg">Teacher added successfully</DialogTitle><DialogDescription className="text-sm leading-6">The personnel record is now available in the Teacher directory. Teacher sign-in accounts are managed separately.</DialogDescription></DialogHeader><DialogFooter className="gap-3 px-6 py-5 sm:flex-row"><Button variant="outline" className="w-full sm:w-auto" onClick={() => setCreatedId(undefined)}>Add another teacher</Button><Button className="w-full sm:w-auto" onClick={() => router.push("/teachers")}>Go to Teachers</Button></DialogFooter></DialogContent></Dialog></>;
}

function FormField({ label, name, error, className, children }: { label: string; name: string; error?: string; className?: string; children: React.ReactNode }) { return <Field className={className} data-invalid={Boolean(error)}><FieldLabel htmlFor={name} className="items-center gap-1 whitespace-nowrap">{label}</FieldLabel>{children}{error ? <FieldError>{error}</FieldError> : null}</Field>; }
