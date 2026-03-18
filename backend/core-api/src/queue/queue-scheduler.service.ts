import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from './queue.service';

/**
 * 대기열 ACTIVE 승격 / 만료 처리를 주기적으로 실행.
 * 스케줄러는 orchestration만 담당, 핵심 로직은 QueueService.
 */
@Injectable()
export class QueueSchedulerService {
  private readonly logger = new Logger(QueueSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  @Cron('*/5 * * * *')
  async processQueueActivations() {
    const unitsWithWaiting = await this.prisma.queueEntry.groupBy({
      by: ['unitId'],
      where: { status: 'WAITING' },
    });
    let activated = 0;
    for (const g of unitsWithWaiting) {
      const result = await this.queueService.activateNextQueue(String(g.unitId));
      if (result) activated += 1;
    }
    if (activated > 0) {
      this.logger.log(`processQueueActivations: activated=${activated}`);
    }
  }

  @Cron('*/5 * * * *')
  async processQueueExpiries() {
    const results = await this.queueService.expireQueue();
    if (results.length > 0) {
      this.logger.log(`processQueueExpiries: processed=${results.length}`);
    }
  }
}
