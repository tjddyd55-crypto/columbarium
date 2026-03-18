# 상태 머신 정리

## 1. 대기열(queue_entries) 상태

```
                    참여
    [대기열 참여] ──────────► WAITING
         │                        │
         │                        │ 순번 도달 (다음 ACTIVE 가능 시)
         │                        ▼
         │                    ACTIVE (activated_at, expires_at = +24h)
         │                        │
         │                        ├── 24h 내 계약 완료 ──► COMPLETED
         │                        │
         │                        └── 24h 경과 ──► EXPIRED
         │                                              │
         │                                              └── 다음 순번이 ACTIVE로 전환
         │
         └── 사용자 취소 ──► CANCELLED
```

### 상태 설명

| 상태 | 설명 |
|------|------|
| WAITING | 대기 중. queue_position에 따라 순번 보장. |
| ACTIVE | 구매 기회 부여. 24시간 내 계약 가능. 동일 unit에 ACTIVE 1건만. |
| EXPIRED | 24시간 내 미계약으로 기회 만료. 다음 순번 승격. |
| COMPLETED | 계약 완료로 대기열 이탈. |
| CANCELLED | 사용자 대기 취소. |

### Worker 처리

- **ACTIVE 만료**: `expires_at < NOW()` 인 ACTIVE → EXPIRED 처리 후, 해당 unit의 다음 WAITING 1건을 ACTIVE로 전환, `expires_at` 설정.
- **7일 전 알림**: ACTIVE 예정일이 7일 남은 WAITING 건에 대해 `notified_7d_at` 미설정 시 알림 발송 후 플래그 설정.
- **1일 전 알림**: 동일하게 1일 전 알림.
- **ACTIVE 즉시 알림**: WAITING → ACTIVE 전환 시점에 알림 발송, `notified_active_at` 설정.

---

## 2. 칸(memorial_units) 상태

```
AVAILABLE ──(대기열 참여)──► WAITING_QUEUE
     ▲                            │
     │                            │ 순번 도달
     │                            ▼
     │                        ACTIVE_OFFER ──(계약 완료)──► CONTRACTED
     │                            │
     │                            └──(24h 만료)──► WAITING_QUEUE (다음 순번 ACTIVE 시 ACTIVE_OFFER)
     │
     └──(재판매 완료 후 재분양 가능)── CONTRACTED ──(재판매 등록)──► RESALE_LISTED
                                              │
                                              └──(재판매 판매 완료)──► CONTRACTED (신규 소유자)
```

| 상태 | 설명 |
|------|------|
| AVAILABLE | 분양 가능, 대기열 없음. |
| WAITING_QUEUE | 대기열 존재. ACTIVE 없음. |
| ACTIVE_OFFER | 현재 1명이 ACTIVE 구매 기회 보유. |
| CONTRACTED | 계약 완료. 소유권 있음. |
| RESALE_LISTED | 재판매 등록됨. |
| BLOCKED | 관리자가 비활성(분양 중단 등). |

- unit 상태와 queue 상태는 **분리** 유지. unit은 집계/표시용, queue는 순번/만료 로직용.

---

## 3. 계약(contracts) 상태

```
[신규 분양]
  PENDING ──(결제/서명 완료)──► ACTIVE
     │
     └──(취소)──► CANCELLED

[재판매 시 기존 계약]
  ACTIVE ──(재판매 매도 완료)──► TRANSFERRED  (덮어쓰기 없음)

[기간 만료]
  ACTIVE ──(end_date 경과)──► EXPIRED
```

| 상태 | 설명 |
|------|------|
| PENDING | 계약 생성됨, 결제/서명 대기. |
| ACTIVE | 유효한 계약. 사용 기간 진행 중. |
| TRANSFERRED | 재판매로 권리 이전됨. 이력 보존. |
| CANCELLED | 계약 취소. |
| EXPIRED | 기간 만료. |

- **재판매 시**: 기존 계약을 수정하지 않고 `TRANSFERRED` 처리 후, 신규 구매자에 대해 `contract_type=RESALE` 인 새 계약 생성.

---

## 4. 재판매(resale_listings) 상태

```
REQUESTED ──(사업자 승인)──► APPROVED ──(노출 처리)──► LISTED
     │                            │
     │                            │ 구매자 계약 진행
     │                            ▼
     └──(반려)──► REJECTED     UNDER_CONTRACT ──(계약 완료)──► SOLD
                                                                  │
                     (매도자 취소)                                 │
     REQUESTED / APPROVED / LISTED ──► CANCELLED                  │
                                                                  └── 기존 계약 TRANSFERRED, 신규 계약 생성
```

| 상태 | 설명 |
|------|------|
| REQUESTED | 재판매 신청됨. 사업자 검토 대기. |
| APPROVED | 승인됨. 리스트 노출 가능. |
| LISTED | 재판매 목록에 노출 중. |
| UNDER_CONTRACT | 구매자와 계약 진행 중. |
| SOLD | 매도 완료. 권리 이전 완료. |
| REJECTED | 승인 반려. |
| CANCELLED | 매도자/관리자 취소. |

---

## 5. 결제(payment_records) 상태 — Mock

```
READY ──(PG 요청)──► PENDING ──(승인)──► PAID
   │                      │
   │                      └──(실패/취소)──► FAILED / CANCELLED
   │
   └──(취소)──► CANCELLED

PAID ──(환불)──► REFUNDED
```

- PG 미연동 시: `PENDING` → `PAID` 전환을 mock API 또는 관리자 동작으로 수행 가능하도록 설계.

---

*문서 버전: 1.0*
