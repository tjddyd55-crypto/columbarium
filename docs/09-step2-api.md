# STEP 2 — API + 상태머신 + 핵심 비즈니스 로직

## 1. 구현 요약

- **Queue 상태 머신**: WAITING → ACTIVE → COMPLETED / EXPIRED, WAITING → CANCELLED
- **Unit 상태**: 직접 변경 없이 Queue/Contract 존재 여부로 동기화 (syncUnitStatus)
- **트랜잭션**: queue join, ACTIVE 전환, ACTIVE 만료·승격, contract 생성, resale 구매
- **응답 포맷**: `{ success, data, error }` 통일

## 2. API 목록

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /queue/join | 대기열 참여 (body: unitId) |
| GET | /queue/my | 내 대기열 목록 |
| GET | /queue/:id | 대기열 상세 |
| POST | /queue/:id/cancel | 대기 취소 |
| POST | /queue/worker/activate/:unitId | [Worker] 해당 unit 다음 순번 ACTIVE (OPERATOR_ADMIN+) |
| POST | /queue/worker/expire | [Worker] 만료된 ACTIVE 처리 및 다음 승격 |
| POST | /contracts | 계약 생성 (body: unitId, queueEntryId) |
| GET | /contracts/my | 내 계약 목록 |
| GET | /contracts/:id | 계약 상세 |
| POST | /resale | 재판매 신청 (body: contractId, price) |
| GET | /resale/my | 내 재판매 목록 |
| GET | /resale/listings | 재판매 목록 (LISTED) |
| POST | /resale/:id/buy | 재판매 구매 |
| POST | /resale/:id/approve | 재판매 승인 (body: operatorId) |
| POST | /resale/:id/reject | 재판매 반려 (body: operatorId) |
| GET | /facilities | 시설 목록 |
| GET | /facilities/:id | 시설 상세 |
| GET | /facilities/:id/units | 시설별 칸 목록 |

## 3. 모듈 구조

- **common**: errors (BusinessError, ErrorCode), interceptors (ResponseInterceptor), filters (AllExceptionsFilter)
- **units**: UnitService (getUnitById, syncUnitStatus)
- **notifications**: NotificationService (create, notifyQueueActive, notifyContractComplete, notifyResaleApproved/Rejected)
- **queue**: QueueService, QueueController, QueueWorkerController
- **contracts**: ContractService, ContractsController
- **resale**: ResaleService, ResaleController
- **facilities**: FacilityService, FacilityController

## 4. 에러 코드

`backend/src/common/errors/README.md` 참고.

## 5. Worker 연동

- ACTIVE 진입: `POST /queue/worker/activate/:unitId` (권한: OPERATOR_ADMIN, SUPER_ADMIN)
- 만료 처리: `POST /queue/worker/expire`
- 실제 운영 시 CRON 또는 별도 스케줄러에서 동일 로직 호출 권장.

## 6. Notification 트리거

- Queue ACTIVE 진입 시: notifyQueueActive
- 계약 완료 시: notifyContractComplete
- 재판매 승인/반려 시: notifyResaleApproved, notifyResaleRejected
- 7일/1일 전 알림: NotificationService에 메서드만 구현, Worker에서 호출 예정
