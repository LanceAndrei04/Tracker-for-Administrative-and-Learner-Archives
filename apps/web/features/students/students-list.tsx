"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getGrades, getSchoolYears, getSections, getStudents } from "./students-api";
import type { Enrollment, Grade, SchoolYear, Section, StudentListResponse } from "./types";

const PAGE_SIZE = 20;
const formatDate = (date: string) => new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
const nameOf = (student: { firstName: string; middleName: string | null; lastName: string; suffix: string | null }) => [student.lastName + ",", student.firstName, student.middleName, student.suffix].filter(Boolean).join(" ");
function currentEnrollment(enrollments: Enrollment[], schoolYearId?: string) { return enrollments.find((item) => item.schoolYearId === schoolYearId) ?? enrollments[0]; }

export function StudentsList() {
  const router = useRouter();
  const [query, setQuery] = useState(""); const deferredQuery = useDeferredValue(query);
  const [gradeId, setGradeId] = useState(""); const [sectionId, setSectionId] = useState(""); const [page, setPage] = useState(1);
  const [grades, setGrades] = useState<Grade[]>([]); const [sections, setSections] = useState<Section[]>([]); const [activeYear, setActiveYear] = useState<SchoolYear | undefined>();
  const [result, setResult] = useState<StudentListResponse>(); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { let cancelled = false; Promise.all([getGrades(), getSections(), getSchoolYears()]).then(([nextGrades, nextSections, years]) => { if (cancelled) return; setGrades(nextGrades); setSections(nextSections); setActiveYear(years.find((year) => year.isActive)); }).catch(() => !cancelled && setError("We could not load the student lookup options.")); return () => { cancelled = true; }; }, []);
  useEffect(() => { let cancelled = false; getStudents({ page, limit: PAGE_SIZE, search: deferredQuery.trim() || undefined, schoolYearId: activeYear?.id, gradeId: gradeId || undefined, sectionId: sectionId || undefined }).then((next) => { if (!cancelled) { setResult(next); setError(""); } }).catch(() => !cancelled && setError("We could not load student records. Check your connection and try again.")).finally(() => !cancelled && setLoading(false)); return () => { cancelled = true; }; }, [page, deferredQuery, activeYear?.id, gradeId, sectionId]);
  const availableSections = useMemo(() => sections.filter((section) => (!gradeId || section.gradeId === gradeId) && (!activeYear || section.schoolYearId === activeYear.id)), [sections, gradeId, activeYear]);
  const hasFilters = Boolean(query || gradeId || sectionId); const reset = () => { setQuery(""); setGradeId(""); setSectionId(""); setPage(1); };
  return <><header className="page-heading records-heading"><div><h1>Students</h1><p>{activeYear ? `Learner records for ${activeYear.label}.` : "Manage learner records across school years."}</p></div><div className="page-actions"><Link href="/students/import" className="button button-secondary">Import Excel</Link><Link href="/students/new" className="button button-primary">Add student</Link></div></header>
    <section className="records-toolbar" aria-label="Student filters"><label className="search-input"><Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search name or LRN..." /></label><div className="filter-set"><label className="filter-select"><span className="sr-only">Grade</span><select value={gradeId} onChange={(event) => { setGradeId(event.target.value); setSectionId(""); setPage(1); }}><option value="">All grades</option>{grades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}</select></label><label className="filter-select"><span className="sr-only">Section</span><select value={sectionId} onChange={(event) => { setSectionId(event.target.value); setPage(1); }} disabled={!availableSections.length}><option value="">All sections</option>{availableSections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select></label>{hasFilters ? <Button variant="link" onClick={reset}>Clear filters</Button> : null}</div></section>
    {error ? <Alert variant="destructive"><AlertTitle>Student records unavailable</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
    <section className="table-shell" aria-label="Student records"><table className="record-table"><thead><tr><th>Name</th><th>LRN</th><th>Grade</th><th>Section</th><th>Status</th><th>Last updated</th></tr></thead><tbody>{loading ? Array.from({ length: 5 }, (_, index) => <tr key={index}><td colSpan={6}><Skeleton className="h-5 w-full" /></td></tr>) : result?.data.map((student) => { const enrollment = currentEnrollment(student.enrollments, activeYear?.id); const open = () => router.push(`/students/${student.id}`); return <tr key={student.id} className="record-row" tabIndex={0} onClick={open} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } }}><td className="primary-cell"><span className="filing-tab tab-grade-6" /><strong>{nameOf(student)}</strong></td><td className="tabular">{student.lrn ?? "Not recorded"}</td><td>{enrollment?.section.grade.name ?? "Not enrolled"}</td><td>{enrollment?.section.name ?? "—"}</td><td>{enrollment ? <Badge variant="secondary">{enrollment.status}</Badge> : "—"}</td><td className="muted-cell">{formatDate(student.updatedAt)}</td></tr>; })}</tbody></table>{!loading && result?.data.length === 0 ? <div className="empty-state"><h2>No students found</h2><p>Try another search or clear your filters.</p></div> : null}</section>
    {result ? <footer className="table-footer"><span>Showing {result.data.length} of {result.meta.total} students</span><div className="result-navigation"><Button variant="outline" size="sm" disabled={result.meta.page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span>Page {result.meta.page} of {Math.max(result.meta.totalPages, 1)}</span><Button variant="outline" size="sm" disabled={result.meta.page >= result.meta.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div></footer> : null}</>;
}
