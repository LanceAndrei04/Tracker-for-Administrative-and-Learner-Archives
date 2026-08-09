'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, type CurrentUser } from '@/lib/api/authenticated-fetch';
import { supabase } from '@/lib/supabase/client';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser>();

  useEffect(() => {
    let active = true;
    async function verifyAccess() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      try {
        const approvedUser = await getCurrentUser();
        if (active) setUser(approvedUser);
      } catch {
        await supabase.auth.signOut();
        router.replace('/login');
      }
    }
    void verifyAccess();
    return () => { active = false; };
  }, [router]);

  if (!user) return <main className="auth-loading" aria-live="polite">Verifying secure access…</main>;
  return <>{children}</>;
}
