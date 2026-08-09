import { StudentProfile } from "@/features/records/student-profile";
export default async function StudentPage({ params }: PageProps<"/students/[id]">) { const { id } = await params; return <StudentProfile id={id} />; }
