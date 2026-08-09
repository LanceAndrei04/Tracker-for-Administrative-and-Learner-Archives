import { RecordList } from "@/features/records/record-list";
import { talaApi } from "@/lib/api/tala-api";
export default async function TeachersPage() { return <RecordList type="teacher" records={await talaApi.getTeachers()} />; }
