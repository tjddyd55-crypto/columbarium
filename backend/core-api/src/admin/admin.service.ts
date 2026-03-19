import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { BusinessError, ErrorCode } from '../common/errors/business.error';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async getOperators() {
    const list = await this.prisma.operator.findMany({
      orderBy: { name: 'asc' },
    });
    return list.map((o) => ({
      id: String(o.id),
      name: o.name,
      businessNo: o.businessNo,
      representativeName: o.representativeName,
      contactPhone: o.contactPhone,
      contactEmail: o.contactEmail,
      addressRoad: o.addressRoad,
      addressDetail: o.addressDetail,
      postalCode: o.postalCode,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
  }

  async createOperator(body: {
    name: string;
    businessNo: string;
    representativeName?: string;
    contactPhone?: string;
    contactEmail?: string;
    addressRoad?: string;
    addressDetail?: string;
    postalCode?: string;
  }) {
    const existing = await this.prisma.operator.findUnique({ where: { businessNo: body.businessNo } });
    if (existing) throw new BusinessError(ErrorCode.NOT_FOUND, '이미 등록된 사업자번호입니다.', 400);
    const o = await this.prisma.operator.create({
      data: {
        name: body.name,
        businessNo: body.businessNo,
        representativeName: body.representativeName,
        contactPhone: body.contactPhone,
        contactEmail: body.contactEmail,
        addressRoad: body.addressRoad,
        addressDetail: body.addressDetail,
        postalCode: body.postalCode,
      },
    });
    await this.auditLog.log({
      action: 'OPERATOR_CREATED',
      entityType: 'OPERATOR',
      entityId: String(o.id),
      afterData: { id: String(o.id), name: o.name, businessNo: o.businessNo },
    });
    return { id: String(o.id), name: o.name, businessNo: o.businessNo, status: o.status, createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString() };
  }

  async getUsers() {
    const list = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { roles: { include: { role: true } } },
    });
    return list.map((u) => ({
      id: String(u.id),
      loginId: u.loginId,
      name: u.name,
      phone: u.phone,
      email: u.email,
      status: u.status,
      role: u.roles[0]?.role?.code ?? 'USER',
      createdAt: u.createdAt.toISOString().slice(0, 10),
    }));
  }

  // ----- Company / Site(Site) / Section / Seat / Policy -----

  async getCompanies() {
    const list = await this.prisma.company.findMany({ orderBy: { name: 'asc' } });
    return list.map((c) => ({ id: String(c.id), name: c.name, createdAt: c.createdAt.toISOString() }));
  }

  async getFacilities() {
    const list = await this.prisma.site.findMany({
      orderBy: { createdAt: 'desc' },
      include: { company: true },
    });
    return list.map((s) => ({
      id: String(s.id),
      name: s.name,
      address: s.address,
      companyId: String(s.companyId),
      companyName: s.company.name,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  async getSectionsByFacility(facilityId: bigint) {
    const list = await this.prisma.section.findMany({
      where: { facilityId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { seats: true } } },
    });
    return list.map((s) => ({
      id: String(s.id),
      facilityId: String(s.facilityId),
      name: s.name,
      rows: s.rows,
      cols: s.cols,
      seatCount: s._count.seats,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  async getSeatsBySection(sectionId: bigint) {
    const list = await this.prisma.seat.findMany({
      where: { sectionId },
      orderBy: [{ row: 'asc' }, { col: 'asc' }],
    });
    return list.map((s) => ({
      id: String(s.id),
      sectionId: String(s.sectionId),
      row: s.row,
      col: s.col,
      price: s.price,
      isBlocked: s.isBlocked,
    }));
  }

  async getPolicyByFacility(facilityId: bigint) {
    const policy = await this.prisma.seatPolicy.findUnique({
      where: { facilityId },
    });
    if (!policy) return null;
    return {
      id: String(policy.id),
      facilityId: String(policy.facilityId),
      maxWaiting: policy.maxWaiting,
      maxYears: policy.maxYears,
    };
  }

  async createCompany(body: { name: string }) {
    const c = await this.prisma.company.create({
      data: { name: body.name.trim() },
    });
    await this.auditLog.log({
      action: 'COMPANY_CREATED',
      entityType: 'COMPANY',
      entityId: String(c.id),
      afterData: { id: String(c.id), name: c.name },
    });
    return { id: String(c.id), name: c.name, createdAt: c.createdAt.toISOString() };
  }

  async createFacility(body: { name: string; address: string; companyId: number }) {
    const companyId = BigInt(body.companyId);
    const site = await this.prisma.site.create({
      data: {
        name: body.name.trim(),
        address: body.address.trim(),
        companyId,
      },
    });
    await this.auditLog.log({
      action: 'FACILITY_CREATED',
      entityType: 'SITE',
      entityId: String(site.id),
      afterData: { id: String(site.id), name: site.name, companyId: String(companyId) },
    });
    return {
      id: String(site.id),
      name: site.name,
      address: site.address,
      companyId: String(site.companyId),
      createdAt: site.createdAt.toISOString(),
    };
  }

  async createSection(body: { facilityId: number; name: string; rows: number; cols: number }) {
    const facilityId = BigInt(body.facilityId);
    const { name, rows, cols } = body;
    const section = await this.prisma.section.create({
      data: { facilityId, name: name.trim(), rows, cols },
    });
    const seats: { sectionId: bigint; row: number; col: number; price: number }[] = [];
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        seats.push({ sectionId: section.id, row: r, col: c, price: 0 });
      }
    }
    await this.prisma.seat.createMany({ data: seats });
    const count = await this.prisma.seat.count({ where: { sectionId: section.id } });
    await this.auditLog.log({
      action: 'SECTION_CREATED',
      entityType: 'SECTION',
      entityId: String(section.id),
      afterData: { id: String(section.id), facilityId: String(facilityId), name, rows, cols, seatCount: count },
    });
    return {
      id: String(section.id),
      facilityId: String(facilityId),
      name: section.name,
      rows: section.rows,
      cols: section.cols,
      seatCount: count,
      createdAt: section.createdAt.toISOString(),
    };
  }

  async updateSeatPrice(seatId: bigint, price: number) {
    const seat = await this.prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat) throw new BusinessError(ErrorCode.NOT_FOUND, '좌석을 찾을 수 없습니다.', 404);
    const updated = await this.prisma.seat.update({
      where: { id: seatId },
      data: { price },
    });
    return { id: String(updated.id), price: updated.price };
  }

  async setSeatBlocked(seatId: bigint, isBlocked: boolean) {
    const seat = await this.prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat) throw new BusinessError(ErrorCode.NOT_FOUND, '좌석을 찾을 수 없습니다.', 404);
    const updated = await this.prisma.seat.update({
      where: { id: seatId },
      data: { isBlocked },
    });
    return { id: String(updated.id), isBlocked: updated.isBlocked };
  }

  async upsertPolicy(body: { facilityId: number; maxWaiting?: number; maxYears?: number }) {
    const facilityId = BigInt(body.facilityId);
    const policy = await this.prisma.seatPolicy.upsert({
      where: { facilityId },
      create: {
        facilityId,
        maxWaiting: body.maxWaiting ?? undefined,
        maxYears: body.maxYears ?? undefined,
      },
      update: {
        maxWaiting: body.maxWaiting ?? undefined,
        maxYears: body.maxYears ?? undefined,
      },
    });
    return {
      id: String(policy.id),
      facilityId: String(policy.facilityId),
      maxWaiting: policy.maxWaiting,
      maxYears: policy.maxYears,
    };
  }
}
