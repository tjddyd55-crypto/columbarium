import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessError, ErrorCode } from '../common/errors/business.error';

@Injectable()
export class FacilityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { operatorId?: string }) {
    const where: any = { status: 'ACTIVE' };
    if (filters?.operatorId) where.operatorId = BigInt(filters.operatorId);
    const list = await this.prisma.facility.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { operator: { select: { id: true, name: true } } },
    });
    return list.map((f) => ({
      id: String(f.id),
      name: f.name,
      description: f.description,
      phone: f.phone,
      addressRoad: f.addressRoad,
      addressDetail: f.addressDetail,
      lat: f.lat,
      lng: f.lng,
      operatorId: String(f.operatorId),
      operatorName: f.operator.name,
    }));
  }

  async findById(id: string) {
    const facility = await this.prisma.facility.findFirst({
      where: { id: BigInt(id), status: 'ACTIVE' },
      include: { operator: { select: { id: true, name: true } } },
    });
    if (!facility) throw new BusinessError(ErrorCode.NOT_FOUND, '시설을 찾을 수 없습니다.', 404);
    return {
      id: String(facility.id),
      name: facility.name,
      description: facility.description,
      phone: facility.phone,
      addressRoad: facility.addressRoad,
      addressJibun: facility.addressJibun,
      addressDetail: facility.addressDetail,
      postalCode: facility.postalCode,
      lat: facility.lat,
      lng: facility.lng,
      operatorId: String(facility.operatorId),
      operatorName: facility.operator.name,
    };
  }

  async findUnitsByFacilityId(facilityId: string) {
    const facility = await this.prisma.facility.findFirst({
      where: { id: BigInt(facilityId), status: 'ACTIVE' },
    });
    if (!facility) throw new BusinessError(ErrorCode.NOT_FOUND, '시설을 찾을 수 없습니다.', 404);
    const units = await this.prisma.memorialUnit.findMany({
      where: { facilityId: BigInt(facilityId) },
      orderBy: [{ rowCode: 'asc' }, { colNo: 'asc' }],
    });
    return units.map((u) => ({
      id: String(u.id),
      unitCode: u.unitCode,
      rowCode: u.rowCode,
      colNo: u.colNo,
      x: u.x,
      y: u.y,
      width: u.width,
      height: u.height,
      status: u.status,
      basePrice: u.basePrice,
      preSalePrice: u.preSalePrice,
      contractYears: u.contractYears,
    }));
  }
}
