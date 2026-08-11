"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/lib/api/authenticated-fetch";
import { changeEnrollmentSection, getSections, getStudent } from "@/features/students/students-api";
import type { Enrollment, Section, Student } from "@/features/students/types";

const date = (value?: string | null) => value ? new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "—";
const name = (student: Student) => [student.firstName, student.middleName, student.lastName, student.suffix].filter(Boolean).join(" ");
const initials = (student: Student) => [student.firstName, student.lastName].map((part) => part[0]).join("");
const current = (enrollments: Enrollment[]) => enrollments.find((item) => item.schoolYear.isActive);

export function StudentProfile({ id }: { id: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<Student>();
  const [error, setError] = useState("");

  const refreshStudent = async () => setStudent(await getStudent(id));

  useEffect(() => {
    let cancelled = false;
    getStudent(id)
      .then((value) => { if (!cancelled) setStudent(value); })
      .catch(() => !cancelled && setError("We could not load this student record. It may no longer be available."));
    return () => { cancelled = true; };
  }, [id]);

  if (error) return <><Link href="/students" className="back-link">← Students</Link><Alert variant="destructive"><AlertTitle>Student record unavailable</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></>;
  if (!student) return <div className="flex flex-col gap-5"><Skeleton className="h-4 w-24" /><Skeleton className="h-36 w-full" /><Skeleton className="h-64 w-full" /></div>;

  const enrollment = current(student.enrollments);
  return <>
    <Link href="/students" className="back-link">← Students</Link>
    <header className="student-record-header">
      <span className="profile-tab tab-grade-6" />
      <div className="profile-photo profile-photo-placeholder" aria-label={`${name(student)} photo placeholder`}><span>{initials(student)}</span><small>No photo</small></div>
      <div className="student-record-title"><p className="record-kicker">Student record</p><h1>{name(student)}</h1><div className="record-identifiers">{enrollment ? <><span>{enrollment.section.grade.name}</span><span>{enrollment.section.name}</span></> : <span>Not currently enrolled</span>}<span>LRN <b className="tabular">{student.lrn ?? "—"}</b></span></div></div>
      <div className="record-header-actions">{enrollment ? <Badge variant="secondary">{enrollment.status}</Badge> : null}<Button type="button" variant="outline" onClick={() => router.push(`/students/${student.id}/edit`)}>Edit student</Button></div>
    </header>
    <Tabs defaultValue="overview"><TabsList variant="line" className="profile-tabs" aria-label="Student record sections"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="enrollment">Enrollment history</TabsTrigger><TabsTrigger value="files">Files</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList><TabsContent value="overview"><Overview student={student} enrollment={enrollment} onEnrollmentChanged={refreshStudent} /></TabsContent><TabsContent value="enrollment"><EnrollmentHistory enrollments={student.enrollments} /></TabsContent><TabsContent value="files"><Placeholder title="Files" text="Private student files will be connected in a later phase." /></TabsContent><TabsContent value="activity"><Placeholder title="Activity" text="Record activity will be connected in a later phase." /></TabsContent></Tabs>
  </>;
}

function Overview({ student, enrollment, onEnrollmentChanged }: { student: Student; enrollment?: Enrollment; onEnrollmentChanged: () => Promise<void> }) {
  return <div className="record-detail-layout"><div className="record-detail-content">
    <section className="info-section personal-information"><h2>Personal information</h2><dl className="name-breakdown"><div><dt>First Name</dt><dd>{student.firstName}</dd></div><div><dt>Middle Name</dt><dd>{student.middleName ?? "—"}</dd></div><div><dt>Last Name</dt><dd>{student.lastName}</dd></div><div><dt>Suffix</dt><dd>{student.suffix ?? "—"}</dd></div></dl><dl className="personal-details-grid"><div><dt>Birthday</dt><dd>{date(student.birthday)}</dd></div><div><dt>Birthplace</dt><dd>{student.birthplace ?? "—"}</dd></div><div><dt>Address</dt><dd>{student.address ?? "—"}</dd></div></dl></section>
    <InfoSection title="Parent and Guardian" items={[["Guardian", student.guardianName], ["Contact Number", student.contactNumber], ["Father's Name", student.fatherName], ["Mother's Name", student.motherName]]} />
    <InfoSection title="Remarks" items={[["Notes", student.remarks ?? "—"]]} />
  </div><aside className="record-summary"><section><p className="record-kicker">Current enrollment</p>{enrollment ? <><dl><div><dt>School year</dt><dd className="current-school-year"><span>{enrollment.schoolYear.label}</span><Badge>Current</Badge></dd></div><div><dt>Grade</dt><dd>{enrollment.section.grade.name}</dd></div><div><dt>Section</dt><dd>{enrollment.section.name}</dd></div><div><dt>Adviser</dt><dd>—</dd></div><div><dt>Status</dt><dd><Badge variant="secondary">{enrollment.status}</Badge></dd></div></dl><ChangeEnrollmentDialog enrollment={enrollment} onSaved={onEnrollmentChanged} /></> : <p className="summary-note">No enrollment is recorded for the active school year.</p>}</section><section><p className="record-kicker">Record Status</p><p className="summary-note">Last updated {date(student.updatedAt)}.</p></section></aside></div>;
}

function ChangeEnrollmentDialog({ enrollment, onSaved }: { enrollment: Enrollment; onSaved: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionId, setSectionId] = useState(enrollment.sectionId);
  const [gradeId, setGradeId] = useState(enrollment.section.gradeId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const schoolYearSections = useMemo(() => sections.filter((section) => section.schoolYearId === enrollment.schoolYearId), [sections, enrollment.schoolYearId]);
  const availableGrades = useMemo(() => Array.from(new Map(schoolYearSections.map((section) => [section.grade.id, section.grade])).values()), [schoolYearSections]);
  const availableSections = useMemo(() => schoolYearSections.filter((section) => section.gradeId === gradeId), [schoolYearSections, gradeId]);

  async function openDialog() {
    setSectionId(enrollment.sectionId);
    setGradeId(enrollment.section.gradeId);
    setError("");
    setOpen(true);
    if (sections.length) return;
    setLoading(true);
    try {
      setSections(await getSections());
    } catch {
      setError("We could not load the sections for this school year.");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!sectionId) { setError("Choose a section."); return; }
    if (sectionId === enrollment.sectionId) { setOpen(false); return; }
    setSaving(true);
    setError("");
    const toastId = toast.loading("Updating current enrollment…");
    try {
      await changeEnrollmentSection(enrollment.id, sectionId);
      await onSaved();
      toast.success("Current enrollment updated", { id: toastId, description: "Previous school-year records were not changed." });
      setOpen(false);
    } catch (reason) {
      const message = reason instanceof ApiError ? reason.message : "Please try again.";
      setError(message);
      toast.error("Could not update enrollment", { id: toastId, description: message });
    } finally { setSaving(false); }
  }

  return <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) setError(""); }}>
    <Button type="button" variant="outline" className="mt-4 w-full" onClick={openDialog}>Change current enrollment</Button>
    <DialogContent><DialogHeader><DialogTitle>Change current enrollment</DialogTitle><DialogDescription>This corrects the grade and section for {enrollment.schoolYear.label}. Previous school-year enrollment records will remain unchanged.</DialogDescription></DialogHeader><div className="flex flex-col gap-4"><Field><FieldLabel htmlFor="enrollment-grade">Grade</FieldLabel><select id="enrollment-grade" value={gradeId} disabled={loading || saving} onChange={(event) => { setGradeId(event.target.value); setSectionId(""); }}><option value="">Choose grade</option>{availableGrades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}</select></Field><Field data-invalid={Boolean(error)}><FieldLabel htmlFor="enrollment-section">Section</FieldLabel><select id="enrollment-section" value={sectionId} disabled={loading || saving || !gradeId} onChange={(event) => setSectionId(event.target.value)} aria-invalid={Boolean(error)}><option value="">{gradeId ? "Choose section" : "Choose a grade first"}</option>{availableSections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select>{error ? <FieldError>{error}</FieldError> : null}</Field></div><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button><Button type="button" onClick={save} disabled={loading || saving || !sectionId}>{saving ? "Saving…" : "Save enrollment"}</Button></DialogFooter></DialogContent>
  </Dialog>;
}

