import Link from "next/link";
import { talaApi } from "@/lib/api/tala-api";
import { Icon } from "@/components/ui/icon";

export default async function DashboardPage() {
  const data = await talaApi.getDashboard();
  return <>
    <header className="page-heading dashboard-heading"><div><p className="page-eyebrow">School year 2026–2027</p><h1>Good afternoon, Lea.</h1><p>Review what needs attention and what changed recently.</p></div></header>
    <section className="count-grid" aria-label="School record counts">
      {[{ label: "Students", value: data.students }, { label: "Teachers", value: data.teachers }, { label: "Sections", value: data.sections }, { label: "Files", value: data.files }].map((item) => <div className="count-item" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
    </section>
    <div className="dashboard-grid">
      <section className="panel attention-panel"><div className="panel-heading"><div><h2>Needs attention</h2><p>Records that could use a quick review.</p></div></div>
        <div className="attention-list">
          <Link href="/students?filter=missing-contact"><span className="attention-icon warning"><Icon name="alert" /></span><span><strong>7 students missing contact numbers</strong><small>Contact information is incomplete</small></span><Icon name="arrow" /></Link>
          <Link href="/students?filter=missing-birthday"><span className="attention-icon warning"><Icon name="alert" /></span><span><strong>4 student records missing birthdays</strong><small>Personal information is incomplete</small></span><Icon name="arrow" /></Link>
          <Link href="/teachers?filter=incomplete"><span className="attention-icon neutral"><Icon name="user" /></span><span><strong>2 teacher records incomplete</strong><small>Review personnel records</small></span><Icon name="arrow" /></Link>
          <Link href="/students/import"><span className="attention-icon neutral"><Icon name="upload" /></span><span><strong>1 import contains warnings</strong><small>Grade 6 masterlist</small></span><Icon name="arrow" /></Link>
        </div>
      </section>
      <section className="panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Changes made to school records.</p></div><Link href="/students" className="text-link">View students</Link></div>
        <ol className="activity-list">{data.activity.map((item) => <li key={item.title}><span className="activity-dot" /><div><strong>{item.title}</strong><small>{item.when} · {item.kind}</small></div></li>)}</ol>
      </section>
    </div>
    <section className="enrollment-check" aria-labelledby="enrollment-check-title"><div><h2 id="enrollment-check-title">Enrollment check</h2><p>Compare grade totals to spot missing imports or unexpected placements.</p></div><dl>{[["Kinder", 48], ["Grade 1", 62], ["Grade 2", 59], ["Grade 3", 54], ["Grade 4", 57], ["Grade 5", 64], ["Grade 6", 68]].map(([grade, count]) => <div key={String(grade)}><dt>{grade}</dt><dd><span style={{ "--enrollment-width": `${Math.round((Number(count) / 68) * 100)}%` } as React.CSSProperties} /><b>{count}</b></dd></div>)}</dl></section>
  </>;
}
