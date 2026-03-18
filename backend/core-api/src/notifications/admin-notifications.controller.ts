import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationDispatcherService } from './notification-dispatcher.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { NotificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'OPERATOR_ADMIN')
export class AdminNotificationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  @Get()
  async list(
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const where: any = {};
    if (userId) where.userId = BigInt(userId);
    if (status) where.status = status;
    const take = Math.min(parseInt(limit ?? '50', 10) || 50, 100);
    const skip = parseInt(offset ?? '0', 10) || 0;
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: { user: { select: { id: true, name: true, phone: true } } },
      }),
      this.prisma.notification.count({ where }),
    ]);
    return {
      items: items.map((n) => ({
        id: String(n.id),
        userId: String(n.userId),
        userName: n.user.name,
        type: n.type,
        title: n.title,
        channel: n.channel,
        status: n.status,
        relatedTable: n.relatedTable,
        relatedId: n.relatedId,
        retryCount: n.retryCount,
        errorCode: n.errorCode,
        errorMessage: n.errorMessage,
        createdAt: n.createdAt.toISOString(),
        sentAt: n.sentAt?.toISOString() ?? null,
      })),
      total,
    };
  }

  @Get('failed')
  async failed(@Query('limit') limit?: string) {
    const take = Math.min(parseInt(limit ?? '50', 10) || 50, 100);
    const items = await this.prisma.notification.findMany({
      where: { status: NotificationStatus.FAILED },
      orderBy: { updatedAt: 'desc' },
      take,
      include: { user: { select: { id: true, name: true } } },
    });
    return {
      items: items.map((n) => ({
        id: String(n.id),
        userId: String(n.userId),
        userName: n.user.name,
        type: n.type,
        channel: n.channel,
        retryCount: n.retryCount,
        errorCode: n.errorCode,
        errorMessage: n.errorMessage,
        updatedAt: n.updatedAt.toISOString(),
      })),
    };
  }

  @Post(':id/retry')
  async retry(@Param('id') id: string) {
    const nid = BigInt(id);
    const n = await this.prisma.notification.findUnique({
      where: { id: nid },
    });
    if (!n) return { ok: false, error: 'NOTIFICATION_NOT_FOUND' };
    if (n.status !== NotificationStatus.FAILED) {
      return { ok: false, error: 'Only FAILED notifications can be retried' };
    }
    if (n.retryCount >= 3) {
      return { ok: false, error: 'RETRY_LIMIT_EXCEEDED' };
    }
    await this.prisma.notification.update({
      where: { id: nid },
      data: { status: NotificationStatus.PENDING, scheduledAt: null },
    });
    const success = await this.dispatcher.dispatchOne(nid);
    return { ok: true, sent: success };
  }
}
