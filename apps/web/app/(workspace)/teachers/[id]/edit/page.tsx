import { EditTeacherForm } from "@/features/teachers/teacher-form";

export default async function EditTeacherPage({ params }: PageProps<"/teachers/[id]/edit">) {
  const { id } = await params;
  return <EditTeacherForm teacherId={id} />;
}
