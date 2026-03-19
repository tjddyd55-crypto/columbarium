# 시설/좌석 정책 기반 흐름

## 개요

- **관리자**: 사업자(Company) → 시설(Site) → 구역(Section) → 좌석(Seat) 생성, 가격/차단/정책 설정
- **유저**: 시설 조회 → 좌석 상태 확인 → 즉시 구매(GREEN) 또는 대기 등록(YELLOW)
- **좌석 상태**: DB에 저장하지 않고 `getSeatState(seat, reservations, policy)` 로 계산

## DB 모델 (Prisma)

- `Company` → `Site`(시설, API에서는 facilityId로 노출)
- `Section`(구역): facilityId, name, rows, cols → 생성 시 `rows * cols` 개의 `Seat` 자동 생성
- `Seat`: sectionId, row, col, price, isBlocked
- `Reservation`: userId, seatId, status (CONFIRMED / WAITING / CANCELLED)
- `SeatPolicy`: facilityId, maxWaiting, maxYears (시설당 1개, upsert)

## 마이그레이션

```bash
cd backend/core-api
npx prisma migrate deploy
```

마이그레이션 파일: `prisma/migrations/20250317140000_add_facility_seat_policy/migration.sql`

## 관리자 API (SUPER_ADMIN, JWT)

| Method | Path | Body | 설명 |
|--------|------|------|------|
| POST | /admin/company | `{ "name": "서울 부동산" }` | 사업자 등록 |
| POST | /admin/facility | `{ "name", "address", "companyId" }` | 시설 등록 |
| POST | /admin/section | `{ "facilityId", "name", "rows", "cols" }` | 구역 생성 + 좌석 rows×cols 개 자동 생성 |
| PATCH | /admin/seat/:id | `{ "price": 30000000 }` | 좌석 가격 설정 |
| PATCH | /admin/seat/:id/block | `{ "isBlocked": true }` | 좌석 차단 |
| POST | /admin/policy | `{ "facilityId", "maxWaiting", "maxYears" }` | 정책 설정(upsert) |

## 유저 API

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | /facilities | 없음 | 시설 목록 |
| GET | /facilities/:id | 없음 | 시설 상세 |
| GET | /facilities/:id/seats | 없음 | 좌석 목록 (status 계산값 포함) |
| POST | /seats/:id/reserve | JWT | 즉시 구매 (status === GREEN 일 때만) |
| POST | /seats/:id/wait | JWT | 대기 등록 (status === YELLOW 일 때만) |

### GET /facilities/:id/seats 응답 예

```json
[
  { "id": 1, "row": 1, "col": 1, "price": 25000000, "status": "GREEN", "waitingCount": 0 },
  { "id": 2, "row": 1, "col": 2, "price": 25000000, "status": "YELLOW", "waitingCount": 1 }
]
```

## 좌석 상태 계산 규칙 (정책 기반)

1. `seat.isBlocked === true` → **RED**
2. 정책 `maxWaiting` 있고, 해당 좌석 WAITING 수 ≥ maxWaiting → **RED**
3. 해당 좌석에 CONFIRMED 예약 있음 → **YELLOW**
4. 그 외 → **GREEN**

## 프론트 색상 매핑

- **GREEN** → 초록 (즉시 구매)
- **YELLOW** → 노랑 (대기 가능)
- **RED** → 빨강 (불가)

## 테스트 체크리스트

1. Section 생성 시 좌석 개수 = rows × cols 확인
2. superadmin JWT로 관리자 API 호출 가능 확인
3. 시설 생성 후 GET /facilities, GET /facilities/:id 로 유저 화면에서 조회 확인
4. GET /facilities/:id/seats 로 좌석 상태(GREEN/YELLOW/RED) 정상 표시 확인
5. POST /seats/:id/reserve (GREEN), POST /seats/:id/wait (YELLOW) 정상 동작 확인

## 금지 사항

- Seat.status 같은 컬럼 추가 금지
- 상태를 DB에 저장하지 말 것
- 항상 정책 기반 계산 유지
