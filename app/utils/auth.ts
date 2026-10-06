// app/utils/auth.ts
import Cookies from 'js-cookie';

export interface UserData {
  access_token: string;
  refresh_token?: string;
  [key: string]: unknown;
}

export const setAuthData = (data: UserData, rememberMe: boolean = false) => {
  const cookieOptions = rememberMe ? { expires: 30 } : {};

  Cookies.set('userData', JSON.stringify(data), cookieOptions);
  Cookies.set('access_token', data.access_token, cookieOptions);
  if (data.refresh_token) {
    Cookies.set('refresh_token', data.refresh_token, cookieOptions);
  }
  Cookies.set('token_timestamp', Date.now().toString(), cookieOptions);
};

export const getAccessToken = (): string | null => {
  return Cookies.get('access_token') || null;
};

export const getUserData = (): UserData | null => {
  const userData = Cookies.get('userData');
  return userData ? JSON.parse(userData) : null;
};

export const removeAuthData = () => {
  Cookies.remove('userData');
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  Cookies.remove('token_timestamp');
  if (typeof window !== 'undefined') {
    localStorage.removeItem('email');
  }
};

// Check if token exists AND is not expired (1 hour expiry)
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;

  const tokenTimestamp = Cookies.get('token_timestamp');
  if (tokenTimestamp) {
    const elapsed = Date.now() - parseInt(tokenTimestamp, 10);
    const oneHour = 60 * 60 * 1000;

    if (elapsed > oneHour) {
      removeAuthData();
      return false;
    }
  }

  return true;
};
