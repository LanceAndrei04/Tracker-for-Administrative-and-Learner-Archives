"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import type { Student, Teacher } from "@/lib/mock-data/tala";

type RecordListProps = { type: "student"; records: Student[] } | { type: "teacher"; records: Teacher[] };

const gradeClasses: Record<string, string> = { "Grade 4": "tab-grade-4", "Grade 5": "tab-grade-5", "Grade 6": "tab-grade-6" };

export function RecordList(props: RecordListProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("All grades");
  const [section, setSection] = useState("All sections");
  const [status, setStatus] = useState("All statuses");
  const deferredQuery = useDeferredValue(query);
  const isStudent = props.type === "student";
  const filtered = useMemo(() => props.records.filter((record) => {
    if (!record.name.toLowerCase().includes(deferredQuery.toLowerCase())) return false;
    if (!isStudent) return true;
    const student = record as Student;
    return (grade === "All grades" || student.grade === grade) && (section === "All sections" || student.section === section) && (status === "All statuses" || student.status === status);
  }), [props.records, deferredQuery, isStudent, grade, section, status]);
  const noun = isStudent ? "student" : "teacher";
  const hasFilters = Boolean(query) || grade !== "All grades" || section !== "All sections" || status !== "All statuses";
  const resetFilters = () => { setQuery(""); setGrade("All grades"); setSection("All sections"); setStatus("All statuses"); };
  const goToRecord = (id: string) => router.push(`/${isStudent ? "students" : "teachers"}/${id}`);

  return <>
    <header className="page-heading records-heading"><div><h1>{isStudent ? "Students" : "Teachers"}</h1><p>{isStudent ? "Manage learner records across school years." : "Manage teaching and personnel records."}</p></div><div className="page-actions">
      {isStudent ? <Link href="/students/import" className="button button-secondary"><Icon name="upload" />Import Excel</Link> : null}
      <Link href={`/${isStudent ? "students" : "teachers"}/new`} className="button button-primary"><Icon name="plus" />Add {noun}</Link>
    </div></header>
    <section className="records-toolbar" aria-label={`${noun} filters`}><label className="search-input"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${noun}s...`} /></label>
      <div className="filter-set">{isStudent ? <><label className="filter-select"><span className="sr-only">Grade</span><select value={grade} onChange={(event) => setGrade(event.target.value)}><option>All grades</option><option>Grade 4</option><option>Grade 5</option><option>Grade 6</option></select><Icon name="chevron" /></label><label className="filter-select"><span className="sr-only">Section</span><select value={section} onChange={(event) => setSection(event.target.value)}><option>All sections</option><option>Bonifacio</option><option>Luna</option><option>Mabini</option><option>Rizal</option></select><Icon name="chevron" /></label><label className="filter-select"><span className="sr-only">Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option><option>Active</option><option>Transferred</option></select><Icon name="chevron" /></label></> : <><button className="filter-button">Designation<Icon name="chevron" /></button><button className="filter-button">Employment status<Icon name="chevron" /></button></>}</div>
    </section>
    <section className="table-shell" aria-label={`${noun} records`}><table className="record-table"><thead><tr>{isStudent ? <><th>Name</th><th>LRN</th><th>Grade</th><th>Section</th><th>Status</th></> : <><th>Name</th><th>Employee number</th><th>Designation</th><th>Employment status</th></>}<th>Last updated</th><th><span className="sr-only">Actions</span></th></tr></thead>
      <tbody>{filtered.map((record) => <tr key={record.id} className="record-row" tabIndex={0} onClick={() => goToRecord(record.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") goToRecord(record.id); }}><td className="primary-cell"><span className={`filing-tab ${isStudent ? gradeClasses[(record as Student).grade] : "tab-teacher"}`} /><strong>{record.name}</strong></td>{isStudent ? <><td className="tabular">{(record as Student).lrn}</td><td>{(record as Student).grade}</td><td>{(record as Student).section}</td><td><span className="status status-active"><i />{(record as Student).status}</span></td></> : <><td className="tabular">{(record as Teacher).employeeNumber}</td><td>{(record as Teacher).designation}</td><td><span className="status status-neutral"><i />{(record as Teacher).status}</span></td></>}<td className="muted-cell">{record.updatedAt}</td><td><button className="icon-button" aria-label={`More actions for ${record.name}`} onClick={(event) => event.stopPropagation()}><Icon name="more" /></button></td></tr>)}</tbody></table>
      {filtered.length === 0 ? <div className="empty-state"><Icon name="search" /><h2>No {noun}s found</h2><p>Try another search or clear your filters.</p></div> : null}
    </section>
    <footer className="table-footer"><span>Showing {filtered.length} of {isStudent ? 412 : 28} {noun}s</span><div className="result-navigation"><button aria-label="Previous page" className="pagination-button">‹</button><button className="pagination-button pagination-current">1</button><button className="pagination-button">2</button><button className="pagination-button">3</button><span>…</span><button className="pagination-button">69</button><button aria-label="Next page" className="pagination-button">›</button>{hasFilters ? <button className="text-link clear-filter-button" onClick={resetFilters}>Clear filters</button> : null}</div></footer>
  </>;
}
