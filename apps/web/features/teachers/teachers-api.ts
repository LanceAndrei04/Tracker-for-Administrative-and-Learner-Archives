import { authenticatedFetch } from "@/lib/api/authenticated-fetch";
import type { CreateTeacherInput, Teacher, TeacherListQuery, TeacherListResponse, UpdateTeacherInput } from "./types";

async function json<T>(path: string): Promise<T> {
  return (await authenticatedFetch(path)).json() as Promise<T>;
}

export function getTeachers(query: TeacherListQuery) {
  const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });
  if (query.search) params.set("search", query.search);
  return json<TeacherListResponse>(`/teachers?${params}`);
}

export function getTeacher(id: string) {
  return json<Teacher>(`/teachers/${id}`);
}

export function createTeacher(body: CreateTeacherInput) {
  return authenticatedFetch("/teachers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function updateTeacher(id: string, body: UpdateTeacherInput) {
  return authenticatedFetch(`/teachers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
