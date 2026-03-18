import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContractStatus, ContractType, QueueStatus } from '@prisma/client';
import { UnitService } from '../units/unit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationType } from '@prisma/client';
import { BusinessError, ErrorCode } from '../common/errors/business.error';

@Injectable()
export class ContractService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly unitService: UnitService,
    private readonly notifications: NotificationsService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * 계약 생성: queueEntry가 ACTIVE이고 만료 전이어야 함. 트랜잭션 내 계약 생성, queue COMPLETED, unit 동기화.
   */
  async createContract(userId: string, body: { unitId: string; queueEntryId: string }) {
    const uid = BigInt(userId);
    const unitId = BigInt(body.unitId);
    const queueEntryId = BigInt(body.queueEntryId);

    const result = await this.prisma.$transaction(async (tx) => {
      const entry = await tx.queueEntry.findFirst({
        where: { id: queueEntryId, userId: uid, unitId },
        include: { unit: true },
      });
      if (!entry) throw new BusinessError(ErrorCode.NOT_FOUND, '대기열 정보를 찾을 수 없습니다.', 404);
      if (entry.status !== QueueStatus.ACTIVE)
        throw new BusinessError(ErrorCode.NOT_ACTIVE_QUEUE, '구매 기회(ACTIVE) 상태에서만 계약할 수 있습니다.', 400);
      if (entry.expiresAt && entry.expiresAt < new Date())
        throw new BusinessError(ErrorCode.QUEUE_EXPIRED, '구매 기회가 만료되었습니다.', 400);

      const existingContract = await tx.contract.findFirst({
        where: { unitId, status: ContractStatus.ACTIVE },
      });
      if (existingContract)
        throw new BusinessError(ErrorCode.CONTRACT_ALREADY_EXISTS, '이미 해당 칸에 활성 계약이 있습니다.', 400);

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + entry.unit.contractYears);

      const contract = await tx.contract.create({
        data: {
          contractNo: `CT-${entry.unitId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          operatorId: entry.operatorId,
          facilityId: entry.facilityId,
          unitId: entry.unitId,
          buyerUserId: uid,
          sellerUserId: null,
          contractType: ContractType.NEW,
          status: ContractStatus.ACTIVE,
          basePrice: entry.unit.basePrice,
          discountAmount: 0,
          finalPrice: entry.unit.basePrice,
          startDate,
          endDate,
        },
      });

      await tx.queueEntry.update({
        where: { id: queueEntryId },
        data: { status: QueueStatus.COMPLETED },
      });
      await this.unitService.syncUnitStatus(unitId, tx as any);
      const unitWithFacility = await tx.memorialUnit.findUnique({
        where: { id: entry.unitId },
        include: { facility: true },
      });
      await this.notifications.createMultiChannelNotifications(
        {
          userId: uid,
          type: NotificationType.CONTRACT_COMPLETED,
          relatedTable: 'contracts',
          relatedId: String(contract.id),
          metadata: {
            facilityName: unitWithFacility?.facility.name ?? '',
            unitCode: unitWithFacility?.unitCode ?? '',
            contractNo: contract.contractNo,
            contractId: String(contract.id),
          },
        },
        tx as any,
      );

      return {
        id: String(contract.id),
        contractNo: contract.contractNo,
        unitId: String(contract.unitId),
        status: contract.status,
        finalPrice: contract.finalPrice,
        startDate: contract.startDate.toISOString().slice(0, 10),
        endDate: contract.endDate.toISOString().slice(0, 10),
      };
    });
    await this.auditLog.log({
      action: 'CONTRACT_CREATED',
      entityType: 'CONTRACT',
      entityId: result.id,
      afterData: { ...result, buyerUserId: String(uid) },
    });
    return result;
  }

  async getMyContracts(userId: string) {
    const uid = BigInt(userId);
    const list = await this.prisma.contract.findMany({
      where: { buyerUserId: uid },
      orderBy: { createdAt: 'desc' },
      include: { unit: { include: { facility: true } } },
    });
    return list.map((c) => ({
      id: String(c.id),
      contractNo: c.contractNo,
      unitId: String(c.unitId),
      unitCode: c.unit.unitCode,
      facilityName: c.unit.facility.name,
      status: c.status,
      contractType: c.contractType,
      finalPrice: c.finalPrice,
      startDate: c.startDate.toISOString().slice(0, 10),
      endDate: c.endDate.toISOString().slice(0, 10),
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async getContractById(userId: string, contractId: string) {
    const uid = BigInt(userId);
    const cid = BigInt(contractId);
    const contract = await this.prisma.contract.findFirst({
      where: { id: cid, buyerUserId: uid },
      include: { unit: { include: { facility: true } } },
    });
    if (!contract) throw new BusinessError(ErrorCode.NOT_FOUND, '계약을 찾을 수 없습니다.', 404);
    return {
      id: String(contract.id),
      contractNo: contract.contractNo,
      unitId: String(contract.unitId),
      unitCode: contract.unit.unitCode,
      facilityName: contract.unit.facility.name,
      status: contract.status,
      contractType: contract.contractType,
      basePrice: contract.basePrice,
      discountAmount: contract.discountAmount,
      finalPrice: contract.finalPrice,
      startDate: contract.startDate.toISOString().slice(0, 10),
      endDate: contract.endDate.toISOString().slice(0, 10),
      createdAt: contract.createdAt.toISOString(),
    };
  }
}
