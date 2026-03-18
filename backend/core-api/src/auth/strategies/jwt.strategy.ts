import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  username: string;
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
    const roleCode = user.roles[0]?.role?.code ?? 'USER';
    return {
      id: String(user.id),
      username: user.username,
      email: user.email ?? user.username,
      role: roleCode,
    };
  }
}
