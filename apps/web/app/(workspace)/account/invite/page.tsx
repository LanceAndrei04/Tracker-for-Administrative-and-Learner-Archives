'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { authenticatedFetch } from '@/lib/api/authenticated-fetch';

export default function ApproveTeacherPage() {
  const [approved, setApproved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function approve(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setApproved(false);
    const email = String(new FormData(event.currentTarget).get('email') ?? '');
    try {
      await authenticatedFetch('/auth/approve-supabase-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      event.currentTarget.reset();
      setApproved(true);
      toast.success('Teacher approved');
    } catch {
      toast.error('Could not approve this Supabase user');
    } finally {
      setSubmitting(false);
    }
  }

  return <><Link href="/account" className="back-link">← Account</Link><header className="page-heading"><div><h1>Approve teacher</h1><p>Approve a teacher you have already invited in Supabase.</p></div></header><form className="record-form invite-form" onSubmit={approve}><fieldset><legend>Supabase user</legend><p className="section-copy">Invite the teacher from Supabase Auth first. They set their own password from the email link, then approve their school email here for TALA access.</p><label>School email<input name="email" type="email" required placeholder="maria.cruz@school.edu.ph" /></label></fieldset><div className="form-actions"><Link href="/account" className="button button-secondary">Cancel</Link><Button type="submit" disabled={submitting}>{submitting ? 'Approving…' : 'Approve teacher'}</Button></div>{approved ? <p className="form-success" role="status">Teacher approved. They can now sign in to TALA.</p> : null}</form></>;
}
