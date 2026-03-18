/**
 * 마이그레이션 적용 후 DB 구조·데이터 검증 (한 번 실행 후 삭제 가능)
 * 실행: node prisma/verify-db.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq > 0) {
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[k] = v;
    }
  }
}

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('=== [1] User 테이블 컬럼 목록 ===');
  const columns = await prisma.$queryRaw`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User'
    ORDER BY ordinal_position;
  `;
  console.log(columns);
  const colNames = columns.map((c) => c.column_name);
  const hasLoginId = colNames.includes('loginId');
  const hasUsername = colNames.includes('username');
  console.log('loginId 존재:', hasLoginId ? '⭕' : '❌');
  console.log('username 존재:', hasUsername ? '❌ (제거됨)' : '⭕ (없음=정상)');

  console.log('\n=== [2] User 상위 10건 (id, loginId) ===');
  const users = await prisma.$queryRaw`SELECT id, "loginId" FROM "User" LIMIT 10`;
  console.log(users);

  console.log('\n=== [3] superadmin 계정 및 역할 ===');
  const superAdmin = await prisma.$queryRaw`
    SELECT u."loginId", r.code as role_code
    FROM "User" u
    JOIN "UserRole" ur ON ur."userId" = u.id
    JOIN "Role" r ON r.id = ur."roleId"
    WHERE u."loginId" = 'superadmin';
  `;
  console.log(superAdmin);
  console.log('SUPER_ADMIN 역할 존재:', superAdmin.some((r) => r.role_code === 'SUPER_ADMIN') ? '⭕' : '❌');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
