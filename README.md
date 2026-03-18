# 봉안당 분양/예약/재판매 플랫폼

한국 전용 멀티 사업자 봉안당 플랫폼 (모바일 앱 우선).

## 서버 구조 (단일 백엔드)

- **백엔드 1개**: NestJS `backend/core-api` (포트 4000) — 모든 API·인증 처리
- **DB 1개**: Postgres
- **웹**: UI 전용(stateless), API는 core-api만 호출

자세한 규칙과 환경 변수는 **[docs/00-server-architecture.md](docs/00-server-architecture.md)** 참고.

## 저장소 구조

- **docs/** — 서버 아키텍처, DB 스키마, IA, API 명세
- **backend/core-api/** — NestJS (유일한 백엔드 서버)
- **apps/admin-web/** — Next.js 관리자 웹
- **apps/admin-ui/** — Vite 관리자 UI
- **apps/user-ui/** — 일반 사용자 웹 UI (배포 시 columbarium-web)
- **apps/mobile/** — React Native 앱
- **legacy/express-api/** — 구 Express API (사용 중단, 참고용)

## 문서 (docs/)

| 문서 | 설명 |
|------|------|
| 01-architecture.md | 전체 시스템 아키텍처 |
| 02-db-schema.md | DB 스키마 초안 (ERD 수준) |
| 03-permission-policy.md | 권한 정책표 |
| 04-mobile-ia.md | 모바일 앱 IA 및 화면 구조 |
| 05-admin-ia.md | 관리자 웹 IA 및 화면 구조 |
| 06-api-spec.md | API 명세 초안 |
| 07-state-machines.md | 대기열/계약/재판매 상태 머신 |
| 08-backend-modules.md | 백엔드 모듈 구조 |

## 로컬 실행

1. **백엔드 (core-api, 포트 4000)**  
   `cd backend/core-api && npm install && npx prisma generate && npm run start:dev`
2. **웹 (user-ui, 포트 3000)**  
   루트에서 `npm run dev` (Vite가 `/api` 등을 localhost:4000으로 프록시)
3. **관리자 UI**  
   `cd apps/admin-ui && npm install && npm run dev` (프록시로 /api → 4000)
4. **관리자 웹**  
   `cd apps/admin-web && npm install && npm run dev`
5. **모바일**  
   `cd apps/mobile && npm install && npx expo start`

환경 변수: 웹/관리자 UI는 `VITE_API_BASE_URL`(배포 시 NestJS URL). 로컬은 비우면 프록시 사용. 자세한 내용은 docs/00-server-architecture.md 참고.

## 기술 스택

- Backend: NestJS, PostgreSQL
- Admin: Next.js
- Mobile: React Native (Expo)
- 지도: 네이버 지도
- 인증: JWT, 네이버/카카오 OAuth, 휴대폰 인증(어댑터)
