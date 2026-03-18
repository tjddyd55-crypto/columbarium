-- AlterTable: username → loginId (기존 데이터 보존)
-- 1) loginId 컬럼 추가 (nullable)
ALTER TABLE "User" ADD COLUMN "loginId" TEXT;

-- 2) 기존 username 값을 loginId로 복사
UPDATE "User" SET "loginId" = "username";

-- 3) NOT NULL 및 UNIQUE 제약 적용
ALTER TABLE "User" ALTER COLUMN "loginId" SET NOT NULL;
CREATE UNIQUE INDEX "User_loginId_key" ON "User"("loginId");

-- 4) username 컬럼 제거
ALTER TABLE "User" DROP COLUMN "username";
