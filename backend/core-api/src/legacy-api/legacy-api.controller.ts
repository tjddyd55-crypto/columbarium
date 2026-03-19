import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ContractStatus, ContractType, QueueStatus } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AllowPendingPasswordChange } from '../common/decorators/allow-pending-password-change.decorator';
import { FacilityService } from '../facilities/facility.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnitService } from '../units/unit.service';

@Controller('api')
export class LegacyApiController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly facilityService: FacilityService,
    private readonly unitService: UnitService,
  ) {}

  /**
   * 레거시 /api/auth/* 응답 (이중 success 래핑은 ResponseInterceptor와 호환)
   * login_id, mustChangePassword, roles 유지
   */
  private authEnvelopeFromResult(result: {
    accessToken: string;
    user: {
      id: string;
      loginId: string;
      name: string;
      email: string;
      role: string;
      roles: string[];
      mustChangePassword: boolean;
      companyId?: string;
      operatorId?: string;
    };
  }) {
    const u = result.user;
    return {
      success: true as const,
      data: {
        accessToken: result.accessToken,
        user: {
          id: u.id,
          email: u.email,
          role: u.role,
          roles: u.roles,
          login_id: u.loginId,
          name: u.name,
          mustChangePassword: u.mustChangePassword,
          ...(u.companyId != null && { companyId: u.companyId }),
          ...(u.operatorId != null && { operatorId: u.operatorId }),
        },
      },
    };
  }

  @Public()
  @Post('auth/signup')
  async signUp(
    @Body()
    body: {
      login_id?: string;
      password?: string;
      name?: string;
      birth_date?: string;
      phone?: string;
      email?: string;
      address?: string;
    },
  ) {
    if (!body.login_id || !body.password || !body.name || !body.phone) {
      throw new BadRequestException('login_id, password, name, phone are required');
    }
    const result = await this.authService.signUp({
      loginId: body.login_id.trim(),
      password: body.password,
      name: body.name.trim(),
      birthDate: body.birth_date || '1970-01-01',
      phone: body.phone.trim(),
      email: body.email?.trim(),
      addressRoad: body.address?.trim(),
    });
    return this.authEnvelopeFromResult(result);
  }

  @Public()
  @Post('auth/register')
  async register(
    @Body()
    body: {
      login_id?: string;
      password?: string;
      name?: string;
      birth_date?: string;
      phone?: string;
      email?: string;
      address?: string;
    },
  ) {
    return this.signUp(body);
  }

  @Public()
  @Post('auth/login')
  async login(@Body() body: { login_id?: string; password?: string }) {
    if (!body.login_id || !body.password) {
      throw new BadRequestException('login_id and password are required');
    }
    const result = await this.authService.login({
      loginId: body.login_id.trim(),
      password: body.password,
    });
    return this.authEnvelopeFromResult(result);
  }

  /** 관리자 웹 콘솔 전용 — ADMIN/SUPER_ADMIN 만 토큰 발급 */
  @Public()
  @Post('auth/admin-login')
  async adminLogin(@Body() body: { login_id?: string; password?: string }) {
    if (!body.login_id || !body.password) {
      throw new BadRequestException('login_id and password are required');
    }
    const result = await this.authService.loginForAdminPanel({
      loginId: body.login_id.trim(),
      password: body.password,
    });
    return this.authEnvelopeFromResult(result);
  }

  @AllowPendingPasswordChange()
  @Post('auth/change-password')
  async changePassword(
    @CurrentUser() current: { id: string },
    @Body() body: { current_password?: string; new_password?: string },
  ) {
    if (!body.current_password || !body.new_password) {
      throw new BadRequestException('current_password and new_password are required');
    }
    const result = await this.authService.changePassword(
      BigInt(current.id),
      body.current_password,
      body.new_password,
    );
    return this.authEnvelopeFromResult(result);
  }

  @AllowPendingPasswordChange()
  @Get('auth/me')
  async me(
    @CurrentUser()
    currentUser: {
      id: string;
      loginId: string;
      email?: string;
      role: string;
      roles?: string[];
      mustChangePassword?: boolean;
    },
  ) {
    return {
      success: true as const,
      data: {
        user: {
          id: currentUser.id,
          login_id: currentUser.loginId,
          email: currentUser.email ?? currentUser.loginId,
          role: currentUser.role,
          roles: currentUser.roles ?? [],
          mustChangePassword: currentUser.mustChangePassword ?? false,
        },
      },
    };
  }

  @Public()
  @Get('facilities')
  async listFacilities() {
    const facilities = await this.facilityService.findAll();
    const mapped = await Promise.all(
      facilities.map(async (f) => {
        const unitPrice = await this.prisma.memorialUnit.aggregate({
          where: { facilityId: BigInt(f.id) },
          _min: { basePrice: true },
        });
        return {
          id: f.id,
          name: f.name,
          address: f.addressRoad ?? null,
          price_from: unitPrice._min.basePrice ?? null,
          image_url: null,
        };
      }),
    );
    return mapped;
  }

  @Public()
  @Get('facilities/:id')
  async getFacility(@Param('id') id: string) {
    const facility = await this.facilityService.findById(id);
    const unitPrice = await this.prisma.memorialUnit.aggregate({
      where: { facilityId: this.parseBigInt(id, 'id') },
      _min: { basePrice: true },
    });
    return {
      id: facility.id,
      name: facility.name,
      address: facility.addressRoad ?? null,
      price_from: unitPrice._min.basePrice ?? null,
      image_url: null,
    };
  }

  @Public()
  @Get('facilities/:id/seats')
  async getFacilitySeats(@Param('id') id: string) {
    const units = await this.facilityService.findUnitsByFacilityId(id);
    return units.map((u) => ({
      seat_id: u.id,
      code: u.unitCode,
    }));
  }

  @Public()
  @Get('seats/:seatId/status')
  async getSeatStatus(@Param('seatId') seatId: string) {
    const unitId = this.parseBigInt(seatId, 'seatId');
    const activeContract = await this.prisma.contract.count({
      where: { unitId, status: ContractStatus.ACTIVE },
    });
    const waitingCount = await this.prisma.queueEntry.count({
      where: { unitId, status: QueueStatus.WAITING },
    });
    const status = activeContract > 0 ? 'ACTIVE' : waitingCount > 0 ? 'WAITING' : 'AVAILABLE';
    return { status, waitingCount };
  }

  @Post('waitlist')
  async createWaitlist(
    @CurrentUser() user: { id: string },
    @Body() body: { seat_id?: string; user_name?: string; user_phone?: string },
  ) {
    if (!body.seat_id) throw new BadRequestException('seat_id required');
    const unitId = this.parseBigInt(body.seat_id, 'seat_id');
    const uid = this.parseBigInt(user.id, 'user.id');

    const unit = await this.prisma.memorialUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw new NotFoundException('Seat not found');

    const dup = await this.prisma.queueEntry.findFirst({
      where: { unitId, userId: uid, status: { in: [QueueStatus.WAITING, QueueStatus.ACTIVE] } },
    });
    if (dup) throw new ConflictException('Already in waitlist');

    const maxPos = await this.prisma.queueEntry.aggregate({
      where: { unitId },
      _max: { queuePosition: true },
    });
    const created = await this.prisma.queueEntry.create({
      data: {
        operatorId: unit.operatorId,
        facilityId: unit.facilityId,
        unitId,
        userId: uid,
        queuePosition: (maxPos._max.queuePosition ?? 0) + 1,
        status: QueueStatus.WAITING,
      },
    });
    await this.unitService.syncUnitStatus(unitId);
    return { id: String(created.id) };
  }

  @Public()
  @Get('waitlist')
  async listWaitlist() {
    const rows = await this.prisma.queueEntry.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
    return rows.map((r) => ({
      id: String(r.id),
      seat_id: String(r.unitId),
      user_name: r.user.name,
      user_phone: r.user.phone,
      status: r.status,
      position: r.queuePosition,
      created_at: r.createdAt.toISOString(),
    }));
  }

  @Public()
  @Get('waitlist/:seatId')
  async waitlistCount(@Param('seatId') seatId: string) {
    const unitId = this.parseBigInt(seatId, 'seatId');
    const count = await this.prisma.queueEntry.count({
      where: { unitId, status: QueueStatus.WAITING },
    });
    return { count };
  }

  @Public()
  @Patch('waitlist/:id/activate')
  async activateWaitlist(@Param('id') id: string) {
    const queueId = this.parseBigInt(id, 'id');
    const row = await this.prisma.queueEntry.findUnique({ where: { id: queueId } });
    if (!row) throw new NotFoundException('Waitlist row not found');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.prisma.queueEntry.update({
      where: { id: queueId },
      data: { status: QueueStatus.ACTIVE, activatedAt: new Date(), expiresAt },
    });
    await this.unitService.syncUnitStatus(row.unitId);
    return { ok: true };
  }

  @Post('contracts')
  async createContract(
    @CurrentUser() user: { id: string; loginId: string },
    @Body() body: { seat_id?: string; waitlist_id?: string; user_name?: string; price?: number },
  ) {
    if (!body.seat_id) throw new BadRequestException('seat_id required');
    const unitId = this.parseBigInt(body.seat_id, 'seat_id');
    const uid = this.parseBigInt(user.id, 'user.id');

    const unit = await this.prisma.memorialUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw new NotFoundException('Seat not found');

    const active = await this.prisma.contract.findFirst({
      where: { unitId, status: ContractStatus.ACTIVE },
    });
    if (active) throw new ConflictException('ACTIVE contract already exists for this seat');

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + unit.contractYears);

    const price = body.price ?? unit.basePrice;
    const created = await this.prisma.contract.create({
      data: {
        contractNo: `LEG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        operatorId: unit.operatorId,
        facilityId: unit.facilityId,
        unitId,
        buyerUserId: uid,
        sellerUserId: null,
        contractType: ContractType.NEW,
        status: ContractStatus.PENDING,
        basePrice: price,
        discountAmount: 0,
        finalPrice: price,
        startDate,
        endDate,
      },
    });
    return { id: String(created.id) };
  }

  @Public()
  @Get('contracts')
  async listContracts() {
    const rows = await this.prisma.contract.findMany({
      orderBy: { createdAt: 'desc' },
      include: { buyer: true },
    });
    return rows.map((r) => ({
      id: String(r.id),
      seat_id: String(r.unitId),
      user_name: r.buyer.name,
      price: r.finalPrice,
      status: r.status,
      created_at: r.createdAt.toISOString(),
    }));
  }

  @Public()
  @Get('contracts/:seatId')
  async hasActiveContract(@Param('seatId') seatId: string) {
    const unitId = this.parseBigInt(seatId, 'seatId');
    const hasActive =
      (await this.prisma.contract.count({ where: { unitId, status: ContractStatus.ACTIVE } })) > 0;
    return { hasActive };
  }

  @Public()
  @Patch('contracts/:id/activate')
  async activateContract(@Param('id') id: string) {
    const contractId = this.parseBigInt(id, 'id');
    const row = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!row) throw new NotFoundException('Contract not found');
    const existingActive = await this.prisma.contract.findFirst({
      where: { unitId: row.unitId, status: ContractStatus.ACTIVE },
    });
    if (existingActive && existingActive.id !== row.id) {
      throw new ConflictException('ACTIVE contract already exists for this seat');
    }
    await this.prisma.contract.update({
      where: { id: contractId },
      data: { status: ContractStatus.ACTIVE },
    });
    await this.unitService.syncUnitStatus(row.unitId);
    return { ok: true };
  }

  @Get('my/waitlist')
  async myWaitlist(@CurrentUser() user: { id: string }) {
    const uid = this.parseBigInt(user.id, 'user.id');
    const rows = await this.prisma.queueEntry.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
    return rows.map((r) => ({
      id: String(r.id),
      seat_id: String(r.unitId),
      user_name: r.user.name,
      user_phone: r.user.phone,
      status: r.status,
      created_at: r.createdAt.toISOString(),
    }));
  }

  @Get('my/contracts')
  async myContracts(@CurrentUser() user: { id: string }) {
    const uid = this.parseBigInt(user.id, 'user.id');
    const rows = await this.prisma.contract.findMany({
      where: { buyerUserId: uid },
      orderBy: { createdAt: 'desc' },
      include: { buyer: true },
    });
    return rows.map((r) => ({
      id: String(r.id),
      seat_id: String(r.unitId),
      user_name: r.buyer.name,
      price: r.finalPrice,
      status: r.status,
      created_at: r.createdAt.toISOString(),
    }));
  }

  private parseBigInt(value: string, fieldName: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(`${fieldName} is invalid`);
    }
  }
}
