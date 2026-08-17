import { TeacherProfile } from "@/features/teachers/teacher-profile";

export default async function TeacherPage({ params }: PageProps<"/teachers/[id]">) {
  const { id } = await params;
  return <TeacherProfile id={id} />;
}
