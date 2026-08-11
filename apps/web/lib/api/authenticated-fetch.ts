import { supabase } from '@/lib/supabase/client';

export type CurrentUser = {
  id: string;
  email: string;
  role: 'TEACHER' | 'SUPER_ADMIN';
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) { super(message); this.name = 'ApiError'; }
}

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
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
    const message = Array.isArray(payload?.message) ? payload.message.join(' ') : payload?.message;
    throw new ApiError(message || 'TALA could not complete this request.', response.status);
  }
  return response;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await authenticatedFetch('/auth/me');
  const payload = await response.json() as { user: CurrentUser };
  return payload.user;
}
