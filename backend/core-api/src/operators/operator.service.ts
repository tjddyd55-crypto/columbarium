import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { BusinessError, ErrorCode } from '../common/errors/business.error';
import { UnitStatus } from '@prisma/client';

@Injectable()
export class OperatorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async getOperatorIdForUser(userId: string): Promise<bigint | null> {
    const uid = BigInt(userId);
    const oa = await this.prisma.operatorAdmin.findFirst({
      where: { userId: uid },
      select: { operatorId: true },
    });
    return oa?.operatorId ?? null;
  }

  async getFacilities(userId: string, role?: string) {
    const isSuper = role === 'SUPER_ADMIN';
    const operatorId = isSuper ? null : await this.getOperatorIdForUser(userId);
    if (!operatorId && !isSuper) return [];
    const list = await this.prisma.facility.findMany({
      where: operatorId ? { operatorId } : {},
      orderBy: { name: 'asc' },
      include: { operator: { select: { name: true } } },
    });
    return list.map((f) => ({
      id: String(f.id),
      name: f.name,
      description: f.description,
      phone: f.phone,
      addressRoad: f.addressRoad,
      addressJibun: f.addressJibun,
      addressDetail: f.addressDetail,
      postalCode: f.postalCode,
      lat: f.lat,
      lng: f.lng,
      operatorId: String(f.operatorId),
      operatorName: f.operator.name,
      status: f.status,
    }));
  }

  async createFacility(userId: string, body: any) {
    const operatorId = await this.getOperatorIdForUser(userId);
    if (!operatorId) throw new BusinessError(ErrorCode.UNAUTHORIZED, '소속 사업자가 없습니다.', 403);
    const f = await this.prisma.facility.create({
      data: {
        operatorId,
        name: body.name,
        description: body.description,
        phone: body.phone,
        addressRoad: body.addressRoad ?? '',
        addressJibun: body.addressJibun,
        addressDetail: body.addressDetail,
        postalCode: body.postalCode,
        lat: body.lat,
        lng: body.lng,
      },
      include: { operator: { select: { name: true } } },
    });
    return { id: String(f.id), name: f.name, operatorId: String(f.operatorId), operatorName: f.operator.name, status: f.status };
  }

  async updateFacility(userId: string, facilityId: string, body: any) {
    const operatorId = await this.getOperatorIdForUser(userId);
    if (!operatorId) throw new BusinessError(ErrorCode.UNAUTHORIZED, '소속 사업자가 없습니다.', 403);
    const facility = await this.prisma.facility.findFirst({ where: { id: BigInt(facilityId), operatorId } });
    if (!facility) throw new BusinessError(ErrorCode.NOT_FOUND, '시설을 찾을 수 없습니다.', 404);
    const updated = await this.prisma.facility.update({
      where: { id: BigInt(facilityId) },
      data: {
        ...(body.name != null && { name: body.name }),
        ...(body.description != null && { description: body.description }),
        ...(body.phone != null && { phone: body.phone }),
        ...(body.addressRoad != null && { addressRoad: body.addressRoad }),
        ...(body.addressJibun != null && { addressJibun: body.addressJibun }),
        ...(body.addressDetail != null && { addressDetail: body.addressDetail }),
        ...(body.postalCode != null && { postalCode: body.postalCode }),
        ...(body.lat != null && { lat: body.lat }),
        ...(body.lng != null && { lng: body.lng }),
      },
    });
    return { id: String(updated.id), name: updated.name, status: updated.status };
  }

  async getQueue(userId: string, role?: string, facilityId?: string) {
    const isSuper = role === 'SUPER_ADMIN';
    const operatorId = isSuper ? null : await this.getOperatorIdForUser(userId);
    if (!operatorId && !isSuper) return [];
    const where: any = operatorId ? { operatorId } : {};
    if (facilityId) where.facilityId = BigInt(facilityId);
    const list = await this.prisma.queueEntry.findMany({
      where,
      orderBy: [{ facilityId: 'asc' }, { unitId: 'asc' }, { queuePosition: 'asc' }],
      include: { unit: true, facility: true },
    });
    return list.map((e) => ({
      id: String(e.id),
      unitId: String(e.unitId),
      unitCode: e.unit.unitCode,
      facilityName: e.facility.name,
      userId: String(e.userId),
      queuePosition: e.queuePosition,
      status: e.status,
      activatedAt: e.activatedAt?.toISOString() ?? null,
      expiresAt: e.expiresAt?.toISOString() ?? null,
      createdAt: e.createdAt.toISOString(),
    }));
  }

  async getContracts(userId: string, role?: string, filters?: { facilityId?: string; status?: string }) {
    const isSuper = role === 'SUPER_ADMIN';
    const operatorId = isSuper ? null : await this.getOperatorIdForUser(userId);
    if (!operatorId && !isSuper) return [];
    const where: any = operatorId ? { operatorId } : {};
    if (filters?.facilityId) where.facilityId = BigInt(filters.facilityId);
    if (filters?.status) where.status = filters.status;
    const list = await this.prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { unit: { include: { facility: true } } },
    });
    return list.map((c) => ({
      id: String(c.id),
      contractNo: c.contractNo,
      unitId: String(c.unitId),
      unitCode: c.unit.unitCode,
      facilityName: c.unit.facility.name,
      buyerUserId: String(c.buyerUserId),
      status: c.status,
      contractType: c.contractType,
      finalPrice: c.finalPrice,
      startDate: c.startDate.toISOString().slice(0, 10),
      endDate: c.endDate.toISOString().slice(0, 10),
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async getResaleList(userId: string, role?: string, status?: string) {
    const isSuper = role === 'SUPER_ADMIN';
    const operatorId = isSuper ? null : await this.getOperatorIdForUser(userId);
    if (!operatorId && !isSuper) return [];
    const where: any = operatorId ? { operatorId } : {};
    if (status) where.status = status;
    const list = await this.prisma.resaleListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { unit: true, facility: true },
    });
    return list.map((r) => ({
      id: String(r.id),
      unitId: String(r.unitId),
      unitCode: r.unit.unitCode,
      facilityName: r.facility.name,
      sellerUserId: String(r.sellerUserId),
      askingPrice: r.askingPrice,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async bulkCreateUnits(userId: string, facilityId: string, units: any[]) {
    const operatorId = await this.getOperatorIdForUser(userId);
    if (!operatorId) throw new BusinessError(ErrorCode.UNAUTHORIZED, '소속 사업자가 없습니다.', 403);
    const facility = await this.prisma.facility.findFirst({ where: { id: BigInt(facilityId), operatorId } });
    if (!facility) throw new BusinessError(ErrorCode.NOT_FOUND, '시설을 찾을 수 없습니다.', 404);
    const created = await this.prisma.$transaction(
      units.map((u) =>
        this.prisma.memorialUnit.create({
          data: {
            operatorId,
            facilityId: BigInt(facilityId),
            rowCode: u.rowCode,
            colNo: u.colNo,
            unitCode: u.unitCode,
            x: u.x,
            y: u.y,
            width: u.width,
            height: u.height,
            basePrice: u.basePrice,
            preSalePrice: u.preSalePrice,
            contractYears: u.contractYears ?? 30,
          },
        })
      )
    );
    return { count: created.length };
  }

  async updateUnit(userId: string, unitId: string, body: { status?: string; basePrice?: number; preSalePrice?: number }) {
    const operatorId = await this.getOperatorIdForUser(userId);
    if (!operatorId) throw new BusinessError(ErrorCode.UNAUTHORIZED, '소속 사업자가 없습니다.', 403);
    const unit = await this.prisma.memorialUnit.findFirst({ where: { id: BigInt(unitId), operatorId } });
    if (!unit) throw new BusinessError(ErrorCode.NOT_FOUND, '칸을 찾을 수 없습니다.', 404);
    const data: any = {};
    if (body.status) data.status = body.status as UnitStatus;
    if (body.basePrice != null) data.basePrice = body.basePrice;
    if (body.preSalePrice != null) data.preSalePrice = body.preSalePrice;
    const updated = await this.prisma.memorialUnit.update({
      where: { id: BigInt(unitId) },
      data,
    });
    await this.auditLog.log({
      action: 'UNIT_UPDATED',
      entityType: 'UNIT',
      entityId: String(unitId),
      beforeData: { status: unit.status, basePrice: unit.basePrice, preSalePrice: unit.preSalePrice },
      afterData: { status: updated.status, basePrice: updated.basePrice, preSalePrice: updated.preSalePrice },
    });
    return { id: String(updated.id), status: updated.status, basePrice: updated.basePrice };
  }
}
