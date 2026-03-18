import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { BusinessError, ErrorCode } from '../common/errors/business.error';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async getOperators() {
    const list = await this.prisma.operator.findMany({
      orderBy: { name: 'asc' },
    });
    return list.map((o) => ({
      id: String(o.id),
      name: o.name,
      businessNo: o.businessNo,
      representativeName: o.representativeName,
      contactPhone: o.contactPhone,
      contactEmail: o.contactEmail,
      addressRoad: o.addressRoad,
      addressDetail: o.addressDetail,
      postalCode: o.postalCode,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
  }

  async createOperator(body: {
    name: string;
    businessNo: string;
    representativeName?: string;
    contactPhone?: string;
    contactEmail?: string;
    addressRoad?: string;
    addressDetail?: string;
    postalCode?: string;
  }) {
    const existing = await this.prisma.operator.findUnique({ where: { businessNo: body.businessNo } });
    if (existing) throw new BusinessError(ErrorCode.NOT_FOUND, '이미 등록된 사업자번호입니다.', 400);
    const o = await this.prisma.operator.create({
      data: {
        name: body.name,
        businessNo: body.businessNo,
        representativeName: body.representativeName,
        contactPhone: body.contactPhone,
        contactEmail: body.contactEmail,
        addressRoad: body.addressRoad,
        addressDetail: body.addressDetail,
        postalCode: body.postalCode,
      },
    });
    await this.auditLog.log({
      action: 'OPERATOR_CREATED',
      entityType: 'OPERATOR',
      entityId: String(o.id),
      afterData: { id: String(o.id), name: o.name, businessNo: o.businessNo },
    });
    return { id: String(o.id), name: o.name, businessNo: o.businessNo, status: o.status, createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString() };
  }

  async getUsers() {
    const list = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { roles: { include: { role: true } } },
    });
    return list.map((u) => ({
      id: String(u.id),
      loginId: u.loginId,
      name: u.name,
      phone: u.phone,
      email: u.email,
      status: u.status,
      role: u.roles[0]?.role?.code ?? 'USER',
      createdAt: u.createdAt.toISOString().slice(0, 10),
    }));
  }
}
