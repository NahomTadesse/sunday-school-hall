// import Cookies from 'js-cookie';

// export interface UserData {
//   access_token: string;
//   refresh_token?: string;
//   // add other user properties as needed
// }

// export const setAuthData = (data: UserData, rememberMe: boolean = false) => {
//   // Set cookies with appropriate expiry
//   const cookieOptions = rememberMe ? { expires: 30 } : {}; // 30 days if remember me
  
//   Cookies.set('userData', JSON.stringify(data), cookieOptions);
//   Cookies.set('access_token', data.access_token, cookieOptions);
//   if (data.refresh_token) {
//     Cookies.set('refresh_token', data.refresh_token, cookieOptions);
//   }
// };

// export const getAccessToken = (): string | null => {
//   return Cookies.get('access_token') || null;
// };

// export const getUserData = (): UserData | null => {
//   const userData = Cookies.get('userData');
//   return userData ? JSON.parse(userData) : null;
// };

// export const removeAuthData = () => {
//   Cookies.remove('userData');
//   Cookies.remove('access_token');
//   Cookies.remove('refresh_token');
//   localStorage.removeItem('email'); // Clear remembered email
// };

// export const isAuthenticated = (): boolean => {
//   return !!getAccessToken();
// };


// app/utils/auth.ts
import Cookies from 'js-cookie';

export interface UserData {
  access_token: string;
  refresh_token?: string;
}

export const setAuthData = (data: UserData, rememberMe: boolean = false) => {
  const cookieOptions = rememberMe ? { expires: 30 } : {};
  
  Cookies.set('userData', JSON.stringify(data), cookieOptions);
  Cookies.set('access_token', data.access_token, cookieOptions);
  
  // Store when the token was created
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
  localStorage.removeItem('email');
};

// Check if token exists AND is not expired
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  
  // Check if token is expired (assuming 1 hour expiry)
  const tokenTimestamp = Cookies.get('token_timestamp');
  if (tokenTimestamp) {
    const elapsed = Date.now() - parseInt(tokenTimestamp);
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    if (elapsed > oneHour) {
      // Token expired, clean up
      removeAuthData();
      return false;
    }
  }
  
  return true;
};