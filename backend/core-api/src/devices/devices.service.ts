import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DevicePlatform } from '@prisma/client';

export interface RegisterDeviceInput {
  pushToken: string;
  platform: DevicePlatform;
  appVersion?: string;
  deviceModel?: string;
}

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async registerDevice(userId: bigint, input: RegisterDeviceInput) {
    const existing = await this.prisma.userDevice.findUnique({
      where: {
        userId_pushToken: { userId, pushToken: input.pushToken },
      },
    });
    const now = new Date();
    if (existing) {
      return this.prisma.userDevice.update({
        where: { id: existing.id },
        data: {
          platform: input.platform,
          appVersion: input.appVersion ?? existing.appVersion,
          deviceModel: input.deviceModel ?? existing.deviceModel,
          isActive: true,
          lastSeenAt: now,
          updatedAt: now,
        },
      });
    }
    return this.prisma.userDevice.create({
      data: {
        userId,
        pushToken: input.pushToken,
        platform: input.platform,
        appVersion: input.appVersion,
        deviceModel: input.deviceModel,
        isActive: true,
        lastSeenAt: now,
      },
    });
  }

  async unregisterDevice(userId: bigint, pushToken: string) {
    await this.prisma.userDevice.updateMany({
      where: { userId, pushToken },
      data: { isActive: false },
    });
    return { ok: true };
  }

  async getMyDevices(userId: bigint) {
    const list = await this.prisma.userDevice.findMany({
      where: { userId },
      orderBy: { lastSeenAt: 'desc' },
    });
    return list.map((d) => ({
      id: String(d.id),
      platform: d.platform,
      appVersion: d.appVersion,
      deviceModel: d.deviceModel,
      isActive: d.isActive,
      lastSeenAt: d.lastSeenAt?.toISOString() ?? null,
      createdAt: d.createdAt.toISOString(),
    }));
  }
}