function EnrollmentHistory({ enrollments }: { enrollments: Enrollment[] }) { return <section className="tab-content"><div className="tab-content-heading"><div><h2>Enrollment history</h2><p>The active school-year placement is marked Current. Earlier rows are preserved school records.</p></div></div><div className="table-shell"><table className="record-table enrollment-table"><thead><tr><th>School year</th><th>Grade</th><th>Section</th><th>Status</th><th>Date enrolled</th></tr></thead><tbody>{enrollments.map((enrollment) => <tr key={enrollment.id} data-current={enrollment.schoolYear.isActive || undefined}><td><div className="enrollment-year-cell"><span>{enrollment.schoolYear.label}</span>{enrollment.schoolYear.isActive ? <Badge>Current</Badge> : null}</div></td><td>{enrollment.section.grade.name}</td><td>{enrollment.section.name}</td><td><Badge variant="secondary">{enrollment.status}</Badge></td><td>{date(enrollment.dateEnrolled ?? enrollment.createdAt)}</td></tr>)}</tbody></table>{enrollments.length === 0 ? <div className="empty-state"><h2>No enrollment history</h2><p>This student does not yet have an enrollment record.</p></div> : null}</div></section>; }
function Placeholder({ title, text }: { title: string; text: string }) { return <section className="tab-content"><div className="tab-content-heading"><div><h2>{title}</h2><p>{text}</p></div></div></section>; }
function InfoSection({ title, items }: { title: string; items: [string, string | null][] }) { return <section className="info-section"><h2>{title}</h2><dl>{items.map(([label, itemValue]) => <div key={label}><dt>{label}</dt><dd>{itemValue ?? "—"}</dd></div>)}</dl></section>; }
