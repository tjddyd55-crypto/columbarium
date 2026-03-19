-- AlterTable
ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT true;

-- 기존 행: 마이그레이션 시점 이전 계정은 이미 본인이 설정한 비밀번호로 간주 (강제 변경 없음)
UPDATE "User" SET "mustChangePassword" = false;
