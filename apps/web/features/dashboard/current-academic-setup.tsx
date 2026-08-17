"use client";

import { useEffect, useMemo, useState } from "react";
import { TablePropertiesIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getGrades, getSchoolYears, getSections } from "@/features/students/students-api";
import type { Grade, SchoolYear, Section } from "@/features/students/types";

type SetupState = { grades: Grade[]; sections: Section[]; schoolYear?: SchoolYear };

export function CurrentAcademicSetup() {
  const [open, setOpen] = useState(false);
  const [setup, setSetup] = useState<SetupState>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || setup || error) return;
    let cancelled = false;
    Promise.all([getSchoolYears(), getGrades(), getSections()])
      .then(([schoolYears, grades, sections]) => {
        if (cancelled) return;
        setSetup({ schoolYear: schoolYears.find((item) => item.isActive), grades: grades.toSorted((a, b) => a.level - b.level), sections });
      })
      .catch(() => !cancelled && setError("We could not load the current school setup."));
    return () => { cancelled = true; };
  }, [error, open, setup]);

  const sectionsByGrade = useMemo(() => {
    const byGrade = new Map<string, Section[]>();
    if (!setup?.schoolYear) return byGrade;
    for (const section of setup.sections) {
      if (section.schoolYearId !== setup.schoolYear.id) continue;
      const current = byGrade.get(section.gradeId) ?? [];
      current.push(section);
      byGrade.set(section.gradeId, current);
    }
    return byGrade;
  }, [setup]);

  return <section className="academic-setup-action" aria-label="Current academic setup">
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" />}><TablePropertiesIcon data-icon="inline-start" />View academic setup</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader><SheetTitle>Current academic setup</SheetTitle><SheetDescription>Read-only reference for the active school year, grades, and sections.</SheetDescription></SheetHeader>
        <div className="academic-setup-sheet-body">{error ? <Alert variant="destructive"><AlertTitle>Academic setup unavailable</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : !setup ? <AcademicSetupSkeleton /> : !setup.schoolYear ? <Alert><AlertTitle>No active school year</AlertTitle><AlertDescription>Ask a Super Admin to activate a school year before creating or importing student records.</AlertDescription></Alert> : <AcademicSetupTable setup={setup} sectionsByGrade={sectionsByGrade} />}</div>
      </SheetContent>
    </Sheet>
  </section>;
}

function AcademicSetupTable({ setup, sectionsByGrade }: { setup: SetupState; sectionsByGrade: Map<string, Section[]> }) {
  return <><div className="academic-setup-year"><span>Active school year</span><strong>{setup.schoolYear?.label}</strong></div><Table><TableHeader><TableRow><TableHead>Grade</TableHead><TableHead>Sections</TableHead></TableRow></TableHeader><TableBody>{setup.grades.map((grade) => { const sections = sectionsByGrade.get(grade.id) ?? []; return <TableRow key={grade.id}><TableCell className="font-medium">{grade.name}</TableCell><TableCell className="text-muted-foreground">{sections.length ? sections.map((section) => section.name).join(" · ") : "No sections recorded"}</TableCell></TableRow>; })}</TableBody></Table></>;
}

function AcademicSetupSkeleton() {
  return <div className="academic-setup-skeleton" aria-label="Loading current academic setup"><Skeleton className="h-10 w-40" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-3/4" /></div>;
}
