import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';

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
        roles: {
          create: { roleId: userRole.id },
        },
      },
      include: { roles: { include: { role: true } } },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { loginId: dto.loginId },
      include: { roles: { include: { role: true } }, operatorAdmins: { take: 1 } },
    });
    if (!user?.passwordHash) throw new UnauthorizedException('아이디 또는 비밀번호를 확인하세요.');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('아이디 또는 비밀번호를 확인하세요.');
    if (user.status !== UserStatus.ACTIVE) throw new UnauthorizedException('비활성화된 계정입니다.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueTokens(user);
  }

  private issueTokens(user: { id: bigint; loginId: string; roles: { role: { code: string } }[]; operatorAdmins?: { operatorId: bigint }[] }) {
    const roleCode = user.roles[0]?.role?.code ?? 'USER';
    const operatorId = user.operatorAdmins?.[0]?.operatorId;
    const payload = { sub: String(user.id), loginId: user.loginId };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: String(user.id),
        loginId: user.loginId,
        role: roleCode,
        ...(operatorId != null && { operatorId: String(operatorId) }),
      },
    };
  }
}
