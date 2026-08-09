"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useCurrentUser } from "@/components/auth/auth-context";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/students", label: "Students", icon: "students" as const },
  { href: "/teachers", label: "Teachers", icon: "teachers" as const },
  { href: "/files", label: "Files", icon: "files" as const },
  { href: "/school-setup", label: "School setup", icon: "setup" as const },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const [isMenuOpen, setMenuOpen] = useState(false);

  return <div className="app-frame">
    <aside className={`sidebar ${isMenuOpen ? "sidebar-open" : ""}`} aria-label="Main navigation">
      <Link className="school-identity" href="/dashboard">
        <span className="brand"><span className="brand-mark">T</span><span>TALA</span></span>
        <span className="product-expansion">Tracker for Administrative and Learner Archives</span>
        <span className="school-name">San Isidro Elementary School</span>
        <span className="school-workspace">School Records Workspace</span>
      </Link>
      <nav className="sidebar-nav">
        {navigation.filter((item) => item.href !== "/school-setup" || user?.role === "SUPER_ADMIN").map((item) => <Link key={item.href} href={item.href} className={`nav-link ${pathname.startsWith(item.href) ? "nav-current" : ""}`} onClick={() => setMenuOpen(false)}>
          <Icon name={item.icon} /><span>{item.label}</span>
        </Link>)}
      </nav>
      <div className="sidebar-foot">
        <Link href="/account" className={`account-link ${pathname === "/account" ? "nav-current" : ""}`}><Avatar className="avatar"><AvatarFallback>{user?.email.slice(0, 2).toUpperCase() ?? "TA"}</AvatarFallback></Avatar><span><strong>{user?.email ?? "TALA account"}</strong><small>{user?.role === "SUPER_ADMIN" ? "Super Admin" : "Teacher account"}</small></span><Icon name="chevron" /></Link>
      </div>
    </aside>
    {isMenuOpen ? <button className="drawer-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} /> : null}
    <section className="app-main">
      <header className="topbar">
        <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Icon name="menu" /></button>
        <button className="school-year-switcher">SY 2026–2027 <Icon name="chevron" /></button>
        <label className="global-search"><Icon name="search" /><input placeholder="Search Tala..." aria-label="Search Tala" /><kbd>⌘ K</kbd></label>
        <button className="avatar top-avatar" aria-label="Open account menu">LR</button>
      </header>
      <main className="page-content">{children}</main>
    </section>
  </div>;
}
