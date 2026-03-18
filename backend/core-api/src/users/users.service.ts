import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: BigInt(id) },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('회원을 찾을 수 없습니다.');
    return user;
  }

  async getMe(userId: string) {
    const user = await this.findById(userId);
    const { passwordHash, ...rest } = user;
    return {
      ...rest,
      id: String(rest.id),
      birthDate: rest.birthDate.toISOString().slice(0, 10),
      lastLoginAt: rest.lastLoginAt?.toISOString() ?? null,
      createdAt: rest.createdAt.toISOString(),
      updatedAt: rest.updatedAt.toISOString(),
      roles: rest.roles.map((ur) => ur.role.code),
    };
  }
}
