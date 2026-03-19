import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

/**
 * Worker 전용: ACTIVE 진입, 만료 처리.
 * 실제 운영에서는 CRON 또는 별도 Worker 프로세스에서 호출.
 * 권한: OPERATOR_ADMIN 이상 (또는 내부 서비스 토큰)
 */
@Controller('queue/worker')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR_ADMIN')
export class QueueWorkerController {
  constructor(private readonly queueService: QueueService) {}

  @Post('activate/:unitId')
  async activateNext(@Param('unitId') unitId: string) {
    const result = await this.queueService.activateNextQueue(unitId);
    return result ? { activated: true, queueEntryId: String(result.id) } : { activated: false };
  }

  @Post('expire')
  async expire() {
    const results = await this.queueService.expireQueue();
    return { processed: results.length, results };
  }
}
