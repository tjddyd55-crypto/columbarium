/**
 * .env 로드 후 migrate deploy → 검증 → seed 순서 실행
 * 사용: node prisma/run-migrate-verify.mjs
 * (backend/core-api 폴더에서 실행하거나, 프로젝트 루트에서 node backend/core-api/prisma/run-migrate-verify.mjs)
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env');

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('.env 파일이 없습니다:', envPath);
    console.error('backend/core-api/.env 에 DATABASE_URL 등을 설정한 뒤 다시 실행하세요.');
    process.exit(1);
  }
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      process.env[key] = value.slice(1, -1).replace(/\\"/g, '"');
    } else if (value.startsWith("'") && value.endsWith("'")) {
      process.env[key] = value.slice(1, -1).replace(/\\'/g, "'");
    } else {
      process.env[key] = value;
    }
  }
}

function showDbInfo() {
  const u = process.env.DATABASE_URL;
  if (!u) {
    console.log('DATABASE_URL: (미설정)');
    return;
  }
  try {
    const url = new URL(u);
    console.log('DB host:', url.hostname);
    const db = url.pathname.slice(1).split('?')[0];
    console.log('DB name:', db || '(없음)');
  } catch (e) {
    console.log('DATABASE_URL: (파싱 실패)');
  }
}

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, stdio: 'inherit', ...opts });
}

console.log('=== [1] .env 로드 및 DATABASE_URL 확인 ===');
loadEnv();
showDbInfo();

console.log('\n=== [2] prisma migrate deploy ===');
try {
  run('npx prisma migrate deploy');
} catch (e) {
  console.error('마이그레이션 실패. 위 에러를 확인하세요.');
  process.exit(1);
}

console.log('\n=== [3] DB 검증 (verify-db.mjs) ===');
try {
  run('node prisma/verify-db.mjs');
} catch (e) {
  console.error('검증 스크립트 실패.');
  process.exit(1);
}

console.log('\n=== [4] prisma db seed ===');
try {
  run('npx prisma db seed');
} catch (e) {
  console.error('시드 실패.');
  process.exit(1);
}

console.log('\n=== [5] superadmin 재검증 ===');
run('node prisma/verify-db.mjs');

console.log('\n=== 완료 ===');
