import { getStoredUser } from './api';

/** OPERATOR 계열은 시설/구역/좌석 API를 `/admin/me/*` 스코프로 호출 */
export function isCompanyScopedOperator(): boolean {
  const r = getStoredUser()?.role ?? '';
  return r === 'OPERATOR' || r === 'OPERATOR_ADMIN';
}
