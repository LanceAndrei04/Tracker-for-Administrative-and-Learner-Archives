import { supabase } from '@/lib/supabase/client';

export type CurrentUser = {
  id: string;
  email: string;
  role: 'TEACHER' | 'SUPER_ADMIN';
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function authenticatedFetch(path: string, init?: RequestInit) {
  if (!apiUrl) throw new Error('The TALA API URL is not configured.');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Your sign-in session has expired.');

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...init?.headers,
    },
  });

  if (response.status === 401) {
    await supabase.auth.signOut();
    throw new Error('Your sign-in session has expired.');
  }
  if (!response.ok) throw new Error('TALA could not verify your account access.');
  return response;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await authenticatedFetch('/auth/me');
  const payload = await response.json() as { user: CurrentUser };
  return payload.user;
}
