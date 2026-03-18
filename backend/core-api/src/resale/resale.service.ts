import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContractStatus, ContractType, ResaleStatus } from '@prisma/client';
import { UnitService } from '../units/unit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationType } from '@prisma/client';
import { BusinessError, ErrorCode } from '../common/errors/business.error';

@Injectable()
export class ResaleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly unitService: UnitService,
    private readonly notifications: NotificationsService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * 재판매 신청: 계약 소유자만 가능. REQUESTED 상태로 생성.
   */
  async requestResale(userId: string, body: { contractId: string; price: number }) {
    const uid = BigInt(userId);
    const contractId = BigInt(body.contractId);

    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, buyerUserId: uid, status: ContractStatus.ACTIVE },
      include: { unit: true },
    });
    if (!contract) throw new BusinessError(ErrorCode.UNAUTHORIZED, '본인 소유의 활성 계약만 재판매 신청할 수 있습니다.', 403);

    const existing = await this.prisma.resaleListing.findFirst({
      where: { unitId: contract.unitId, sellerUserId: uid, status: { in: [ResaleStatus.REQUESTED, ResaleStatus.APPROVED, ResaleStatus.LISTED] } },
    });
    if (existing) throw new BusinessError(ErrorCode.RESALE_NOT_APPROVED, '이미 재판매 신청 중이거나 등록된 건이 있습니다.', 400);

    const listing = await this.prisma.resaleListing.create({
      data: {
        operatorId: contract.operatorId,
        facilityId: contract.facilityId,
        unitId: contract.unitId,
        sellerUserId: uid,
        askingPrice: body.price,
        status: ResaleStatus.REQUESTED,
      },
      include: { unit: true, facility: true },
    });
    return {
      id: String(listing.id),
      unitId: String(listing.unitId),
      unitCode: listing.unit.unitCode,
      askingPrice: listing.askingPrice,
      status: listing.status,
      createdAt: listing.createdAt.toISOString(),
    };
  }

  /**
   * 재판매 승인 (사업자): REQUESTED → APPROVED → LISTED
   */
  async approveResale(operatorId: string, resaleId: string) {
    const oid = BigInt(operatorId);
    const rid = BigInt(resaleId);

    const listing = await this.prisma.resaleListing.findFirst({
      where: { id: rid, operatorId: oid },
      include: { unit: { include: { facility: true } } },
    });
    if (!listing) throw new BusinessError(ErrorCode.NOT_FOUND, '재판매 신청을 찾을 수 없습니다.', 404);
    if (listing.status !== ResaleStatus.REQUESTED)
      throw new BusinessError(ErrorCode.INVALID_QUEUE_STATE, '승인 대기 상태만 승인할 수 있습니다.', 400);

    await this.prisma.resaleListing.update({
      where: { id: rid },
      data: { status: ResaleStatus.LISTED },
    });
    await this.notifications.createMultiChannelNotifications({
      userId: listing.sellerUserId,
      type: NotificationType.RESALE_APPROVED,
      relatedTable: 'resale_listings',
      relatedId: String(listing.id),
      metadata: {
        facilityName: listing.unit.facility.name,
        unitCode: listing.unit.unitCode,
        unitId: String(listing.unitId),
        facilityId: String(listing.facilityId),
        resaleId: String(listing.id),
      },
    });
    await this.auditLog.log({
      action: 'RESALE_APPROVED',
      entityType: 'RESALE',
      entityId: String(listing.id),
      beforeData: { status: 'REQUESTED' },
      afterData: { status: 'LISTED', resaleId: String(listing.id) },
    });
    return { id: String(listing.id), status: 'LISTED' };
  }

  /**
   * 재판매 반려 (사업자)
   */
  async rejectResale(operatorId: string, resaleId: string) {
    const oid = BigInt(operatorId);
    const rid = BigInt(resaleId);

    const listing = await this.prisma.resaleListing.findFirst({
      where: { id: rid, operatorId: oid },
      include: { unit: { include: { facility: true } } },
    });
    if (!listing) throw new BusinessError(ErrorCode.NOT_FOUND, '재판매 신청을 찾을 수 없습니다.', 404);
    if (listing.status !== ResaleStatus.REQUESTED)
      throw new BusinessError(ErrorCode.INVALID_QUEUE_STATE, '승인 대기 상태만 반려할 수 있습니다.', 400);

    await this.prisma.resaleListing.update({
      where: { id: rid },
      data: { status: ResaleStatus.REJECTED },
    });
    await this.notifications.createMultiChannelNotifications({
      userId: listing.sellerUserId,
      type: NotificationType.RESALE_REJECTED,
      relatedTable: 'resale_listings',
      relatedId: String(listing.id),
      metadata: {
        facilityName: listing.unit.facility.name,
        unitCode: listing.unit.unitCode,
        unitId: String(listing.unitId),
        facilityId: String(listing.facilityId),
        resaleId: String(listing.id),
        reason: '',
      },
    });
    await this.auditLog.log({
      action: 'RESALE_REJECTED',
      entityType: 'RESALE',
      entityId: String(listing.id),
      beforeData: { status: 'REQUESTED' },
      afterData: { status: 'REJECTED', resaleId: String(listing.id) },
    });
    return { id: String(listing.id), status: 'REJECTED' };
  }

  /**
   * 재판매 구매: LISTED 상태만 가능. 기존 계약 TRANSFERRED, 신규 계약 생성, resale SOLD.
   */
  async buyResale(userId: string, resaleId: string) {
    const uid = BigInt(userId);
    const rid = BigInt(resaleId);

    return this.prisma.$transaction(async (tx) => {
      const resale = await tx.resaleListing.findFirst({
        where: { id: rid },
        include: { unit: { include: { facility: true } } },
      });
      if (!resale) throw new BusinessError(ErrorCode.NOT_FOUND, '재판매 정보를 찾을 수 없습니다.', 404);
      if (resale.status !== ResaleStatus.LISTED)
        throw new BusinessError(ErrorCode.RESALE_NOT_LISTED, '판매 중인 재판매만 구매할 수 있습니다.', 400);
      if (resale.sellerUserId === uid)
        throw new BusinessError(ErrorCode.UNAUTHORIZED, '본인이 등록한 재판매는 구매할 수 없습니다.', 403);

      const sellerContract = await tx.contract.findFirst({
        where: {
          unitId: resale.unitId,
          buyerUserId: resale.sellerUserId,
          status: ContractStatus.ACTIVE,
        },
      });
      if (!sellerContract) throw new BusinessError(ErrorCode.NOT_FOUND, '매도자 계약을 찾을 수 없습니다.', 404);

      await tx.contract.update({
        where: { id: sellerContract.id },
        data: { status: ContractStatus.TRANSFERRED },
      });

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + resale.unit.contractYears);

      const newContract = await tx.contract.create({
        data: {
          contractNo: `CT-R-${Date.now()}-${resale.unitId}`,
          operatorId: resale.operatorId,
          facilityId: resale.facilityId,
          unitId: resale.unitId,
          buyerUserId: uid,
          sellerUserId: resale.sellerUserId,
          contractType: ContractType.RESALE,
          status: ContractStatus.ACTIVE,
          basePrice: resale.askingPrice,
          discountAmount: 0,
          finalPrice: resale.askingPrice,
          startDate,
          endDate,
        },
      });

      await tx.resaleListing.update({
        where: { id: rid },
        data: { status: ResaleStatus.SOLD },
      });

      await this.unitService.syncUnitStatus(resale.unitId, tx as any);
      await this.notifications.createMultiChannelNotifications(
        {
          userId: uid,
          type: NotificationType.CONTRACT_COMPLETED,
          relatedTable: 'contracts',
          relatedId: String(newContract.id),
          metadata: {
            facilityName: resale.unit.facility?.name ?? '',
            unitCode: resale.unit.unitCode,
            contractNo: newContract.contractNo,
            contractId: String(newContract.id),
          },
        },
        tx as any,
      );

      return {
        contractId: String(newContract.id),
        contractNo: newContract.contractNo,
        unitId: String(newContract.unitId),
        finalPrice: newContract.finalPrice,
        status: newContract.status,
      };
    });
  }

  async getMyResaleListings(userId: string) {
    const uid = BigInt(userId);
    const list = await this.prisma.resaleListing.findMany({
      where: { sellerUserId: uid },
      orderBy: { createdAt: 'desc' },
      include: { unit: { include: { facility: true } } },
    });
    return list.map((r) => ({
      id: String(r.id),
      unitId: String(r.unitId),
      unitCode: r.unit.unitCode,
      facilityName: r.unit.facility.name,
      askingPrice: r.askingPrice,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async getListings(filters?: { facilityId?: string; status?: ResaleStatus }) {
    const where: any = {};
    if (filters?.facilityId) where.facilityId = BigInt(filters.facilityId);
    if (filters?.status) where.status = filters.status;
    const list = await this.prisma.resaleListing.findMany({
      where: { ...where, status: ResaleStatus.LISTED },
      orderBy: { createdAt: 'desc' },
      include: { unit: { include: { facility: true } }, seller: { select: { id: true, name: true } } },
    });
    return list.map((r) => ({
      id: String(r.id),
      unitId: String(r.unitId),
      unitCode: r.unit.unitCode,
      facilityName: r.unit.facility.name,
      askingPrice: r.askingPrice,
      status: r.status,
    }));
  }
}
