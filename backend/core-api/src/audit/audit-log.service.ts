import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getAuditContext } from './audit-context.storage';

export interface AuditLogParams {
  action: string;
  entityType: string;
  entityId?: string;
  beforeData?: object;
  afterData?: object;
  /** override from context (e.g. scheduler has no request) */
  userId?: bigint | string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: AuditLogParams): Promise<void> {
    const ctx = getAuditContext();
    const userId = params.userId != null
      ? (typeof params.userId === 'string' ? BigInt(params.userId) : params.userId)
      : (ctx?.userId ? BigInt(ctx.userId) : null);
    const userRole = params.userRole ?? ctx?.userRole ?? null;
    const ipAddress = params.ipAddress ?? ctx?.ipAddress ?? null;
    const userAgent = params.userAgent ?? ctx?.userAgent ?? null;

    await this.prisma.auditLog.create({
      data: {
        userId: userId ?? undefined,
        userRole: userRole ?? undefined,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? undefined,
        beforeData: (params.beforeData ?? undefined) as object | undefined,
        afterData: (params.afterData ?? undefined) as object | undefined,
        ipAddress: ipAddress ?? undefined,
        userAgent: userAgent ?? undefined,
      },
    });
  }

  async list(params: {
    userId?: string;
    entityType?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (params.userId) where.userId = BigInt(params.userId);
    if (params.entityType) where.entityType = params.entityType;
    if (params.action) where.action = params.action;
    const limit = Math.min(params.limit ?? 50, 100);
    const offset = params.offset ?? 0;
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return {
      items: items.map((a) => ({
        id: String(a.id),
        userId: a.userId != null ? String(a.userId) : null,
        userRole: a.userRole,
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        beforeData: a.beforeData,
        afterData: a.afterData,
        ipAddress: a.ipAddress,
        userAgent: a.userAgent,
        createdAt: a.createdAt.toISOString(),
      })),
      total,
    };
  }
}
