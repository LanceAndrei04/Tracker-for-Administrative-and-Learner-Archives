'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, type CurrentUser } from '@/lib/api/authenticated-fetch';
import { supabase } from '@/lib/supabase/client';
import { AuthProvider } from './auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser>();
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    async function verifyAccess() {
      setError('');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      try {
        const approvedUser = await getCurrentUser();
        if (active) setUser(approvedUser);
      } catch (caughtError) {
        /* A failed API check does not always mean the Supabase session expired. */
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!active) return;

        if (!currentSession) {
          router.replace('/login');
          return;
        }

        const message = caughtError instanceof Error ? caughtError.message : '';
        setError(message === 'This account is not approved to access TALA.'
          ? message
          : 'TALA could not verify your account permissions. Check that the API is available, then try again.');
      }
    }
    void verifyAccess();
    return () => { active = false; };
  }, [attempt, router]);

  if (error) return <main className="auth-loading px-5"><div className="flex w-full max-w-md flex-col gap-4"><Alert variant="destructive"><AlertTitle>We couldn’t open TALA</AlertTitle><AlertDescription>{error}</AlertDescription></Alert><div className="flex gap-3"><Button onClick={() => setAttempt((value) => value + 1)}>Try again</Button><Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.replace('/login'); }}>Sign out</Button></div></div></main>;

  if (!user) return <main className="auth-loading" aria-live="polite">Verifying secure access…</main>;
  return <AuthProvider value={user}>{children}</AuthProvider>;
}
