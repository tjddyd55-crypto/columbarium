# 예약·대기 순번·결제 상태 분리 흐름

## 1. Reservation 구조

| 필드       | 타입             | 설명 |
|------------|------------------|------|
| queueOrder | Int?             | WAITING일 때만 사용, 동일 seatId 내 순번 (1, 2, 3...) |
| price      | Int (default 0)  | 예약/확정 시점 금액 |
| status     | ReservationStatus | RESERVED / CONFIRMED / WAITING / CANCELLED |

**ReservationStatus**

- **RESERVED**: 예약됨(미결제). 즉시 예약 시 생성.
- **CONFIRMED**: 결제 완료 확정.
- **WAITING**: 대기 순번. queueOrder로 순서 관리.
- **CANCELLED**: 취소됨.

---

## 2. WAITING 생성 로직

- 동일 `seatId` 기준 **WAITING** 중 **max(queueOrder)** 조회.
- **queueOrder = max + 1** 로 생성 (트랜잭션 + seat row lock).

---

## 3. reserve 로직 (즉시 예약)

- **GREEN** 상태일 때만:
  - **RESERVED** 상태로 생성.
  - **price** = 해당 좌석의 `seat.price` 저장.
- 트랜잭션 + seat row lock 적용.

---

## 4. 결제 완료 API

**POST /payments/confirm**

- Body: `{ "reservationId": "1" }`
- 동작: 해당 예약이 **RESERVED**이면 **CONFIRMED**로 변경.
- 본인 예약만 결제 가능 (userId 검증).

---

## 5. 취소 시 자동 승격

**PATCH /reservations/:id/cancel**

- **CONFIRMED** 취소 시:
  1. 해당 좌석 WAITING 중 **queueOrder 1** (최소) 조회.
  2. 해당 예약 → **CONFIRMED**로 변경, **price** = seat.price, **queueOrder** = null.
  3. 나머지 WAITING의 **queueOrder** 각각 -1.
- 트랜잭션 + seat row lock 적용.
- 서버 로그: `[CANCEL_PROMOTION] { cancelledReservationId, promotedReservationId, seatId }`

---

## 6. 동시성 처리

- **reserve**, **wait**, **cancel** 모두 **트랜잭션** 내 처리.
- 각 흐름에서 해당 **Seat** 행에 **FOR UPDATE** 락 적용 후 비즈니스 로직 수행.

---

## 7. 출력·검증

| 항목 | 확인 방법 |
|------|-----------|
| queueOrder 정상 증가 | 동일 좌석에 WAITING 여러 건 생성 후 DB 또는 API로 queueOrder 1, 2, 3... 확인 |
| 취소 시 승격 동작 | CONFIRMED 1건 취소 → 서버 로그 `[CANCEL_PROMOTION]` 확인, DB에서 1번 대기 → CONFIRMED 전환 확인 |
| RESERVED → CONFIRMED | reserve → POST /payments/confirm → 예약 상태 CONFIRMED 확인 |
