import { cookies } from 'next/headers';
import { User } from '@/types';

export const AUTH_COOKIE_NAME = 'khodamku_token';
export const USER_COOKIE_NAME = 'khodamku_user';
export const ROLE_COOKIE_NAME = 'khodamku_role';

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function getAuthUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userJson = cookieStore.get(USER_COOKIE_NAME)?.value;
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

export async function getAuthRole(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ROLE_COOKIE_NAME)?.value;
}
