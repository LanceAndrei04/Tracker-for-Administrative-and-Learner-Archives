"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

export default function LoginPage() { const [signedIn, setSignedIn] = useState(false); return <main className="login-page"><section className="login-panel"><Link className="brand" href="/login"><span className="brand-mark">T</span><span>TALA</span></Link><div className="login-intro"><h1>School Records Workspace</h1><p>Sign in to access your school’s records.</p></div><form onSubmit={(event) => { event.preventDefault(); setSignedIn(true); }}><label>Email<Input type="email" autoComplete="email" placeholder="you@school.edu.ph" required /></label><label>Password<Input type="password" autoComplete="current-password" required /></label><Button type="submit" className="login-submit">Sign in</Button></form><div className="or-divider">or</div><Button variant="outline" className="google-button"><span className="google-g">G</span>Continue with Google</Button><p className="login-note"><Icon name="lock" />Only approved TALA users can sign in.</p>{signedIn ? <p className="form-success">Demo sign-in successful. Connect this form to Supabase Auth through the server-side adapter.</p> : null}</section><aside className="login-aside"><div><span className="filing-tab tab-grade-6" /><h2>Records, kept in order.</h2><p>Find students, maintain school-year history, and keep important documents close at hand.</p></div></aside></main>; }
