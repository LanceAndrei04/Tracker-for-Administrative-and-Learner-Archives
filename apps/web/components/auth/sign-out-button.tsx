'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  return <Button variant="outline" onClick={signOut}>Sign out</Button>;
}
