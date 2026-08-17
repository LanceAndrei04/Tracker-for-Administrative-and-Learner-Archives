import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrentAcademicSetup } from "@/features/dashboard/current-academic-setup";
import { talaApi } from "@/lib/api/tala-api";
import { Icon } from "@/components/ui/icon";

export default async function DashboardPage() {
  const data = await talaApi.getDashboard();
  return <>
    <header className="page-heading dashboard-heading"><div><h1>Dashboard</h1><p>Review the school records workspace and current academic setup.</p></div></header>
    <section className="count-grid" aria-label="School record counts">
      {[{ label: "Students", value: data.students }, { label: "Teachers", value: data.teachers }, { label: "Sections", value: data.sections }, { label: "Files", value: data.files }].map((item) => <div className="count-item" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
    </section>
    <div className="dashboard-grid">
      <Card className="panel attention-panel"><CardHeader className="panel-heading"><div><CardTitle>Needs attention</CardTitle><CardDescription>Records that could use a quick review.</CardDescription></div></CardHeader>
        <CardContent className="attention-list">
          <Link href="/students?filter=missing-contact"><span className="attention-icon warning"><Icon name="alert" /></span><span><strong>7 students missing contact numbers</strong><small>Contact information is incomplete</small></span><Icon name="arrow" /></Link>
          <Link href="/students?filter=missing-birthday"><span className="attention-icon warning"><Icon name="alert" /></span><span><strong>4 student records missing birthdays</strong><small>Personal information is incomplete</small></span><Icon name="arrow" /></Link>
          <Link href="/teachers?filter=incomplete"><span className="attention-icon neutral"><Icon name="user" /></span><span><strong>2 teacher records incomplete</strong><small>Review personnel records</small></span><Icon name="arrow" /></Link>
          <Link href="/students/import"><span className="attention-icon neutral"><Icon name="upload" /></span><span><strong>1 import contains warnings</strong><small>Grade 6 masterlist</small></span><Icon name="arrow" /></Link>
        </CardContent>
      </Card>
      <Card className="panel"><CardHeader className="panel-heading"><div><CardTitle>Recent activity</CardTitle><CardDescription>Changes made to school records.</CardDescription></div><Link href="/students" className="text-link">View students</Link></CardHeader>
        <CardContent><ol className="activity-list">{data.activity.map((item) => <li key={item.title}><span className="activity-dot" /><div><strong>{item.title}</strong><small>{item.when} · {item.kind}</small></div></li>)}</ol></CardContent>
      </Card>
    </div>
    <CurrentAcademicSetup />
  </>;
}
