# 납골당 분양/예약/재판매 플랫폼

한국 전용 멀티 사업자 납골당 플랫폼 (모바일 앱 우선).

## 저장소 구조

- **docs/** — 아키텍처, DB 스키마, IA, API 명세, 상태 머신
- **backend/** — NestJS API (공통 백엔드)
- **apps/admin-web/** — Next.js 관리자 웹 (업체/슈퍼관리자)
- **apps/admin-ui/** — Vite 관리자 UI
- **apps/user-ui/** — 일반 사용자 웹 UI
- **apps/mobile/** — React Native 앱 (일반 사용자/영업관리자)

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

- **백엔드**: `cd backend && npm install && npm run start:dev`
- **관리자 웹**: `cd apps/admin-web && npm install && npm run dev`
- **관리자 UI**: `cd apps/admin-ui && npm install && npm run dev`
- **사용자 UI**: `cd apps/user-ui && npm install && npm run dev`
- **모바일**: `cd apps/mobile && npm install && npx expo start`

환경 변수는 각 앱의 `.env.example` 참고.

## 기술 스택

- Backend: NestJS, PostgreSQL
- Admin: Next.js
- Mobile: React Native (Expo)
- 지도: 네이버 지도
- 인증: JWT, 네이버/카카오 OAuth, 휴대폰 인증(어댑터)
