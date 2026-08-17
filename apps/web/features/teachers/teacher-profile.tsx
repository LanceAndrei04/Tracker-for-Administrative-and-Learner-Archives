"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { teachers, type Teacher } from "@/lib/mock-data/tala";

function initials(teacher: Teacher) {
  return `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase();
}

export function TeacherProfile({ id }: { id: string }) {
  const teacher = teachers.find((item) => item.id === id);
  if (!teacher) notFound();

  return <>
    <Link href="/teachers" className="back-link">← Teachers</Link>
    <header className="teacher-record-header">
      <span className="profile-tab tab-teacher" />
      <Avatar className="teacher-profile-photo" size="lg">
        {teacher.photoUrl ? <AvatarImage src={teacher.photoUrl} alt={`Photo of ${teacher.name}`} /> : null}
        <AvatarFallback>{initials(teacher)}</AvatarFallback>
      </Avatar>
      <div className="student-record-title">
        <p className="record-kicker">Teacher record</p>
        <h1>{teacher.name}</h1>
        <div className="record-identifiers"><span>{teacher.designation}</span><span className="tabular">{teacher.employeeNumber}</span></div>
      </div>
      <div className="record-header-actions"><Badge variant={teacher.status === "Permanent" ? "secondary" : "outline"}>{teacher.status}</Badge></div>
    </header>
    <Tabs defaultValue="overview">
      <TabsList variant="line" className="profile-tabs" aria-label="Teacher record sections"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="files">Files</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList>
      <TabsContent value="overview"><TeacherOverview teacher={teacher} /></TabsContent>
      <TabsContent value="files"><Placeholder title="Files" text="Private teacher files will be connected in a later phase." /></TabsContent>
      <TabsContent value="activity"><Placeholder title="Activity" text="Teacher record activity will be connected in a later phase." /></TabsContent>
    </Tabs>
  </>;
}

function TeacherOverview({ teacher }: { teacher: Teacher }) {
  return <div className="record-detail-layout"><div className="record-detail-content">
    <section className="info-section personal-information"><h2>Personal information</h2><dl className="name-breakdown teacher-name-breakdown"><div><dt>First Name</dt><dd>{teacher.firstName}</dd></div><div><dt>Middle Name</dt><dd>{teacher.middleName ?? "—"}</dd></div><div><dt>Last Name</dt><dd>{teacher.lastName}</dd></div></dl></section>
    <InfoSection title="Professional information" items={[["Position", teacher.designation], ["Employee number", teacher.employeeNumber], ["Employment status", teacher.status]]} />
    <InfoSection title="Contact information" items={[["School email", teacher.email], ["Contact number", teacher.contactNumber]]} />
  </div><aside className="record-summary"><section><p className="record-kicker">Current assignment</p>{teacher.advisoryAssignment ? <dl><div><dt>Advisory class</dt><dd>{teacher.advisoryAssignment}</dd></div></dl> : <p className="summary-note">No advisory assignment is recorded.</p>}</section><section><p className="record-kicker">Record status</p><p className="summary-note">Last updated {teacher.updatedAt}.</p></section></aside></div>;
}

function InfoSection({ title, items }: { title: string; items: [string, string][] }) {
  return <section className="info-section"><h2>{title}</h2><dl>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
}

function Placeholder({ title, text }: { title: string; text: string }) {
  return <section className="tab-content"><div className="tab-content-heading"><div><h2>{title}</h2><p>{text}</p></div></div></section>;
}
