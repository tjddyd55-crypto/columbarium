# Columbarium Backend (NestJS)

## 설정

1. `.env.example`을 복사하여 `.env` 생성 후 값 수정
2. PostgreSQL 생성: `createdb columbarium` (또는 DB_NAME에 맞게)
3. `npm install`
4. `npm run start:dev`

## 구현 단계 (명세 20항)

- 1단계: 인증/회원 (Auth, Users) — 진행됨
- 2단계: 사업자/시설/배치/칸 — Operators, Facilities, Units
- 3단계: 일반 사용자 앱 UX — API 연동
- 4단계: 대기열 엔진 — Queue
- 5단계: 계약/결제 mock — Contracts, Payments
- 6단계: 재판매 — Resale
- 7단계: 추천/영업 — Referrals
- 8단계: 관리자 대시보드 — Admin
- 9단계: 알림 — Notifications

## 모듈 구조

`docs/08-backend-modules.md` 참고.
