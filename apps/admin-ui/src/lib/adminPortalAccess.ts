import type { AuthUser } from './api';

/** 플랫폼 관리자(전 사업자) */
export const ADMIN_PORTAL_ROLE_CODES = ['ADMIN', 'SUPER_ADMIN'] as const;

/** 본인 사업자 스코프로 콘솔 사용 */
export const OPERATOR_PORTAL_ROLE_CODES = ['OPERATOR', 'OPERATOR_ADMIN'] as const;

export type AdminPortalRoleCode = (typeof ADMIN_PORTAL_ROLE_CODES)[number];

function hasAnyRole(user: AuthUser, codes: readonly string[]): boolean {
  const set = new Set<string>(user.roles ?? []);
  return codes.some((c) => set.has(c) || user.role === c);
}

export function isPlatformAdminRole(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  return hasAnyRole(user, ADMIN_PORTAL_ROLE_CODES);
}

export function hasAnyOperatorRole(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  return hasAnyRole(user, OPERATOR_PORTAL_ROLE_CODES);
}

/**
 * JWT/로그인 응답의 roles 배열 또는 대표 role(primary) 기준으로 관리자 콘솔 접근 가능 여부
 * - ADMIN/SUPER_ADMIN: 전체
 * - OPERATOR/OPERATOR_ADMIN: companyId 필수
 */
export function canAccessAdminPortal(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (hasAnyRole(user, ADMIN_PORTAL_ROLE_CODES)) return true;
  if (hasAnyRole(user, OPERATOR_PORTAL_ROLE_CODES)) {
    return Boolean(user.companyId);
  }
  return false;
}
