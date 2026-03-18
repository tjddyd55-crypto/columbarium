# Railway PostgreSQL → backend/core-api 연결

## [1] Railway DB 정보 확인

1. [Railway](https://railway.app) 로그인 → 프로젝트 선택
2. **PostgreSQL** 서비스 클릭
3. **Connect** 탭에서 **Public network** 연결 문자열 확인 (로컬 PC에서 필수)
   - **Variables** 탭의 `DATABASE_URL`은 호스트가 `postgres.railway.internal` → **Railway 내부 전용**, 로컬에서는 접속 불가.
   - **로컬에서 migrate/seed 하려면** 반드시 **Connect** 탭의 **Public** (또는 "Postgres connection URL" 외부용) 전체 URL을 복사해 `.env`에 넣으세요.
   - Public URL 형식 예: `postgresql://postgres:PASSWORD@xxxx.proxy.rlwy.net:PORT/railway`

**형식 예:**
```
postgresql://postgres:PASSWORD@xxxx.proxy.rlwy.net:PORT/railway?schema=public
```

---

## [2] backend/core-api/.env 수정

이미 `backend/core-api/.env` 파일이 생성되어 있습니다.

**할 일:** `DATABASE_URL` 한 줄만 Railway에서 복사한 값으로 **교체**하세요.

```env
# 이 줄을 Railway Variables의 DATABASE_URL 값으로 교체
DATABASE_URL="postgresql://postgres:비밀번호@호스트:포트/railway?schema=public"
```

- 반드시 **큰따옴표**로 감싸세요.
- `?schema=public` 이 없으면 끝에 `?schema=public` 를 붙이세요.

저장 후 아래 명령을 **같은 터미널에서** 다시 실행하세요.

---

## [3] Prisma 연결 테스트

```bash
cd backend/core-api
npx prisma validate
```

**기대 출력:** `The schema at prisma\schema.prisma is valid`

---

## [4] 마이그레이션 실행

```bash
npx prisma migrate deploy
```

**기대:** `Applied migration(s): 20250317120000_add_loginid` 또는 "No pending migrations".

⚠️ **`db push` 사용 금지.** 이미 migration 파일이 있습니다.

---

## [5] DB 생성 확인

```bash
node prisma/verify-db.mjs
```

또는 SQL (Railway Postgres 쿼리 탭 등):

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

---

## [6] seed 실행

```bash
npx prisma db seed
```

**기대:** `Seed 완료. 수퍼관리자 계정: superadmin`

---

## [7] 관리자 계정 확인

```sql
SELECT * FROM "User" WHERE "loginId" = 'superadmin';
```

1건 조회되면 정상.

---

## [8] 서버 실행 후 로그인 테스트

```bash
npm run start:dev
```

- **아이디:** `superadmin`
- **비밀번호:** `SuperAdmin1!`
- admin-ui / admin-web / user-ui 에서 로그인 테스트

---

## [9] 최종 체크리스트

| 항목 | 확인 |
|------|------|
| 1. DB 연결 성공 여부 | .env에 Railway DATABASE_URL 설정 후 migrate deploy 성공 |
| 2. migration 적용 여부 | `prisma migrate deploy` 성공 |
| 3. 테이블 생성 여부 | `verify-db.mjs` 또는 information_schema 조회 |
| 4. superadmin 생성 여부 | `SELECT * FROM "User" WHERE "loginId" = 'superadmin'` 1건 |
| 5. 로그인 성공 여부 | superadmin / SuperAdmin1! 로그인 성공 |

---

## 주의

- **DATABASE_URL 없거나 잘못되면** migrate/seed 불가. 반드시 Railway에서 복사한 값으로 설정.
- **db push 사용 금지.** 기존 migration으로만 적용.
