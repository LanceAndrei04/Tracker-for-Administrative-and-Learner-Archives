"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PencilIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTeacher } from "./teachers-api";
import type { Teacher, TeacherStationStatus } from "./types";

function initials(teacher: Teacher) { return `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase(); }
function displayName(teacher: Teacher) { return [teacher.firstName, teacher.middleName, teacher.lastName, teacher.suffix].filter(Boolean).join(" "); }
function displayStationStatus(status: TeacherStationStatus | null) { return status ? status.toLowerCase().split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ") : "—"; }
function valueOf(value: string | null | undefined) { return value || "—"; }
function dateOf(value: string | null | undefined) { return value ? new Intl.DateTimeFormat("en-PH", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value)) : "—"; }

export function TeacherProfile({ id }: { id: string }) {
  const [teacher, setTeacher] = useState<Teacher>();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getTeacher(id).then((record) => !cancelled && setTeacher(record)).catch(() => !cancelled && setError("We could not load this teacher record. Check your connection and try again."));
    return () => { cancelled = true; };
  }, [id]);

  if (error) return <><Link href="/teachers" className="back-link">← Teachers</Link><Alert variant="destructive"><AlertTitle>Teacher record unavailable</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></>;
  if (!teacher) return <div className="flex flex-col gap-5"><Skeleton className="h-5 w-24" /><Skeleton className="h-36 w-full" /><Skeleton className="h-80 w-full" /></div>;

  return <>
    <Link href="/teachers" className="back-link">← Teachers</Link>
    <header className="teacher-record-header"><span className="profile-tab tab-teacher" /><Avatar className="teacher-profile-photo" size="lg"><AvatarFallback>{initials(teacher)}</AvatarFallback></Avatar><div className="student-record-title"><p className="record-kicker">Teacher record</p><h1>{displayName(teacher)}</h1><div className="record-identifiers"><span>{teacher.designation}</span><span className="tabular">{teacher.employeeNumber}</span></div></div><div className="record-header-actions"><Badge variant="outline">{displayStationStatus(teacher.stationStatus)}</Badge><Button nativeButton={false} variant="outline" render={<Link href={`/teachers/${teacher.id}/edit`} />}><PencilIcon data-icon="inline-start" />Edit</Button></div></header>
    <Tabs defaultValue="overview"><TabsList variant="line" className="profile-tabs" aria-label="Teacher record sections"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="files">Files</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList><TabsContent value="overview"><TeacherOverview teacher={teacher} /></TabsContent><TabsContent value="files"><Placeholder title="Files" text="Private teacher files will be connected in a later phase." /></TabsContent><TabsContent value="activity"><Placeholder title="Activity" text="Teacher record activity will be connected in a later phase." /></TabsContent></Tabs>
  </>;
}

function TeacherOverview({ teacher }: { teacher: Teacher }) {
  return <div className="record-detail-layout"><div className="record-detail-content"><section className="info-section personal-information"><h2>Identity</h2><dl className="name-breakdown teacher-name-breakdown"><div><dt>First Name</dt><dd>{teacher.firstName}</dd></div><div><dt>Middle Name</dt><dd>{valueOf(teacher.middleName)}</dd></div><div><dt>Last Name</dt><dd>{teacher.lastName}</dd></div><div><dt>Suffix</dt><dd>{valueOf(teacher.suffix)}</dd></div></dl></section><InfoSection title="Professional information" items={[["Designation", teacher.designation], ["Employee number", teacher.employeeNumber], ["Station status", displayStationStatus(teacher.stationStatus)]]} /><PersonnelSections teacher={teacher} /></div><aside className="record-summary"><section><p className="record-kicker">Record status</p><p className="summary-note">Last updated {dateOf(teacher.updatedAt)}.</p></section><section><p className="record-kicker">Current assignment</p><p className="summary-note">Adviser assignments will be connected in a later phase.</p></section></aside></div>;
}

function PersonnelSections({ teacher }: { teacher: Teacher }) {
  return <><InfoSection title="Personal details" items={[["Gender", valueOf(teacher.gender)], ["Birthday", dateOf(teacher.birthday)], ["Civil status", valueOf(teacher.civilStatus)]]} /><InfoSection title="Education and specialization" items={[["Degree finished", valueOf(teacher.degreeFinished)], ["PRC specialization", valueOf(teacher.prcSpecialization)], ["Minor specialization", valueOf(teacher.minorSpecialization)], ["Postgraduate degree", valueOf(teacher.postGraduateDegree)]]} /><InfoSection title="Appointment details" items={[["Original DepEd appointment", dateOf(teacher.originalAppointmentDate)], ["Start at current station", dateOf(teacher.stationStartDate)]]} /><InfoSection title="Contact and accounts" items={[["Cellphone number", valueOf(teacher.cellphoneNumber)], ["Personal email", valueOf(teacher.personalEmail)], ["DepEd email", valueOf(teacher.depEdEmail)], ["Office 365 account", valueOf(teacher.office365Account)], ["R4A-3 account", valueOf(teacher.r4a3Account)]]} /><InfoSection title="Address" items={[["Province", valueOf(teacher.province)], ["Town", valueOf(teacher.town)], ["Barangay", valueOf(teacher.barangay)], ["Street", valueOf(teacher.street)]]} /></>;
}

function InfoSection({ title, items }: { title: string; items: [string, string][] }) { return <section className="info-section"><h2>{title}</h2><dl>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>; }
function Placeholder({ title, text }: { title: string; text: string }) { return <section className="tab-content"><div className="tab-content-heading"><div><h2>{title}</h2><p>{text}</p></div></div></section>; }
