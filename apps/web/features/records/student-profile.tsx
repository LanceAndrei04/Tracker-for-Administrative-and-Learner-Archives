"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { Student } from "@/lib/mock-data/tala";

type ProfileTab = "overview" | "enrollment" | "files" | "activity";
const tabs: { id: ProfileTab; label: string }[] = [{ id: "overview", label: "Overview" }, { id: "enrollment", label: "Enrollment history" }, { id: "files", label: "Files" }, { id: "activity", label: "Activity" }];

export function StudentProfile({ student }: { student: Student }) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const initials = student.name.split(" ").map((part) => part[0]).join("").slice(0, 2);

  return <><Link href="/students" className="back-link">← Students</Link>
    <header className="student-record-header"><span className="profile-tab tab-grade-6" />{student.photoUrl ? <Image className="profile-photo" src={student.photoUrl} alt={student.name} width={132} height={132} /> : <div className="profile-photo profile-photo-placeholder" aria-label={student.name + " photo placeholder"}><span>{initials}</span><small>No photo</small></div>}<div className="student-record-title"><p className="record-kicker">Student record</p><h1>{student.name}</h1><div className="record-identifiers"><span>{student.grade}</span><span>{student.section}</span><span>LRN <b className="tabular">{student.lrn}</b></span></div></div><div className="record-header-actions"><span className="status status-active"><i />Active</span><Link href={"/students/" + student.id + "/edit"} className="button button-secondary">Edit student</Link></div></header>
    <nav className="profile-tabs" aria-label="Student record sections">{tabs.map((tab) => <button key={tab.id} className={activeTab === tab.id ? "profile-tab-current" : ""} onClick={() => setActiveTab(tab.id)}>{tab.label}{tab.id === "files" ? <span>2</span> : null}</button>)}</nav>
    {activeTab === "overview" ? <Overview student={student} /> : null}
    {activeTab === "enrollment" ? <EnrollmentHistory student={student} /> : null}
    {activeTab === "files" ? <Files /> : null}
    {activeTab === "activity" ? <Activity /> : null}
  </>;
}

function Overview({ student }: { student: Student }) { return <div className="record-detail-layout"><div className="record-detail-content">
  <InfoSection title="Personal information" items={[["LRN", student.lrn], ["Full name", student.name], ["Birthday", student.birthday], ["Birthplace", student.birthplace], ["Address", student.address]]} />
  <InfoSection title="Parent and guardian" items={[["Guardian", student.guardian], ["Contact number", student.contactNumber], ["Father", "Not recorded"], ["Mother", "Not recorded"]]} />
  <InfoSection title="Remarks" items={[["Notes", student.remarks ?? "No remarks recorded."]]} />
</div><aside className="record-summary"><section><p className="record-kicker">Current enrollment</p><dl><div><dt>School year</dt><dd>2026–2027</dd></div><div><dt>Grade</dt><dd>{student.grade}</dd></div><div><dt>Section</dt><dd>{student.section}</dd></div><div><dt>Status</dt><dd><span className="status status-active"><i />Active</span></dd></div></dl></section><section><p className="record-kicker">Record status</p><p className="summary-note">Last updated {student.updatedAt}. This view will warn you before a stale edit overwrites a newer record.</p></section></aside></div>; }

function EnrollmentHistory({ student }: { student: Student }) { return <section className="tab-content"><div className="tab-content-heading"><div><h2>Enrollment history</h2><p>Placement is recorded separately from the learner identity.</p></div><Link href={"/students/" + student.id + "/edit"} className="text-link">Update current enrollment</Link></div><div className="table-shell"><table className="record-table enrollment-table"><thead><tr><th>School year</th><th>Grade</th><th>Section</th><th>Status</th><th>Date enrolled</th></tr></thead><tbody><tr><td>2026–2027</td><td>{student.grade}</td><td>{student.section}</td><td><span className="status status-active"><i />Active</span></td><td>Aug 1, 2026</td></tr><tr><td>2025–2026</td><td>Grade 5</td><td>Mabini</td><td><span className="status status-neutral"><i />Completed</span></td><td>Aug 5, 2025</td></tr></tbody></table></div></section>; }

function Files() { return <section className="tab-content"><div className="tab-content-heading"><div><h2>Files</h2><p>Documents linked to this student record.</p></div><button className="button button-secondary"><Icon name="upload" />Upload file</button></div><div className="file-list"><FileRow name="Birth_Certificate.pdf" meta="Student document · 1.2 MB · Uploaded today" /><FileRow name="Report_Card_2025.pdf" meta="Student document · 824 KB · Uploaded Aug 2" /></div></section>; }
function FileRow({ name, meta }: { name: string; meta: string }) { return <div className="profile-file-row"><span className="file-icon"><Icon name="files" /></span><span><strong>{name}</strong><small>{meta}</small></span><button className="text-link">Open</button><button className="icon-button" aria-label={"More actions for " + name}><Icon name="more" /></button></div>; }

function Activity() { return <section className="tab-content"><div className="tab-content-heading"><div><h2>Activity</h2><p>Changes relevant to this student record.</p></div></div><ol className="record-activity"><li><span className="activity-dot" /><div><strong>Contact number updated</strong><small>Today, 9:42 AM · Lea Ramos</small></div></li><li><span className="activity-dot" /><div><strong>Birth_Certificate.pdf uploaded</strong><small>Yesterday · Lea Ramos</small></div></li><li><span className="activity-dot" /><div><strong>Enrollment created</strong><small>Aug 1, 2026 · System import</small></div></li></ol></section>; }

function InfoSection({ title, items }: { title: string; items: string[][] }) { return <section className="info-section"><h2>{title}</h2><dl>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd className={label === "LRN" ? "tabular" : ""}>{value}</dd></div>)}</dl></section>; }
