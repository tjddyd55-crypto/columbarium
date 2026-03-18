import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('me')
  async getMy(
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('unreadFirst') unreadFirst?: string,
  ) {
    const userId = BigInt(user.id);
    const result = await this.notifications.getMyNotifications(userId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
      unreadFirst: unreadFirst === 'true',
    });
    return result;
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: { id: string }) {
    const count = await this.notifications.getUnreadCount(BigInt(user.id));
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    await this.notifications.markAsRead(BigInt(id), BigInt(user.id));
    return { ok: true };
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: { id: string }) {
    await this.notifications.markAllAsRead(BigInt(user.id));
    return { ok: true };
  }
}
