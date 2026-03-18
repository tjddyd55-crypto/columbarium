# columbarium 프로젝트 폴더 구조 (GPT/AI 파악용)

## 1. 한 줄 요약

- **모노레포**: 백엔드 1개(NestJS) + 웹/관리자/모바일 앱이 같은 저장소에 있음.
- **백엔드**: `backend/core-api`만 사용. 포트 4000.
- **웹**: UI만 담당(stateless). API는 `VITE_API_BASE_URL`로 core-api만 호출.

---

## 2. 루트 구조

```
columbarium/
├── package.json          # 루트: 웹 빌드(vite), serve dist → 포트 3000
├── vite.config.ts        # root가 apps/user-ui, 빌드 결과는 dist/
├── .env.example          # VITE_API_BASE_URL (웹 빌드용)
├── docs/                 # 설계/아키텍처 문서
├── backend/              # 백엔드 (NestJS만 사용)
│   └── core-api/        # 유일한 API 서버 (NestJS, 포트 4000)
├── apps/
│   ├── user-ui/         # 일반 사용자 웹 (배포 시 columbarium-web)
│   ├── admin-ui/        # 관리자 웹 UI (Vite+React)
│   ├── admin-web/       # 관리자 웹 (Next.js)
│   └── mobile/          # React Native (Expo)
├── legacy/
│   └── express-api/     # 구 Express API — 사용 중단, 참고용
├── scripts/              # 유틸 스크립트
├── src/                  # (레거시/공용 가능성, 루트 빌드는 apps/user-ui 기준)
└── dist/                 # 웹 빌드 결과 (user-ui)
```

---

## 3. 역할별 폴더 설명

### backend/core-api (유일 백엔드)

- **역할**: 모든 API·인증 처리. DB는 Postgres 1개만 사용.
- **진입점**: `src/main.ts` (포트 기본 4000)
- **주요 디렉터리**:
  - `src/legacy-api/` — 웹/앱이 호출하는 공개 API (`/api/auth/login`, `/api/facilities`, `/api/waitlist`, `/api/contracts` 등)
  - `src/auth/` — JWT 인증, 로그인/회원가입
  - `src/facilities/`, `src/contracts/`, `src/queue/` — 시설/계약/대기열 도메인
  - `src/admin/` — 관리자 전용 API
  - `prisma/` — 스키마, 마이그레이션, 시드

### apps/user-ui (일반 사용자 웹)

- **역할**: 납골당 이용자용 웹. **API 로직 없음**, fetch로 core-api만 호출.
- **배포**: 루트에서 `npm run build` → `dist/` (columbarium-web으로 서빙)
- **주요 경로**:
  - `src/app/` — 라우트(`routes.tsx`), 페이지, 레이아웃, `admin/`(관리자 로그인·대시보드)
  - `src/shared/api/` — `http.ts`, `service.ts`, `adminAuth.ts` (모두 `VITE_API_BASE_URL` + 경로로 core-api 호출)
  - `src/shared/auth/session.ts` — 클라이언트 토큰/세션 저장

### apps/admin-ui (관리자 웹 UI)

- **역할**: 관리자 화면. API는 `src/lib/api.ts`에서 `VITE_API_BASE_URL`로 core-api만 호출.
- **구성**: `src/app/` — 라우트, 페이지(대시보드/시설/계약/대기열 등), 레이아웃/컴포넌트

### apps/admin-web

- Next.js 기반 관리자 웹 (별도 앱).

### apps/mobile

- React Native(Expo). API 베이스 URL은 `src/app/utils/constants.ts` 등에서 설정.

### docs/

- `00-server-architecture.md` — 서버 구조, 포트, API 규칙, 환경 변수 (우선 참고).
- `01-architecture.md` ~ `10-step3-mobile.md` — 아키텍처, DB, 권한, IA, API 명세, 상태 머신 등.

### legacy/express-api

- **사용 중단**. API 추가/수정은 `backend/core-api`에서만 진행.

---

## 4. API 호출 규칙 (GPT가 코드 수정할 때 참고)

- **BASE_URL = VITE_API_BASE_URL** (모든 프론트 통일). 절대 localhost 직접 호출·web 서버 API 사용 금지.
- **프론트(user-ui, admin-ui)**: `src/shared/api`(user-ui), `src/lib/api.ts`(admin-ui)를 통해서만 호출. **fetch 직접 호출 금지.**
- **경로 예**: `POST {BASE}/api/auth/login`, `POST {BASE}/api/auth/register`, `GET {BASE}/api/auth/me`, `GET {BASE}/api/facilities`
- **백엔드**: 하나만 존재 → `backend/core-api`. Express는 사용하지 않음.

---

## 5. 자주 찾는 파일

| 목적 | 경로 |
|------|------|
| API 서버 진입점 | `backend/core-api/src/main.ts` |
| 로그인/회원가입 API | `backend/core-api/src/legacy-api/legacy-api.controller.ts` |
| 웹 라우팅 | `apps/user-ui/src/app/routes.tsx` |
| 웹 공통 API 호출 | `apps/user-ui/src/shared/api/http.ts`, `service.ts` |
| 관리자 로그인 API | `apps/user-ui/src/shared/api/adminAuth.ts` |
| 서버 구조/규칙 | `docs/00-server-architecture.md` |
