/**
 * JWT/가드에서 사용: 역할 우선순위(낮을수록 상위)
 */
const ROLE_PRIORITY: Record<string, number> = {
  SUPER_ADMIN: 0,
  ADMIN: 0,
  OPERATOR_ADMIN: 1,
  OPERATOR: 1,
  SALES_MANAGER: 2,
  AGENT: 2,
  USER: 9,
};

export function sortRoleCodes(codes: string[]): string[] {
  return [...codes].sort((a, b) => (ROLE_PRIORITY[a] ?? 99) - (ROLE_PRIORITY[b] ?? 99));
}

/** 대표 역할 1개 (기존 user.role 단일 필드 호환) */
export function primaryRoleCode(codes: string[]): string {
  const sorted = sortRoleCodes(codes);
  return sorted[0] ?? 'USER';
}
