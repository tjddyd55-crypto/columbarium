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

  console.log('Seed 완료. 수퍼관리자 계정:', SUPER_ADMIN_SEED.loginId);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
