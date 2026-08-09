'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';

export default function SetPasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function setPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get('password') ?? '');
    const confirmation = String(formData.get('confirmation') ?? '');
    if (password.length < 12) return setMessage('Use at least 12 characters.');
    if (password !== confirmation) return setMessage('Passwords do not match.');
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setMessage('This invitation link is invalid or has expired. Ask your Super Admin for a new invitation.'); setSubmitting(false); return; }
    router.replace('/dashboard');
    router.refresh();
  }

  return <main className="login-page"><section className="login-panel"><Link className="brand" href="/login"><span className="brand-mark">T</span><span>TALA</span></Link><div className="login-intro"><h1>Set your password</h1><p>Create a password for your approved TALA account.</p></div><form onSubmit={setPassword}><label>New password<Input name="password" type="password" autoComplete="new-password" required disabled={submitting} /></label><label>Confirm password<Input name="confirmation" type="password" autoComplete="new-password" required disabled={submitting} /></label><Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Set password'}</Button></form>{message ? <p className="form-error" role="alert">{message}</p> : null}</section><aside className="login-aside"><div><span className="filing-tab tab-grade-6" /><h2>Welcome to TALA.</h2><p>Set a strong password to access your school records workspace.</p></div></aside></main>;
}
