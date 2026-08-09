import { authenticatedFetch } from "@/lib/api/authenticated-fetch";
import type { Grade, SchoolYear, Section, Student, StudentListQuery, StudentListResponse } from "./types";

async function json<T>(path: string): Promise<T> { return (await authenticatedFetch(path)).json() as Promise<T>; }
export function getStudents(query: StudentListQuery) { const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) }); if (query.search) params.set("search", query.search); if (query.schoolYearId) params.set("schoolYearId", query.schoolYearId); if (query.gradeId) params.set("gradeId", query.gradeId); if (query.sectionId) params.set("sectionId", query.sectionId); return json<StudentListResponse>(`/students?${params}`); }
export function getStudent(id: string) { return json<Student>(`/students/${id}`); }
export function getGrades() { return json<Grade[]>("/grades"); }
export function getSections() { return json<Section[]>("/sections"); }
export function getSchoolYears() { return json<SchoolYear[]>("/school-years"); }
export async function createSchoolYear(label: string) { return authenticatedFetch("/school-years", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label }) }); }
export async function activateSchoolYear(id: string) { return authenticatedFetch(`/school-years/${id}/activate`, { method: "PATCH" }); }
export async function createGrade(name: string, level: number) { return authenticatedFetch("/grades", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, level }) }); }
export async function createSection(name: string, gradeId: string, schoolYearId: string) { return authenticatedFetch("/sections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, gradeId, schoolYearId }) }); }
export async function updateStudent(id: string, body: Record<string, string | undefined>) { return authenticatedFetch(`/students/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
export async function changeEnrollmentSection(id: string, sectionId: string) { return authenticatedFetch(`/enrollments/${id}/section`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sectionId }) }); }
