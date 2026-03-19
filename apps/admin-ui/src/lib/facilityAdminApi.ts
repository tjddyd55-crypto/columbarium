import { api, type AdminSeatRow, type PolicyRow, type SectionCreatedRow, type SectionRow, type SiteFacilityRow } from './api';

/**
 * ADMIN은 /admin/* , OPERATOR는 /admin/me/* (company 스코프).
 * `scoped === true` 이면 operatorScope 클라이언트 사용.
 */
export const facilityAdminApi = {
  getFacilities: (scoped: boolean) =>
    scoped ? api.operatorScope.myFacilities() : api.adminSite.getFacilities(),

  createFacility: (scoped: boolean, body: { name: string; address: string; companyId?: number }) => {
    if (scoped) return api.operatorScope.createFacility({ name: body.name, address: body.address });
    if (body.companyId == null) throw new Error('companyId가 필요합니다.');
    return api.adminSite.createFacility({
      name: body.name,
      address: body.address,
      companyId: body.companyId,
    });
  },

  getSections: (scoped: boolean, facilityId: string) =>
    scoped ? api.operatorScope.getSections(facilityId) : api.adminSite.getSections(facilityId),

  getSeats: (scoped: boolean, sectionId: string) =>
    scoped ? api.operatorScope.getSeats(sectionId) : api.adminSite.getSeats(sectionId),

  getPolicy: (scoped: boolean, facilityId: string) =>
    scoped ? api.operatorScope.getPolicy(facilityId) : api.adminSite.getPolicy(facilityId),

  createSection: (
    scoped: boolean,
    body: { facilityId: number; name: string; rows: number; cols: number },
  ): Promise<SectionCreatedRow> =>
    scoped ? api.operatorScope.createSection(body) : api.adminSite.createSection(body),

  updateSeatPrice: (scoped: boolean, seatId: string, price: number) =>
    scoped ? api.operatorScope.updateSeatPrice(seatId, price) : api.adminSite.updateSeatPrice(seatId, price),

  blockSeat: (scoped: boolean, seatId: string, isBlocked: boolean) =>
    scoped ? api.operatorScope.blockSeat(seatId, isBlocked) : api.adminSite.blockSeat(seatId, isBlocked),

  upsertPolicy: (
    scoped: boolean,
    body: { facilityId: number; maxWaiting?: number; maxYears?: number },
  ): Promise<PolicyRow> =>
    scoped ? api.operatorScope.upsertPolicy(body) : api.adminSite.upsertPolicy(body),
};

export type { AdminSeatRow, PolicyRow, SectionRow, SiteFacilityRow };
