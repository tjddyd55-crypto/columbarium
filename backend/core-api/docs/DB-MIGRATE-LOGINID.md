# loginId 마이그레이션 적용 및 로그인 테스트 가이드

## [1] DATABASE_URL 확인

- **위치**: `backend/core-api/.env` 또는 Railway Variables
- **필수 변수**: `DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
- **확인 방법** (비밀번호 제외):
  - 로컬: `.env` 파일에 위 형식으로 설정 후 아래 스크립트 실행 시 "DB host", "DB name" 출력됨
  - Railway: 해당 서비스 → Variables → `DATABASE_URL` 확인

**출력 예시** (스크립트 실행 시):
```
DB host: your-db-host.railway.app
DB name: railway
```

---

## [2] Prisma 마이그레이션 적용

### 방법 A: 일괄 스크립트 (권장)

`.env`를 만든 뒤:

```bash
cd backend/core-api
node prisma/run-migrate-verify.mjs
```

이 스크립트는 순서대로:
1. `.env` 로드 및 DATABASE_URL host/DB name 출력
2. `npx prisma migrate deploy` 실행
3. `node prisma/verify-db.mjs` 로 컬럼/데이터 검증
4. `npx prisma db seed` 실행
5. superadmin 재검증

### 방법 B: 수동 단계별

```bash
cd backend/core-api
npx prisma migrate deploy
```

**기대 출력**: `Applied migration: 20250317120000_add_loginid` (또는 이미 적용됨 시 "No pending migrations")

---

## [3] DB 구조 검증

수동으로 SQL 실행 시:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'User'
ORDER BY ordinal_position;
```

**확인**:
- `loginId` 존재 ⭕
- `username` 존재 ❌ (제거된 상태가 정상)

또는 스크립트로:

```bash
cd backend/core-api
node prisma/verify-db.mjs
```

---

## [4] 기존 데이터 확인

```sql
SELECT id, "loginId"
FROM "User"
LIMIT 10;
```

마이그레이션에서 `username` → `loginId` 복사가 되어 있으면 값이 채워져 있음.

---

## [5] seed 실행 (관리자 생성)

```bash
cd backend/core-api
npx prisma db seed
```

**기대**: `Seed 완료. 수퍼관리자 계정: superadmin`

---

## [6] 관리자 계정 확인

```sql
SELECT id, "loginId"
FROM "User"
WHERE "loginId" = 'superadmin';
```

---

## [7] 관리자 권한 확인

```sql
SELECT u."loginId", r.code
FROM "User" u
JOIN "UserRole" ur ON ur."userId" = u.id
JOIN "Role" r ON r.id = ur."roleId"
WHERE u."loginId" = 'superadmin';
```

**확인**: `SUPER_ADMIN` 행 존재 ⭕

---

## [8] 서버 재시작

- 로컬: 기존 API 서버 종료 후 `npm run start:dev` 재실행
- Railway: 재배포 또는 서비스 재시작

---

## [9] 로그인 테스트

| 항목 | 값 |
|------|-----|
| 아이디 | `superadmin` |
| 비밀번호 | `SuperAdmin1!` |

**테스트 위치**:
- admin-ui (Vite)
- admin-web (Next.js)
- user-ui (관리자 로그인 경로)

---

## [10] 최종 결과 체크리스트

1. **migration 적용 성공 여부**: `prisma migrate deploy` 성공 또는 "No pending migrations"
2. **DB 컬럼 구조**: `loginId` ⭕ / `username` ❌
3. **superadmin 생성 여부**: `SELECT ... WHERE "loginId" = 'superadmin'` 1건
4. **로그인 성공 여부**: 세 클라이언트에서 superadmin / SuperAdmin1! 로그인 성공

---

## 주의사항

- **`db push` 사용 금지** (이미 migration 존재)
- **schema 수정 금지** (이 단계에서는)
- **강제 테이블 삭제 금지**

## 트러블슈팅

- **DATABASE_URL not found**: `backend/core-api/.env`에 `DATABASE_URL` 추가 후 재실행
- **Migration already applied**: 정상. seed만 실행하면 됨.
- **Seed 실패 (unique constraint)**: superadmin이 이미 있으면 upsert로 비밀번호만 갱신됨. 에러가 나면 기존 User 테이블/Role 확인.
