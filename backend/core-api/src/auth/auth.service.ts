import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { primaryRoleCode } from '../common/utils/role-priority.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    const existing = await this.prisma.user.findUnique({ where: { loginId: dto.loginId } });
    if (existing) throw new ConflictException('이미 사용 중인 아이디입니다.');

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : null;
    const birthDate = dto.birthDate ? new Date(dto.birthDate) : new Date(0); // 스키마상 필수
    const phone = dto.phone ?? '';

    const userRole = await this.prisma.role.upsert({
      where: { code: 'USER' },
      create: { code: 'USER', name: '일반 사용자' },
      update: {},
    });

    const user = await this.prisma.user.create({
      data: {
        loginId: dto.loginId,
        passwordHash,
        name: dto.name,
        birthDate,
        phone,
        email: dto.email ?? null,
        addressRoad: dto.addressRoad ?? null,
        addressDetail: dto.addressDetail ?? null,
        postalCode: dto.postalCode ?? null,
        status: UserStatus.ACTIVE,
        mustChangePassword: false,
        roles: {
          create: { roleId: userRole.id },
        },
      },
      include: { roles: { include: { role: true } }, operatorAdmins: { take: 1 } },
    });

    return this.issueTokens(user);
  }

  /** 일반 로그인 (USER/AGENT/OPERATOR 등 모든 활성 계정) */
  async login(dto: LoginDto) {
    const user = await this.verifyLocalCredentials(dto);
    return this.completeLoginSession(user);
  }

  /**
   * 관리자 콘솔 전용 로그인
   * - ADMIN / SUPER_ADMIN: 전체
   * - OPERATOR / OPERATOR_ADMIN: 소속 companyId 가 있을 때만 (본인 사업자 포털)
   */
  async loginForAdminPanel(dto: LoginDto) {
    const user = await this.verifyLocalCredentials(dto);
    const roleCodes = user.roles.map((r) => String(r.role.code));
    const isPlatformAdmin = roleCodes.includes('ADMIN') || roleCodes.includes('SUPER_ADMIN');
    const isOperatorConsole =
      roleCodes.includes('OPERATOR') || roleCodes.includes('OPERATOR_ADMIN');
    if (!isPlatformAdmin && !isOperatorConsole) {
      throw new ForbiddenException('관리자 콘솔에 로그인할 수 없는 역할입니다.');
    }
    if (isOperatorConsole && user.companyId == null) {
      throw new ForbiddenException('소속 사업자가 없는 운영자는 관리자 콘솔에 접근할 수 없습니다.');
    }
    return this.completeLoginSession(user);
  }

  private async verifyLocalCredentials(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { loginId: dto.loginId },
      include: { roles: { include: { role: true } }, operatorAdmins: { take: 1 } },
    });
    if (!user?.passwordHash) throw new UnauthorizedException('아이디 또는 비밀번호를 확인하세요.');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('아이디 또는 비밀번호를 확인하세요.');
    if (user.status !== UserStatus.ACTIVE) throw new UnauthorizedException('비활성화된 계정입니다.');
    return user;
  }

  private async completeLoginSession(user: {
    id: bigint;
    loginId: string;
    name: string;
    email?: string | null;
    companyId?: bigint | null;
    mustChangePassword: boolean;
    roles: { role: { code: string } }[];
    operatorAdmins?: { operatorId: bigint }[];
  }) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    return this.issueTokens(user);
  }

  async changePassword(userId: bigint, currentPassword: string, newPassword: string) {
    if (newPassword.length < 8) {
      throw new BadRequestException('새 비밀번호는 8자 이상이어야 합니다.');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      throw new BadRequestException('비밀번호 로그인 계정이 아닙니다.');
    }
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });
    const refreshed = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } }, operatorAdmins: { take: 1 } },
    });
    if (!refreshed) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    return this.issueTokens(refreshed);
  }

  private issueTokens(user: {
    id: bigint;
    loginId: string;
    name: string;
    email?: string | null;
    companyId?: bigint | null;
    mustChangePassword: boolean;
    roles: { role: { code: string } }[];
    operatorAdmins?: { operatorId: bigint }[];
  }) {
    const roleCodes = user.roles.map((r) => String(r.role.code));
    const roleCode = primaryRoleCode(roleCodes);
    const operatorId = user.operatorAdmins?.[0]?.operatorId;
    const payload = { sub: String(user.id), loginId: user.loginId };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: String(user.id),
        loginId: user.loginId,
        name: user.name,
        email: user.email && user.email.trim() !== '' ? user.email : user.loginId,
        role: roleCode,
        roles: roleCodes,
        mustChangePassword: user.mustChangePassword,
        ...(user.companyId != null && { companyId: String(user.companyId) }),
        ...(operatorId != null && { operatorId: String(operatorId) }),
      },
    };
  }
}
