# 서버 구조 (단일 백엔드 원칙)

## 목표

- **백엔드**: 1개만 유지 (NestJS core-api)
- **DB**: 1개만 유지 (Postgres)
- **웹(UI) 서버**: 상태 없음(stateless), API 로직 없음. NestJS만 호출.

---

## 최종 구조

| 구성요소 | 역할 | 포트(로컬) | 비고 |
|----------|------|-------------|------|
| **postgres** | DB | 5432 | 단일 DB |
| **core-api** | NestJS API (유일한 백엔드) | **4000** | 로그인/회원가입/시설/대기열/계약 등 모든 API |
| **web** | 프론트 정적 서빙 (user-ui 빌드) | **3000** | UI 전용, API 호출은 fetch로 core-api로만 |

---

## API 연결 규칙

- **모든 API는 NestJS(core-api)에서만 처리**
- admin-ui, user-ui, mobile은 **API 로직 없이** `fetch`/`axios`로 **NestJS 주소만** 호출

### 환경 변수 (프론트)

- **BASE_URL = VITE_API_BASE_URL** (모든 프론트 통일)
- 예: `POST {BASE_URL}/api/auth/login`, `GET {BASE_URL}/api/facilities`
- **절대 금지**: localhost 직접 호출, web 서버 API 사용

| 앱 | 변수명 | 로컬(개발) | 배포(프로덕션) |
|----|--------|------------|----------------|
| user-ui | `VITE_API_BASE_URL` | 비움(프록시) 또는 `http://localhost:4000` | `https://<core-api-url>` |
| admin-ui | `VITE_API_BASE_URL` | `http://localhost:4000` | `https://<core-api-url>` |

- **로컬**: Vite proxy로 `/api` 등 → `http://localhost:4000` 전달 가능
- **배포**: `VITE_API_BASE_URL`에 core-api URL 필수 (예: `http://columbarium-api:4000`)

### 엔드포인트 예시

- 로그인: `POST {BASE_URL}/api/auth/login`
- 회원가입: `POST {BASE_URL}/api/auth/register` (또는 `/api/auth/signup`)
- 현재 사용자: `GET {BASE_URL}/api/auth/me`
- 시설 목록: `GET {BASE_URL}/api/facilities`
- 기타: NestJS `backend/core-api` 라우트와 동일

---

## 인증

- 로그인/회원가입/토큰 처리 **전부 NestJS**에서 수행
- JWT 기반 인증 단일화 (core-api `AuthModule`)
- **관리자 최초 로그인**: DB에 시드가 적용되어 있어야 함. `backend/core-api`에서 `npx prisma db seed` 실행 시 생성되는 수퍼관리자 계정 — 아이디 `superadmin`, 비밀번호 `SuperAdmin1!` (운영에서는 배포 후 비밀번호 변경 권장)

---

## 웹 서버 (columbarium-web) 역할 제한

- **API 로직 제거**: 서버 사이드 API 라우트 없음
- **역할**: 정적 파일(HTML/JS/CSS) 서빙만. `serve dist` 또는 동등한 stateless 서버
- API 호출은 클라이언트에서 `VITE_API_BASE_URL` + 경로로 NestJS만 호출

### columbarium-web 배포 시 필수 (404/401 방지)

1. **SPA fallback**: `/`, `/login` 등 모든 경로에서 `index.html`을 내려줘야 함.  
   - 루트 `Dockerfile.web` 사용 시: `serve dist -s` 로 서빙 (이미 반영됨).
2. **API 주소 주입**: 빌드 시 `VITE_API_BASE_URL`을 core-api 주소로 설정해야 함.  
   - Railway: 서비스 Variables에 `VITE_API_BASE_URL=https://columbarium-api-production.up.railway.app` (실제 API URL로 교체) 추가 후, **빌드 시점**에 사용되도록 설정.  
   - Docker: `docker build --build-arg VITE_API_BASE_URL=https://... -f Dockerfile.web .`
3. **웹 전용 이미지**: columbarium-web 서비스는 **Dockerfile.web** 기준으로 빌드해야 함. API용 루트 `Dockerfile`과 혼동 금지.

---

## Express (legacy)

- **legacy/express-api**는 과거 API 서버. **사용 중단**
- 신규/운영 API는 반드시 NestJS(core-api)만 사용

---

## DB 규칙 (작업 8)

- **Prisma만 사용.** schema.sql 사용 금지.
- **DB 접근은 core-api만 가능.** web / admin-ui / mobile에서 DB 직접 접근 금지.

---

## 환경 변수 (작업 7)

| 구분 | 변수 | 설명 |
|------|------|------|
| 프론트 (web/admin/mobile) | `VITE_API_BASE_URL` | core-api 주소 (예: `http://columbarium-api:4000`) |
| 백엔드 | `DATABASE_URL` | Postgres 연결 문자열 |
| 백엔드 | `JWT_SECRET` | JWT 서명용 시크릿 |

---

## 정상화 테스트 기준 (작업 9)

다음이 모두 성공해야 한다.

1. 관리자 로그인 → 성공
2. 유저 로그인 → 성공
3. 시설 조회 → 성공
4. 데이터 등록/수정 → 성공

**실패 기준**: UI 깨짐, API 에러, 로그인 유지 안 됨.

---

## 로컬 실행 순서

1. Postgres 기동 (또는 Docker/로컬 설치)
2. `cd backend/core-api && npm install && npx prisma migrate dev && npm run start:dev` → core-api :4000
3. `npm run dev` (또는 `cd apps/user-ui && npm run dev`) → 웹 :3000, 프록시로 /api → :4000
