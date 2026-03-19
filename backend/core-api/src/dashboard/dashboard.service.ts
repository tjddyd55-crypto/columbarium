import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommissionStatus, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type DashboardUser = {
  id: string;
  roles: string[];
  companyId?: string;
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private isAdmin(roles: string[]) {
    return roles.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');
  }

  private isOperator(roles: string[]) {
    return roles.some((r) => r === 'OPERATOR' || r === 'OPERATOR_ADMIN');
  }

  private isAgent(roles: string[]) {
    return roles.some((r) => r === 'AGENT' || r === 'SALES_MANAGER');
  }

  async getSummary(user: DashboardUser) {
    const { roles, id } = user;
    if (this.isAdmin(roles)) {
      const [companyCount, siteCount, confirmedCount, pendingCommissions] = await Promise.all([
        this.prisma.company.count(),
        this.prisma.site.count(),
        this.prisma.reservation.count({ where: { status: ReservationStatus.CONFIRMED } }),
        this.prisma.commission.count({ where: { status: CommissionStatus.PENDING } }),
      ]);
      return {
        view: 'ADMIN' as const,
        companyCount,
        siteCount,
        confirmedReservationCount: confirmedCount,
        pendingCommissionCount: pendingCommissions,
      };
    }

    if (this.isOperator(roles)) {
      if (!user.companyId) {
        throw new ForbiddenException('OPERATOR는 companyId가 설정된 계정만 대시보드를 사용할 수 있습니다.');
      }
      const companyId = BigInt(user.companyId);
      const sites = await this.prisma.site.findMany({
        where: { companyId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, address: true },
      });
      const agg = await this.prisma.reservation.aggregate({
        where: {
          status: ReservationStatus.CONFIRMED,
          seat: { section: { site: { companyId } } },
        },
        _sum: { price: true },
        _count: true,
      });
      return {
        view: 'OPERATOR' as const,
        companyId: user.companyId,
        sites: sites.map((s) => ({
          id: String(s.id),
          name: s.name,
          address: s.address,
        })),
        confirmedReservationCount: agg._count,
        revenueTotal: agg._sum.price ?? 0,
      };
    }

    if (this.isAgent(roles)) {
      const agent = await this.prisma.agent.findUnique({
        where: { userId: BigInt(id) },
        include: {
          company: { select: { id: true, name: true } },
        },
      });
      if (!agent) {
        throw new ForbiddenException('에이전트 프로필이 없습니다. 관리자에게 등록을 요청하세요.');
      }
      const [pendingAgg, paidAgg, reservationCount] = await Promise.all([
        this.prisma.commission.aggregate({
          where: { agentId: agent.id, status: CommissionStatus.PENDING },
          _sum: { amount: true },
          _count: true,
        }),
        this.prisma.commission.aggregate({
          where: { agentId: agent.id, status: CommissionStatus.PAID },
          _sum: { amount: true },
          _count: true,
        }),
        /** 에이전트 실적: CONFIRMED(결제 확정)만 인정 — RESERVED/WAITING/CANCELLED 제외 */
        this.prisma.reservation.count({
          where: { agentId: agent.id, status: ReservationStatus.CONFIRMED },
        }),
      ]);
      const recent = await this.prisma.commission.findMany({
        where: { agentId: agent.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { reservation: { select: { id: true, price: true, status: true } } },
      });
      return {
        view: 'AGENT' as const,
        agent: {
          id: String(agent.id),
          code: agent.code,
          name: agent.name,
          commissionRate: agent.commissionRate,
          companyId: String(agent.companyId),
          companyName: agent.company.name,
        },
        /** CONFIRMED 예약 건수 (실적). 상세 규칙: docs/RBAC-OPERATIONS.md */
        confirmedSalesLinkedCount: reservationCount,
        commissionPendingTotal: pendingAgg._sum.amount ?? 0,
        commissionPendingCount: pendingAgg._count,
        commissionPaidTotal: paidAgg._sum.amount ?? 0,
        commissionPaidCount: paidAgg._count,
        recentCommissions: recent.map((c) => ({
          id: String(c.id),
          reservationId: String(c.reservationId),
          amount: c.amount,
          status: c.status,
          createdAt: c.createdAt.toISOString(),
          reservationPrice: c.reservation.price,
          reservationStatus: c.reservation.status,
        })),
      };
    }

    throw new ForbiddenException('대시보드 접근 권한이 없습니다.');
  }
}
