export const AUTH_TOKEN_KEY = 'admin_token';
export const AUTH_USER_KEY = 'admin_user';

export interface AuthUser {
  id: string;
  login_id: string;
  role: string;
  operatorId?: string;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function isSuperAdmin(role: string) {
  return role === 'SUPER_ADMIN';
}

export function isOperatorAdmin(role: string) {
  return role === 'OPERATOR_ADMIN';
}

export function canAccessOperators(role: string) {
  return role === 'SUPER_ADMIN';
}
