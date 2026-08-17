"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGridIcon, ListIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getTeachers } from "./teachers-api";
import type { TeacherDirectoryRecord, TeacherListResponse, TeacherStationStatus } from "./types";

type View = "cards" | "table";
const PAGE_SIZE = 20;

function initials(teacher: TeacherDirectoryRecord) {
  return `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase();
}

function displayName(teacher: TeacherDirectoryRecord) {
  return [teacher.firstName, teacher.middleName, teacher.lastName, teacher.suffix].filter(Boolean).join(" ");
}

function displayStationStatus(status: TeacherStationStatus | null) {
  return status ? status.toLowerCase().split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ") : "—";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function TeacherDirectory() {
  const router = useRouter();
  const [view, setView] = useState<View>("cards");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<TeacherListResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getTeachers({ page, limit: PAGE_SIZE, search: deferredQuery.trim() || undefined })
      .then((next) => { if (!cancelled) { setResult(next); setError(""); } })
      .catch(() => !cancelled && setError("We could not load teacher records. Check your connection and try again."))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [page, deferredQuery]);

  function openTeacher(id: string) {
    router.push(`/teachers/${id}`);
  }

  return <>
    <header className="page-heading records-heading">
      <div><h1>Teachers</h1><p>Browse teaching personnel and their school-record profiles.</p></div>
      <Button nativeButton={false} render={<Link href="/teachers/new" />}><PlusIcon data-icon="inline-start" />Add teacher</Button>
    </header>
    <section className="teacher-directory-controls" aria-label="Teacher directory controls">
      <label className="search-input"><SearchIcon aria-hidden="true" /><span className="sr-only">Search teachers</span><Input value={query} onChange={(event) => { setLoading(true); setQuery(event.target.value); setPage(1); }} placeholder="Search name, position, or employee number..." /></label>
      <ToggleGroup value={[view]} onValueChange={(values) => { const next = values[0]; if (next === "cards" || next === "table") setView(next); }} variant="outline" spacing={0} aria-label="Teacher directory view">
        <ToggleGroupItem value="cards" aria-label="Card view"><LayoutGridIcon /></ToggleGroupItem><ToggleGroupItem value="table" aria-label="Table view"><ListIcon /></ToggleGroupItem>
      </ToggleGroup>
    </section>
    {error ? <Alert variant="destructive"><AlertTitle>Teacher records unavailable</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
    <p className="teacher-directory-count">{result ? `${result.meta.total} ${result.meta.total === 1 ? "teacher" : "teachers"}` : "Loading teachers…"}</p>
    {view === "cards" ? <TeacherCards teachers={result?.data ?? []} loading={loading} /> : <TeacherTable teachers={result?.data ?? []} loading={loading} onOpen={openTeacher} />}
    {result ? <footer className="table-footer"><span>Showing {result.data.length} of {result.meta.total} teachers</span><div className="result-navigation"><Button variant="outline" size="sm" disabled={result.meta.page <= 1} onClick={() => { setLoading(true); setPage((value) => value - 1); }}>Previous</Button><span>Page {result.meta.page} of {Math.max(result.meta.totalPages, 1)}</span><Button variant="outline" size="sm" disabled={result.meta.page >= result.meta.totalPages} onClick={() => { setLoading(true); setPage((value) => value + 1); }}>Next</Button></div></footer> : null}
  </>;
}

function TeacherCards({ teachers, loading }: { teachers: TeacherDirectoryRecord[]; loading: boolean }) {
  if (loading) return <section className="teacher-card-grid" aria-label="Loading teachers">{Array.from({ length: 6 }, (_, index) => <Card className="teacher-card" key={index}><CardContent className="teacher-card-photo-wrap"><Skeleton className="teacher-photo" /></CardContent><CardHeader><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardFooter><Skeleton className="h-4 w-20" /></CardFooter></Card>)}</section>;
  if (!teachers.length) return <TeacherEmptyState />;
  return <section className="teacher-card-grid" aria-label="Teacher cards">{teachers.map((teacher) => <Link href={`/teachers/${teacher.id}`} key={teacher.id} className="teacher-card-link"><Card className="teacher-card"><CardContent className="teacher-card-photo-wrap"><Avatar className="teacher-photo" size="lg"><AvatarFallback>{initials(teacher)}</AvatarFallback></Avatar></CardContent><CardHeader><CardTitle>{displayName(teacher)}</CardTitle><p className="text-sm text-muted-foreground">{teacher.designation}</p></CardHeader><CardFooter><span className="teacher-card-employee tabular">{teacher.employeeNumber}</span><Badge variant="outline">{displayStationStatus(teacher.stationStatus)}</Badge></CardFooter></Card></Link>)}</section>;
}

function TeacherTable({ teachers, loading, onOpen }: { teachers: TeacherDirectoryRecord[]; loading: boolean; onOpen: (id: string) => void }) {
  return <section className="table-shell" aria-label="Teacher records"><Table><TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Position</TableHead><TableHead>Employee no.</TableHead><TableHead>Station status</TableHead><TableHead>Last updated</TableHead></TableRow></TableHeader><TableBody>{loading ? Array.from({ length: 5 }, (_, index) => <TableRow key={index}><TableCell colSpan={5}><Skeleton className="h-5 w-full" /></TableCell></TableRow>) : teachers.map((teacher) => <TableRow key={teacher.id} className="teacher-table-row" tabIndex={0} role="link" onClick={() => onOpen(teacher.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(teacher.id); } }}><TableCell><div className="teacher-table-person"><Avatar className="teacher-table-photo" size="sm"><AvatarFallback>{initials(teacher)}</AvatarFallback></Avatar><strong>{displayName(teacher)}</strong></div></TableCell><TableCell>{teacher.designation}</TableCell><TableCell className="tabular">{teacher.employeeNumber}</TableCell><TableCell>{teacher.stationStatus ? <Badge variant="outline">{displayStationStatus(teacher.stationStatus)}</Badge> : "—"}</TableCell><TableCell className="text-muted-foreground">{formatDate(teacher.updatedAt)}</TableCell></TableRow>)}</TableBody></Table></section>;
}

function TeacherEmptyState() {
  return <Empty className="border border-dashed"><EmptyHeader><EmptyMedia variant="icon"><SearchIcon /></EmptyMedia><EmptyTitle>No teachers found</EmptyTitle><EmptyDescription>Try a different name, position, or employee number.</EmptyDescription></EmptyHeader></Empty>;
}
