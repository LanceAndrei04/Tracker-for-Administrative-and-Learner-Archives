import { RecordList } from "@/features/records/record-list";
import { talaApi } from "@/lib/api/tala-api";
export default async function StudentsPage() { return <RecordList type="student" records={await talaApi.getStudents()} />; }
