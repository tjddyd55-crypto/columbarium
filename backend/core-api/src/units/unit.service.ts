import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UnitStatus } from '@prisma/client';
import { BusinessError, ErrorCode } from '../common/errors/business.error';

/**
 * Unit 상태는 직접 변경하지 않고, Queue/Contract 존재 여부로 계산하여 동기화한다.
 * - CONTRACTED → 활성 계약 존재
 * - ACTIVE_OFFER → ACTIVE 상태 queue 존재
 * - WAITING_QUEUE → WAITING 상태 queue 존재
 * - AVAILABLE → 위 해당 없음
 */
@Injectable()
export class UnitService {
  constructor(private readonly prisma: PrismaService) {}

  async getUnitById(unitId: bigint) {
    const unit = await this.prisma.memorialUnit.findUnique({
      where: { id: unitId },
      include: { facility: true, operator: true },
    });
    if (!unit) throw new BusinessError(ErrorCode.NOT_FOUND, '칸 정보를 찾을 수 없습니다.', 404);
    return unit;
  }

  /**
   * unit 상태를 Queue/Contract 기준으로 계산 후 업데이트 (트랜잭션 내부에서 호출 가능)
   */
  async syncUnitStatus(unitId: bigint, tx?: Omit<PrismaService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) {
    const client = tx ?? this.prisma;

    const activeContract = await client.contract.findFirst({
      where: { unitId, status: 'ACTIVE' },
    });
    if (activeContract) {
      await client.memorialUnit.update({
        where: { id: unitId },
        data: { status: UnitStatus.CONTRACTED },
      });
      return UnitStatus.CONTRACTED;
    }

    const activeQueue = await client.queueEntry.findFirst({
      where: { unitId, status: 'ACTIVE' },
    });
    if (activeQueue) {
      await client.memorialUnit.update({
        where: { id: unitId },
        data: { status: UnitStatus.ACTIVE_OFFER },
      });
      return UnitStatus.ACTIVE_OFFER;
    }

    const waitingQueue = await client.queueEntry.findFirst({
      where: { unitId, status: 'WAITING' },
    });
    if (waitingQueue) {
      await client.memorialUnit.update({
        where: { id: unitId },
        data: { status: UnitStatus.WAITING_QUEUE },
      });
      return UnitStatus.WAITING_QUEUE;
    }

    await client.memorialUnit.update({
      where: { id: unitId },
      data: { status: UnitStatus.AVAILABLE },
    });
    return UnitStatus.AVAILABLE;
  }
}
