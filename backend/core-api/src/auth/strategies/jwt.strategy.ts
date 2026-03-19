import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import { primaryRoleCode } from '../../common/utils/role-priority.util';

export interface JwtPayload {
  sub: string;
  loginId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'change-me',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findFirst({
      where: { id: BigInt(payload.sub), status: UserStatus.ACTIVE },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new UnauthorizedException();
    const roleCodes = user.roles.map((ur) => String(ur.role.code));
    return {
      id: String(user.id),
      loginId: user.loginId,
      email: user.email ?? user.loginId,
      role: primaryRoleCode(roleCodes),
      roles: roleCodes,
      mustChangePassword: user.mustChangePassword,
      ...(user.companyId != null && { companyId: String(user.companyId) }),
    };
  }
}
