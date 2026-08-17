"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGridIcon, ListIcon, SearchIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Teacher } from "@/lib/mock-data/tala";
import { teachers } from "@/lib/mock-data/tala";

type View = "cards" | "table";

function initials(teacher: Teacher) {
  return `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase();
}

export function TeacherDirectory() {
  const router = useRouter();
  const [view, setView] = useState<View>("cards");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const filteredTeachers = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();
    if (!search) return teachers;
    return teachers.filter((teacher) => [teacher.name, teacher.designation, teacher.employeeNumber, teacher.email].some((value) => value.toLowerCase().includes(search)));
  }, [deferredQuery]);

  function openTeacher(id: string) {
    router.push(`/teachers/${id}`);
  }

  return <>
    <header className="page-heading records-heading">
      <div>
        <h1>Teachers</h1>
        <p>Browse teaching personnel and their school-record profiles.</p>
      </div>
    </header>
    <section className="teacher-directory-controls" aria-label="Teacher directory controls">
      <label className="search-input">
        <SearchIcon aria-hidden="true" />
        <span className="sr-only">Search teachers</span>
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, position, or employee number..." />
      </label>
      <ToggleGroup value={[view]} onValueChange={(values) => { const nextView = values[0]; if (nextView === "cards" || nextView === "table") setView(nextView); }} variant="outline" spacing={0} aria-label="Teacher directory view">
        <ToggleGroupItem value="cards" aria-label="Card view"><LayoutGridIcon /></ToggleGroupItem>
        <ToggleGroupItem value="table" aria-label="Table view"><ListIcon /></ToggleGroupItem>
      </ToggleGroup>
    </section>
    <p className="teacher-directory-count">{filteredTeachers.length} {filteredTeachers.length === 1 ? "teacher" : "teachers"}</p>
    {view === "cards" ? <TeacherCards teachers={filteredTeachers} /> : <TeacherTable teachers={filteredTeachers} onOpen={openTeacher} />}
  </>;
}

function TeacherCards({ teachers }: { teachers: Teacher[] }) {
  if (!teachers.length) return <TeacherEmptyState />;
  return <section className="teacher-card-grid" aria-label="Teacher cards">
    {teachers.map((teacher) => <Link href={`/teachers/${teacher.id}`} key={teacher.id} className="teacher-card-link">
      <Card className="teacher-card">
        <CardContent className="teacher-card-photo-wrap">
          <Avatar className="teacher-photo" size="lg">
            {teacher.photoUrl ? <AvatarImage src={teacher.photoUrl} alt={`Photo of ${teacher.name}`} /> : null}
            <AvatarFallback>{initials(teacher)}</AvatarFallback>
          </Avatar>
        </CardContent>
        <CardHeader>
          <CardTitle>{teacher.name}</CardTitle>
          <CardDescription>{teacher.designation}</CardDescription>
        </CardHeader>
        <CardFooter>
          <span className="teacher-card-employee">{teacher.employeeNumber}</span>
          <Badge variant={teacher.status === "Permanent" ? "secondary" : "outline"}>{teacher.status}</Badge>
        </CardFooter>
      </Card>
    </Link>)}
  </section>;
}

function TeacherTable({ teachers, onOpen }: { teachers: Teacher[]; onOpen: (id: string) => void }) {
  if (!teachers.length) return <TeacherEmptyState />;
  return <section className="table-shell" aria-label="Teacher records">
    <Table>
      <TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Position</TableHead><TableHead>Employee no.</TableHead><TableHead>Employment</TableHead><TableHead>Advisory assignment</TableHead><TableHead>Last updated</TableHead></TableRow></TableHeader>
      <TableBody>{teachers.map((teacher) => <TableRow key={teacher.id} className="teacher-table-row" tabIndex={0} role="link" onClick={() => onOpen(teacher.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(teacher.id); } }}>
        <TableCell><div className="teacher-table-person"><Avatar className="teacher-table-photo" size="sm"><AvatarFallback>{initials(teacher)}</AvatarFallback></Avatar><span><strong>{teacher.name}</strong><small>{teacher.email}</small></span></div></TableCell>
        <TableCell>{teacher.designation}</TableCell><TableCell className="tabular">{teacher.employeeNumber}</TableCell><TableCell><Badge variant={teacher.status === "Permanent" ? "secondary" : "outline"}>{teacher.status}</Badge></TableCell><TableCell>{teacher.advisoryAssignment ?? "—"}</TableCell><TableCell className="text-muted-foreground">{teacher.updatedAt}</TableCell>
      </TableRow>)}</TableBody>
    </Table>
  </section>;
}

function TeacherEmptyState() {
  return <section className="teacher-empty-state"><SearchIcon aria-hidden="true" /><h2>No teachers found</h2><p>Try a different name, position, or employee number.</p></section>;
}
