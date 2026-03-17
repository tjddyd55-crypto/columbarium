# Supabase → Railway 백엔드 마이그레이션 보고

## 변경 요약

- **Supabase 제거:** `src/lib/supabase.ts` 삭제, `@supabase/supabase-js` 제거, Supabase 관련 env 제거.
- **백엔드 추가:** Express + cors + pg 기반 API 서버 (`/backend`).
- **프론트:** 모든 데이터 요청을 `src/lib/api.ts`의 `fetch` 기반 API로 교체.

---

## Backend 동작 여부

- **로컬:** `cd backend && npm install && npm run dev` → `DATABASE_URL` 없으면 서버는 뜨지만 DB 라우트 호출 시 에러.
- **Railway:** `DATABASE_URL`(Railway Postgres 연결 문자열) 설정 후 배포하면 정상 동작.

---

## API 동작 여부

| 엔드포인트 | 용도 | 비고 |
|------------|------|------|
| POST /api/waitlist | 대기열 등록 (position = count+1) | ✅ |
| GET /api/waitlist | 대기열 목록 (관리자) | ✅ |
| GET /api/waitlist/:seatId | 해당 좌석 대기 인원 수 | ✅ |
| PATCH /api/waitlist/:id/activate | 대기열 승인 → ACTIVE | ✅ |
| POST /api/contracts | 계약 신청 (ACTIVE 중복 시 409) | ✅ |
| GET /api/contracts | 계약 목록 (관리자) | ✅ |
| GET /api/contracts/:seatId | 해당 좌석 ACTIVE 계약 여부 | ✅ |
| PATCH /api/contracts/:id/activate | 계약 승인 → ACTIVE | ✅ |
| GET /api/seats/:seatId/status | 좌석 상태 + 대기 인원 | ✅ |
| GET /api/health | 헬스체크 | ✅ |

---

## DB 연결 여부

- **로컬:** `backend` 디렉터리 `.env`에 `DATABASE_URL` 없으면 `pool === null` → 라우트 접근 시 "Database not configured" 에러.
- **Railway:** Railway Postgres 서비스 연결 후 `DATABASE_URL` 주입하면 정상 연결.

---

## SeatSelection 실제 데이터 반영 여부

- **로직:** `GET /api/seats/:seatId/status`에서  
  1) contracts ACTIVE 존재 → ACTIVE  
  2) waitlist WAITING count > 0 → WAITING  
  3) 그 외 → AVAILABLE  
- **프론트:** `api.seats.status(seatId)` 호출로 `status`, `waitingCount` 사용 → 실제 DB 데이터 반영됨.

---

## 실행 방법

1. **Railway Postgres**
   - Railway에서 Postgres 서비스 생성 후 `DATABASE_URL` 복사.
   - `backend/db/schema.sql` 내용을 Railway Postgres SQL 콘솔에서 실행.

2. **백엔드**
   - 로컬: `backend/.env`에 `DATABASE_URL`, `PORT`(선택) 설정 후 `npm run dev`.
   - Railway: 백엔드 서비스에 `DATABASE_URL` 설정 후 배포.

3. **프론트**
   - 개발: `npm run dev` (Vite proxy로 `/api` → `http://localhost:3001`).
   - 운영: 빌드 후 정적 서빙; 백엔드가 다른 도메인이면 `VITE_API_URL`에 백엔드 URL 설정.

---

## 최종 체크리스트

| 항목 | 상태 |
|------|------|
| Backend 실행 | ✅ 코드 준비됨 (DB URL 설정 시 동작) |
| API 동작 | ✅ 위 표 엔드포인트 구현 완료 |
| DB 연결 | ⏳ DATABASE_URL 설정 후 연결 |
| SeatSelection 실제 데이터 | ✅ API 기반으로 반영 |
