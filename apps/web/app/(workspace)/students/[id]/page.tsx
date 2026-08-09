import { StudentProfile } from "@/features/records/student-profile";
import { talaApi } from "@/lib/api/tala-api";
export default async function StudentPage({ params }: PageProps<"/students/[id]">) { const { id } = await params; return <StudentProfile student={await talaApi.getStudent(id)} />; }
