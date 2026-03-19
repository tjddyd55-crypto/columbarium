import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { BusinessError, ErrorCode } from '../common/errors/business.error';
import { ReservationStatus, UserStatus } from '@prisma/client';

/** JWT 사용자 (사업자 포털 접근 제어) */
export type CompanyPortalUser = {
  role: string;
  roles?: string[];
  companyId?: string;
};

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
    return list.map((c) => ({
      id: String(c.id),
      name: c.name,
      businessNo: c.businessNo,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  /**
   * URL 파라미터 `admin/companies/:companyId` — DB Company PK는 bigint, 숫자 문자열만 허용.
   * 잘못된 값은 500(BigInt SyntaxError) 대신 400으로 반환.
   */
  parseCompanyPathId(companyId: string): bigint {
    const t = companyId?.trim();
    if (!t || !/^\d+$/.test(t)) {
      throw new BadRequestException('유효하지 않은 사업자 ID입니다.');
    }
    return BigInt(t);
  }

  assertPortalCompanyAccess(user: CompanyPortalUser, companyId: bigint): void {
    const roleList = user.roles?.length ? user.roles : user.role ? [user.role] : [];
    if (roleList.includes('SUPER_ADMIN') || roleList.includes('ADMIN')) {
      return;
    }
    if (roleList.includes('OPERATOR') || roleList.includes('OPERATOR_ADMIN')) {
      if (!user.companyId || BigInt(user.companyId) !== companyId) {
        throw new ForbiddenException('해당 사업자에 접근할 권한이 없습니다.');
      }
      return;
    }
    throw new ForbiddenException('접근할 수 없습니다.');
  }

  async getCompanyPortalDetail(companyId: bigint, user: CompanyPortalUser) {
    this.assertPortalCompanyAccess(user, companyId);
    const c = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!c) {
      throw new BusinessError(ErrorCode.NOT_FOUND, '사업자를 찾을 수 없습니다.', 404);
    }
    return {
      id: String(c.id),
      name: c.name,
      businessNo: c.businessNo,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    };
  }

  async getCompanyPortalFacilities(companyId: bigint, user: CompanyPortalUser) {
    this.assertPortalCompanyAccess(user, companyId);
    return this.getFacilitiesForCompany(companyId);
  }

  /**
   * 사업자 포털: 시설(Site) 생성. 선택적으로 층별 구역(Section)+좌석을 한 번에 생성.
   */
  async createCompanyPortalFacility(
    companyId: bigint,
    user: CompanyPortalUser,
    body: { name: string; address: string; floors?: { name: string; rows: number; cols: number }[] },
  ) {
    this.assertPortalCompanyAccess(user, companyId);
    const name = body.name?.trim();
    const address = body.address?.trim();
    if (!name) {
      throw new BadRequestException('시설 이름을 입력하세요.');
    }
    if (!address) {
      throw new BadRequestException('주소를 입력하세요.');
    }
    const site = await this.prisma.site.create({
      data: { name, address, companyId },
    });
    await this.auditLog.log({
      action: 'FACILITY_CREATED',
      entityType: 'SITE',
      entityId: String(site.id),
      afterData: { id: String(site.id), name: site.name, companyId: String(companyId) },
    });
    const floors = body.floors ?? [];
    const facilityIdNum = Number(site.id);
    for (const f of floors) {
      const sectionName = f.name?.trim();
      if (!sectionName) continue;
      const rows = Math.min(200, Math.max(1, Math.floor(Number(f.rows)) || 1));
      const cols = Math.min(200, Math.max(1, Math.floor(Number(f.cols)) || 1));
      await this.createSection({ facilityId: facilityIdNum, name: sectionName, rows, cols });
    }
    const withCompany = await this.prisma.site.findUniqueOrThrow({
      where: { id: site.id },
      include: { company: true, _count: { select: { sections: true } } },
    });
    return {
      id: String(withCompany.id),
      name: withCompany.name,
      address: withCompany.address,
      companyId: String(withCompany.companyId),
      companyName: withCompany.company.name,
      createdAt: withCompany.createdAt.toISOString(),
      sectionCount: withCompany._count.sections,
    };
  }

  async listCompanyPortalReservations(companyId: bigint, user: CompanyPortalUser, statusQuery?: string) {
    this.assertPortalCompanyAccess(user, companyId);
    const allowed = new Set(Object.values(ReservationStatus));
    const status =
      statusQuery && allowed.has(statusQuery as ReservationStatus)
        ? (statusQuery as ReservationStatus)
        : undefined;
    const rows = await this.prisma.reservation.findMany({
      where: {
        ...(status ? { status } : {}),
        seat: { section: { site: { companyId } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 400,
      include: {
        seat: { include: { section: { include: { site: true } } } },
        user: { select: { id: true, name: true, loginId: true, phone: true } },
      },
    });
    return rows.map((r) => ({
      id: String(r.id),
      status: r.status,
      seatId: String(r.seatId),
      facilityId: String(r.seat.section.site.id),
      facilityName: r.seat.section.site.name,
      sectionName: r.seat.section.name,
      row: r.seat.row,
      col: r.seat.col,
      displayCode: `${r.seat.row}${String(r.seat.col).padStart(2, '0')}`,
      price: r.price,
      queueOrder: r.queueOrder,
      createdAt: r.createdAt.toISOString(),
      userName: r.user.name,
      userLoginId: r.user.loginId,
      userPhone: r.user.phone,
    }));
  }

  async listCompanyPortalResales(companyId: bigint, user: CompanyPortalUser) {
    this.assertPortalCompanyAccess(user, companyId);
    const rows = await this.prisma.seatResaleListing.findMany({
      where: {
        reservation: {
          seat: { section: { site: { companyId } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 300,
      include: {
        reservation: {
          include: { seat: { include: { section: { include: { site: true } } } } },
        },
      },
    });
    return rows.map((l) => ({
      id: String(l.id),
      reservationId: String(l.reservationId),
      status: l.status,
      pricingType: l.pricingType,
      price: l.price,
      createdAt: l.createdAt.toISOString(),
      facilityName: l.reservation.seat.section.site.name,
      displayCode: `${l.reservation.seat.row}${String(l.reservation.seat.col).padStart(2, '0')}`,
    }));
  }

  async listCompanyPortalAgents(companyId: bigint, user: CompanyPortalUser) {
    this.assertPortalCompanyAccess(user, companyId);
    const rows = await this.prisma.agent.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { loginId: true } }, company: { select: { name: true } } },
    });
    return rows.map((a) => ({
      id: String(a.id),
      userId: String(a.userId),
      loginId: a.user.loginId,
      companyId: String(a.companyId),
      companyName: a.company.name,
      code: a.code,
      name: a.name,
      commissionRate: a.commissionRate,
      createdAt: a.createdAt.toISOString(),
    }));
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

  /** OPERATOR: 자기 companyId 시설만 */
  async getFacilitiesForCompany(companyId: bigint) {
    const list = await this.prisma.site.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: { company: true, _count: { select: { sections: true } } },
    });
    return list.map((s) => ({
      id: String(s.id),
      name: s.name,
      address: s.address,
      companyId: String(s.companyId),
      companyName: s.company.name,
      createdAt: s.createdAt.toISOString(),
      sectionCount: s._count.sections,
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
      include: {
        reservations: {
          where: { status: { not: ReservationStatus.CANCELLED } },
          select: { id: true, status: true, expiresAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return list.map((s) => {
      const derived = this.deriveSeatUiFields({
        isBlocked: s.isBlocked,
        reservations: s.reservations,
      });
      const code = `${s.row}${String(s.col).padStart(2, '0')}`;
      return {
        id: String(s.id),
        sectionId: String(s.sectionId),
        row: s.row,
        col: s.col,
        price: s.price,
        isBlocked: s.isBlocked,
        displayCode: code,
        /** 관리 UI·연동용 코드 (displayCode 와 동일) */
        code,
        /** 그리드 색상 기준 통합 상태 — uiStatus 와 동일 */
        status: derived.uiStatus,
        ...derived,
      };
    });
  }

  /**
   * 관리자 그리드 색상용 상태 (예약·차단 반영)
   * - BLOCKED: 좌석 차단
   * - SOLD: CONFIRMED 예약
   * - WAITING: WAITING 또는 유효한 RESERVED(미만료)
   * - AVAILABLE: 그 외
   */
  private deriveSeatUiFields(input: {
    isBlocked: boolean;
    reservations: { id: bigint; status: ReservationStatus; expiresAt: Date | null }[];
  }): {
    uiStatus: 'AVAILABLE' | 'WAITING' | 'BLOCKED' | 'SOLD';
    reservationStatus: string | null;
    reservationId: string | null;
  } {
    if (input.isBlocked) {
      return { uiStatus: 'BLOCKED', reservationStatus: null, reservationId: null };
    }
    const now = Date.now();
    const active = input.reservations.filter((r) => {
      if (r.status === ReservationStatus.CANCELLED) return false;
      if (r.status === ReservationStatus.RESERVED && r.expiresAt != null && r.expiresAt.getTime() < now) {
        return false;
      }
      return true;
    });
    const confirmed = active.find((r) => r.status === ReservationStatus.CONFIRMED);
    if (confirmed) {
      return {
        uiStatus: 'SOLD',
        reservationStatus: confirmed.status,
        reservationId: String(confirmed.id),
      };
    }
    const waiting = active.find((r) => r.status === ReservationStatus.WAITING);
    if (waiting) {
      return {
        uiStatus: 'WAITING',
        reservationStatus: waiting.status,
        reservationId: String(waiting.id),
      };
    }
    const reserved = active.find((r) => r.status === ReservationStatus.RESERVED);
    if (reserved) {
      return {
        uiStatus: 'WAITING',
        reservationStatus: reserved.status,
        reservationId: String(reserved.id),
      };
    }
    return { uiStatus: 'AVAILABLE', reservationStatus: null, reservationId: null };
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

  private generateAgentCodeCandidate(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 8; i += 1) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return s;
  }

  /** ADMIN: 에이전트 등록 (code 미입력 시 자동 생성) */
  async createAgent(body: {
    userId: string;
    companyId: string;
    name: string;
    commissionRate: number;
    code?: string;
  }) {
    if (body.commissionRate < 0 || body.commissionRate > 100) {
      throw new BusinessError(ErrorCode.COMMISSION_RATE_INVALID, 'commissionRate는 0~100 사이여야 합니다.', 400);
    }
    const userId = BigInt(body.userId);
    const companyId = BigInt(body.companyId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BusinessError(ErrorCode.NOT_FOUND, '사용자를 찾을 수 없습니다.', 404);
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new BusinessError(ErrorCode.NOT_FOUND, '사업자(Company)를 찾을 수 없습니다.', 404);
    const existingProfile = await this.prisma.agent.findUnique({ where: { userId } });
    if (existingProfile) {
      throw new BusinessError(ErrorCode.USER_ALREADY_AGENT, '이미 에이전트로 등록된 사용자입니다.', 409);
    }
    let code = body.code?.trim();
    if (code) {
      const taken = await this.prisma.agent.findUnique({ where: { code } });
      if (taken) throw new BusinessError(ErrorCode.AGENT_CODE_TAKEN, '이미 사용 중인 에이전트 코드입니다.', 409);
    } else {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const candidate = this.generateAgentCodeCandidate();
        const clash = await this.prisma.agent.findUnique({ where: { code: candidate } });
        if (!clash) {
          code = candidate;
          break;
        }
      }
      if (!code) {
        throw new BusinessError(ErrorCode.NOT_FOUND, '에이전트 코드 자동 생성에 실패했습니다. code를 직접 지정하세요.', 500);
      }
    }
    const agent = await this.prisma.agent.create({
      data: {
        userId,
        companyId,
        code: code!,
        name: body.name.trim(),
        commissionRate: body.commissionRate,
      },
    });
    console.log('[AGENT_CODE_CREATED]', {
      agentId: String(agent.id),
      code: agent.code,
      userId: body.userId,
      companyId: body.companyId,
    });
    return {
      id: String(agent.id),
      userId: String(agent.userId),
      companyId: String(agent.companyId),
      code: agent.code,
      name: agent.name,
      commissionRate: agent.commissionRate,
      createdAt: agent.createdAt.toISOString(),
    };
  }

  async listAgents() {
    const list = await this.prisma.agent.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { loginId: true } }, company: { select: { name: true } } },
    });
    return list.map((a) => ({
      id: String(a.id),
      userId: String(a.userId),
      loginId: a.user.loginId,
      companyId: String(a.companyId),
      companyName: a.company.name,
      code: a.code,
      name: a.name,
      commissionRate: a.commissionRate,
      createdAt: a.createdAt.toISOString(),
    }));
  }

  /** ADMIN: Company + OPERATOR 계정 + companyId 연결 + 초기 비밀번호(미입력 시 자동) */
  async createCompanyWithOperator(body: {
    companyName: string;
    operatorLoginId: string;
    operatorPassword?: string;
    operatorName: string;
    operatorPhone: string;
    operatorBirthDate?: string;
  }) {
    const loginId = body.operatorLoginId.trim();
    const dupe = await this.prisma.user.findUnique({ where: { loginId } });
    if (dupe) {
      throw new BusinessError(ErrorCode.DUPLICATE_LOGIN_ID, '이미 사용 중인 로그인 ID입니다.', 409);
    }
    const operatorRole = await this.prisma.role.findUnique({ where: { code: 'OPERATOR' } });
    if (!operatorRole) {
      throw new BusinessError(
        ErrorCode.NOT_FOUND,
        'OPERATOR 역할이 DB에 없습니다. 마이그레이션·시드를 확인하세요.',
        500,
      );
    }
    const initialPassword = body.operatorPassword?.trim() || this.randomPassword();
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const birthDate = body.operatorBirthDate ? new Date(body.operatorBirthDate) : new Date('1990-01-01');

    const result = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: body.companyName.trim() },
      });
      const user = await tx.user.create({
        data: {
          loginId,
          passwordHash,
          name: body.operatorName.trim(),
          birthDate,
          phone: body.operatorPhone.trim(),
          status: UserStatus.ACTIVE,
          companyId: company.id,
          mustChangePassword: true,
          roles: { create: { roleId: operatorRole.id } },
        },
      });
      return { company, user };
    });

    await this.auditLog.log({
      action: 'COMPANY_AND_OPERATOR_ONBOARDED',
      entityType: 'COMPANY',
      entityId: String(result.company.id),
      afterData: {
        companyId: String(result.company.id),
        companyName: result.company.name,
        operatorUserId: String(result.user.id),
        operatorLoginId: loginId,
      },
    });
    console.log('[COMPANY_OPERATOR_ONBOARDED]', {
      companyId: String(result.company.id),
      operatorLoginId: loginId,
    });

    return {
      company: {
        id: String(result.company.id),
        name: result.company.name,
        createdAt: result.company.createdAt.toISOString(),
      },
      operatorAccount: {
        userId: String(result.user.id),
        loginId,
        initialPassword,
      },
    };
  }

  /** ADMIN: AGENT User + Agent 행 + code 자동 + commissionRate (비밀번호 미입력 시 자동) */
  async createAgentUserWithProfile(body: {
    companyId: string;
    loginId: string;
    password?: string;
    userName: string;
    phone: string;
    birthDate?: string;
    agentDisplayName: string;
    commissionRate: number;
  }) {
    if (body.commissionRate < 0 || body.commissionRate > 100) {
      throw new BusinessError(ErrorCode.COMMISSION_RATE_INVALID, 'commissionRate는 0~100 사이여야 합니다.', 400);
    }
    const companyId = BigInt(body.companyId);
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new BusinessError(ErrorCode.NOT_FOUND, '사업자(Company)를 찾을 수 없습니다.', 404);
    }
    const loginId = body.loginId.trim();
    const dupe = await this.prisma.user.findUnique({ where: { loginId } });
    if (dupe) {
      throw new BusinessError(ErrorCode.DUPLICATE_LOGIN_ID, '이미 사용 중인 로그인 ID입니다.', 409);
    }
    const agentRole = await this.prisma.role.findUnique({ where: { code: 'AGENT' } });
    if (!agentRole) {
      throw new BusinessError(ErrorCode.NOT_FOUND, 'AGENT 역할이 DB에 없습니다.', 500);
    }
    const initialPassword = body.password?.trim() || this.randomPassword();
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const birthDate = body.birthDate ? new Date(body.birthDate) : new Date('1990-01-01');

    const out = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          loginId,
          passwordHash,
          name: body.userName.trim(),
          birthDate,
          phone: body.phone.trim(),
          status: UserStatus.ACTIVE,
          roles: { create: { roleId: agentRole.id } },
        },
      });
      let code: string | null = null;
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const candidate = this.generateAgentCodeCandidate();
        const clash = await tx.agent.findUnique({ where: { code: candidate } });
        if (!clash) {
          code = candidate;
          break;
        }
      }
      if (!code) {
        throw new BusinessError(ErrorCode.NOT_FOUND, '에이전트 코드 자동 생성에 실패했습니다.', 500);
      }
      const agent = await tx.agent.create({
        data: {
          userId: user.id,
          companyId,
          code,
          name: body.agentDisplayName.trim(),
          commissionRate: body.commissionRate,
        },
      });
      return { user, agent };
    });

    console.log('[AGENT_CODE_CREATED]', {
      agentId: String(out.agent.id),
      code: out.agent.code,
      loginId,
    });
    await this.auditLog.log({
      action: 'AGENT_USER_ONBOARDED',
      entityType: 'AGENT',
      entityId: String(out.agent.id),
      afterData: { companyId: String(companyId), loginId, code: out.agent.code },
    });

    return {
      agent: {
        id: String(out.agent.id),
        code: out.agent.code,
        name: out.agent.name,
        commissionRate: out.agent.commissionRate,
        companyId: String(out.agent.companyId),
      },
      agentAccount: {
        userId: String(out.user.id),
        loginId,
        initialPassword,
      },
    };
  }

  /** SUPER_ADMIN/ADMIN: 대상 계정 임시 비밀번호 설정 + 다음 로그인 시 변경 강제 */
  async resetUserPassword(body: { userId: string; newPassword: string }) {
    const userId = BigInt(body.userId);
    const trimmed = body.newPassword.trim();
    if (trimmed.length < 8) {
      throw new BadRequestException('새 비밀번호는 8자 이상이어야 합니다.');
    }
    const target = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      throw new BusinessError(ErrorCode.NOT_FOUND, '사용자를 찾을 수 없습니다.', 404);
    }
    const passwordHash = await bcrypt.hash(trimmed, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: true },
    });
    await this.auditLog.log({
      action: 'ADMIN_USER_PASSWORD_RESET',
      entityType: 'USER',
      entityId: String(userId),
      afterData: { targetLoginId: target.loginId },
    });
    return { ok: true as const, userId: String(userId) };
  }

  private randomPassword(length = 14): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let s = '';
    for (let i = 0; i < length; i += 1) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return s;
  }

  private async assertSiteBelongsToCompany(siteId: bigint, companyId: bigint) {
    const site = await this.prisma.site.findUnique({ where: { id: siteId } });
    if (!site || site.companyId !== companyId) {
      throw new BusinessError(ErrorCode.UNAUTHORIZED, '해당 시설에 대한 권한이 없습니다.', 403);
    }
    return site;
  }

  private async assertSectionBelongsToCompany(sectionId: bigint, companyId: bigint) {
    const sec = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: { site: true },
    });
    if (!sec || sec.site.companyId !== companyId) {
      throw new BusinessError(ErrorCode.UNAUTHORIZED, '해당 구역에 대한 권한이 없습니다.', 403);
    }
    return sec;
  }

  private async assertSeatBelongsToCompany(seatId: bigint, companyId: bigint) {
    const seat = await this.prisma.seat.findUnique({
      where: { id: seatId },
      include: { section: { include: { site: true } } },
    });
    if (!seat || seat.section.site.companyId !== companyId) {
      throw new BusinessError(ErrorCode.UNAUTHORIZED, '해당 좌석에 대한 권한이 없습니다.', 403);
    }
    return seat;
  }

  async operatorCreateFacility(companyId: bigint, body: { name: string; address: string }) {
    return this.createFacility({
      name: body.name,
      address: body.address,
      companyId: Number(companyId),
    });
  }

  async operatorCreateSection(companyId: bigint, body: { facilityId: number; name: string; rows: number; cols: number }) {
    await this.assertSiteBelongsToCompany(BigInt(body.facilityId), companyId);
    return this.createSection(body);
  }

  async operatorGetSections(companyId: bigint, facilityId: string) {
    await this.assertSiteBelongsToCompany(BigInt(facilityId), companyId);
    return this.getSectionsByFacility(BigInt(facilityId));
  }

  async operatorGetSeats(companyId: bigint, sectionId: string) {
    await this.assertSectionBelongsToCompany(BigInt(sectionId), companyId);
    return this.getSeatsBySection(BigInt(sectionId));
  }

  async operatorGetPolicy(companyId: bigint, facilityId: string) {
    await this.assertSiteBelongsToCompany(BigInt(facilityId), companyId);
    return this.getPolicyByFacility(BigInt(facilityId));
  }

  async operatorUpdateSeatPrice(companyId: bigint, seatId: string, price: number) {
    await this.assertSeatBelongsToCompany(BigInt(seatId), companyId);
    return this.updateSeatPrice(BigInt(seatId), price);
  }

  async operatorSetSeatBlocked(companyId: bigint, seatId: string, isBlocked: boolean) {
    await this.assertSeatBelongsToCompany(BigInt(seatId), companyId);
    return this.setSeatBlocked(BigInt(seatId), isBlocked);
  }

  async operatorUpsertPolicy(
    companyId: bigint,
    body: { facilityId: number; maxWaiting?: number; maxYears?: number },
  ) {
    await this.assertSiteBelongsToCompany(BigInt(body.facilityId), companyId);
    return this.upsertPolicy(body);
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
