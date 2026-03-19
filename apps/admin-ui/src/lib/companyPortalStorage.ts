const PREFIX = 'columbarium:companyPortal:';

function keySelectedFacility(companyId: string): string {
  return `${PREFIX}selectedFacility:${companyId}`;
}

/** 사업자 상세에서 선택한 시설 — 탭 이동 후에도 유지 (sessionStorage) */
export function getSelectedFacilityId(companyId: string): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(keySelectedFacility(companyId));
}

export function setSelectedFacilityId(companyId: string, facilityId: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(keySelectedFacility(companyId), facilityId);
}

export function clearSelectedFacilityId(companyId: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(keySelectedFacility(companyId));
}
