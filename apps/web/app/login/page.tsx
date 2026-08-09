"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user || !data.session) {
      setError("We could not sign you in. Check your email and password, then try again.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return <main className="login-page"><section className="login-panel"><Link className="brand" href="/login"><span className="brand-mark">T</span><span>TALA</span></Link><div className="login-intro"><h1>School Records Workspace</h1><p>Sign in to access your school’s records.</p></div><form onSubmit={signIn}><label>Email<Input id="email" name="email" type="email" autoComplete="email" placeholder="you@school.edu.ph" required disabled={isSubmitting} /></label><label>Password<Input id="password" name="password" type="password" autoComplete="current-password" required disabled={isSubmitting} /></label><Button type="submit" className="login-submit" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in"}</Button></form><p className="login-note"><Icon name="lock" />Only approved TALA users can sign in.</p>{error ? <p className="form-error" role="alert">{error}</p> : null}</section><aside className="login-aside"><div><span className="filing-tab tab-grade-6" /><h2>Records, kept in order.</h2><p>Find students, maintain school-year history, and keep important documents close at hand.</p></div></aside></main>;
}
