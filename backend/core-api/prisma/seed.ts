import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/** 시드용 수퍼관리자 계정 (운영 환경에서는 배포 후 비밀번호 변경 권장) */
const SUPER_ADMIN_SEED = {
  loginId: 'superadmin',
  password: 'SuperAdmin1!',
  name: '슈퍼관리자',
  birthDate: new Date('1990-01-01'),
  phone: '010-0000-0000',
};

async function main() {
  await prisma.role.upsert({ where: { code: 'USER' }, create: { code: 'USER', name: '일반 사용자' }, update: {} });
  await prisma.role.upsert({ where: { code: 'SALES_MANAGER' }, create: { code: 'SALES_MANAGER', name: '영업관리자' }, update: {} });
  await prisma.role.upsert({ where: { code: 'OPERATOR_ADMIN' }, create: { code: 'OPERATOR_ADMIN', name: '업체관리자' }, update: {} });
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    create: { code: 'SUPER_ADMIN', name: '슈퍼관리자' },
    update: {},
  });

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_SEED.password, 10);
  const superAdminUser = await prisma.user.upsert({
    where: { loginId: SUPER_ADMIN_SEED.loginId },
    create: {
      loginId: SUPER_ADMIN_SEED.loginId,
      passwordHash,
      name: SUPER_ADMIN_SEED.name,
      birthDate: SUPER_ADMIN_SEED.birthDate,
      phone: SUPER_ADMIN_SEED.phone,
      status: 'ACTIVE',
      roles: { create: { roleId: superAdminRole.id } },
    },
    update: { passwordHash },
    include: { roles: true },
  });

  const hasSuperAdminRole = superAdminUser.roles.some((r) => r.roleId === superAdminRole.id);
  if (!hasSuperAdminRole) {
    await prisma.userRole.create({
      data: { userId: superAdminUser.id, roleId: superAdminRole.id },
    });
  }

  // ----- 시설/좌석 샘플 데이터 (Company 1, Facility 1, Section 2개, SeatPolicy 1) -----
  let company = await prisma.company.findFirst({ where: { name: '샘플 사업자' } });
  if (!company) {
    company = await prisma.company.create({ data: { name: '샘플 사업자' } });
  }
  let site = await prisma.site.findFirst({ where: { companyId: company.id, name: '샘플 강남 봉안당' } });
  if (!site) {
    site = await prisma.site.create({
      data: {
        name: '샘플 강남 봉안당',
        address: '서울특별시 강남구 테헤란로 123',
        companyId: company.id,
      },
    });
  }
  let sectionA = await prisma.section.findFirst({ where: { facilityId: site.id, name: 'A' } });
  if (!sectionA) {
    sectionA = await prisma.section.create({ data: { facilityId: site.id, name: 'A', rows: 4, cols: 6 } });
    const seatsA: { sectionId: bigint; row: number; col: number; price: number }[] = [];
    for (let r = 1; r <= 4; r++) for (let c = 1; c <= 6; c++) seatsA.push({ sectionId: sectionA.id, row: r, col: c, price: 25000000 });
    await prisma.seat.createMany({ data: seatsA });
  }
  let sectionB = await prisma.section.findFirst({ where: { facilityId: site.id, name: 'B' } });
  if (!sectionB) {
    sectionB = await prisma.section.create({ data: { facilityId: site.id, name: 'B', rows: 3, cols: 5 } });
    const seatsB: { sectionId: bigint; row: number; col: number; price: number }[] = [];
    for (let r = 1; r <= 3; r++) for (let c = 1; c <= 5; c++) seatsB.push({ sectionId: sectionB.id, row: r, col: c, price: 25000000 });
    await prisma.seat.createMany({ data: seatsB });
  }
  const sections = [sectionA, sectionB];
  const policy = await prisma.seatPolicy.findUnique({ where: { facilityId: site.id } });
  if (!policy) {
    await prisma.seatPolicy.create({ data: { facilityId: site.id, maxWaiting: 3, maxYears: 30 } });
  }

  const companyCount = await prisma.company.count();
  const facilityCount = await prisma.site.count();
  const sectionCount = await prisma.section.count();
  const seatCount = await prisma.seat.count();
  console.log('Seed 완료. 수퍼관리자 계정:', SUPER_ADMIN_SEED.loginId);
  console.log('샘플 시설/좌석:', { companyCount, facilityCount, sectionCount, seatCount });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
