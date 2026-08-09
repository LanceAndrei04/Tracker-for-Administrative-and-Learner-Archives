import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { Student } from "@/lib/mock-data/tala";

export function StudentProfile({ student }: { student: Student }) {
  return <>
    <Link href="/students" className="back-link">← Students</Link>
    <header className="profile-header"><span className="profile-tab tab-grade-6" /><div className="profile-initials">AS</div><div><h1>{student.name}</h1><p>{student.grade} · {student.section}<span>LRN <b className="tabular">{student.lrn}</b></span></p></div><Link href={`/students/${student.id}/edit`} className="button button-secondary profile-edit">Edit student</Link></header>
    <nav className="profile-tabs" aria-label="Student record sections"><button className="profile-tab-current">Overview</button><button>Enrollment history</button><button>Files <span>2</span></button><button>Activity</button></nav>
    <div className="profile-grid"><div className="profile-content">
      <InfoSection title="Personal information" items={[["LRN", student.lrn], ["Full name", student.name], ["Birthday", student.birthday], ["Birthplace", student.birthplace], ["Address", student.address]]} />
      <InfoSection title="Parent and guardian" items={[["Guardian", student.guardian], ["Contact number", student.contactNumber], ["Father", "Not recorded"], ["Mother", "Not recorded"]]} />
      <InfoSection title="Remarks" items={[["Notes", student.remarks ?? "No remarks recorded."]]} />
    </div><aside className="profile-aside"><section className="panel compact-panel"><h2>Current enrollment</h2><dl><div><dt>School year</dt><dd>2026–2027</dd></div><div><dt>Grade</dt><dd>{student.grade}</dd></div><div><dt>Section</dt><dd>{student.section}</dd></div><div><dt>Status</dt><dd><span className="status status-active"><i />Active</span></dd></div></dl></section><section className="panel compact-panel"><div className="panel-heading"><h2>Recent activity</h2><Icon name="more" /></div><ol className="activity-list small"><li><span className="activity-dot" /><div><strong>Contact number updated</strong><small>Today, 9:42 AM</small></div></li><li><span className="activity-dot" /><div><strong>Enrollment created</strong><small>Aug 1, 2026</small></div></li></ol></section></aside></div>
  </>;
}

function InfoSection({ title, items }: { title: string; items: string[][] }) { return <section className="info-section"><h2>{title}</h2><dl>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd className={label === "LRN" ? "tabular" : ""}>{value}</dd></div>)}</dl></section>; }
