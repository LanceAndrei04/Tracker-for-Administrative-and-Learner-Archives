"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { Student, Teacher } from "@/lib/mock-data/tala";

type RecordListProps = { type: "student"; records: Student[] } | { type: "teacher"; records: Teacher[] };

const gradeClasses: Record<string, string> = { "Grade 4": "tab-grade-4", "Grade 5": "tab-grade-5", "Grade 6": "tab-grade-6" };

export function RecordList(props: RecordListProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const isStudent = props.type === "student";
  const filtered = useMemo(() => props.records.filter((record) => record.name.toLowerCase().includes(deferredQuery.toLowerCase())), [props.records, deferredQuery]);
  const noun = isStudent ? "student" : "teacher";
  return <>
    <header className="page-heading records-heading"><div><h1>{isStudent ? "Students" : "Teachers"}</h1><p>{isStudent ? "Manage learner records across school years." : "Manage teaching and personnel records."}</p></div><div className="page-actions">
      {isStudent ? <Link href="/students/import" className="button button-secondary"><Icon name="upload" />Import Excel</Link> : null}
      <Link href={`/${isStudent ? "students" : "teachers"}/new`} className="button button-primary"><Icon name="plus" />Add {noun}</Link>
    </div></header>
    <section className="records-controls" aria-label={`${noun} filters`}><label className="search-input"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${noun}s...`} /></label>
      <div className="filter-set">{(isStudent ? ["School year", "Grade", "Section", "Status"] : ["Designation", "Employment status"]).map((label) => <button className="filter-button" key={label}>{label}<Icon name="chevron" /></button>)}</div>
    </section>
    <section className="table-shell" aria-label={`${noun} records`}><table className="record-table"><thead><tr>{isStudent ? <><th>Name</th><th>LRN</th><th>Grade</th><th>Section</th><th>Status</th></> : <><th>Name</th><th>Employee number</th><th>Designation</th><th>Employment status</th></>}<th>Last updated</th><th><span className="sr-only">Actions</span></th></tr></thead>
      <tbody>{filtered.map((record) => <tr key={record.id}><td className="primary-cell"><span className={`filing-tab ${isStudent ? gradeClasses[(record as Student).grade] : "tab-teacher"}`} /><Link href={`/${isStudent ? "students" : "teachers"}/${record.id}`}>{record.name}</Link></td>{isStudent ? <><td className="tabular">{(record as Student).lrn}</td><td>{(record as Student).grade}</td><td>{(record as Student).section}</td><td><span className="status status-active"><i />{(record as Student).status}</span></td></> : <><td className="tabular">{(record as Teacher).employeeNumber}</td><td>{(record as Teacher).designation}</td><td><span className="status status-neutral"><i />{(record as Teacher).status}</span></td></>}<td className="muted-cell">{record.updatedAt}</td><td><button className="icon-button" aria-label={`More actions for ${record.name}`}><Icon name="more" /></button></td></tr>)}</tbody></table>
      {filtered.length === 0 ? <div className="empty-state"><Icon name="search" /><h2>No {noun}s found</h2><p>Try another search or clear your filters.</p></div> : null}
    </section>
    <footer className="table-footer"><span>Showing {filtered.length} of {isStudent ? 412 : 28} {noun}s</span><button className="text-link">Clear filters</button></footer>
  </>;
}
