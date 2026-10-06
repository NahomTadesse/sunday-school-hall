import { removeAuthData } from '@/app/utils/auth';

export const API_BASE = 'https://hall-api.hohitebirhan.com/api/v1';

let redirecting = false;

/**
 * Called when the API answers 401/403.
 *
 * The old code did `window.location.href = '/login'` WITHOUT clearing the auth
 * cookies. AppShell still saw a "valid" cookie on /login and bounced the user
 * straight back to /stat, which fetched again, got 401 again ... producing the
 * flicker between the login page and an empty dashboard. Clearing the session
 * first breaks that loop.
 */
export function handleUnauthorized() {
  if (typeof window === 'undefined' || redirecting) return;
  redirecting = true;
  removeAuthData();
  window.location.replace('/login');
}
