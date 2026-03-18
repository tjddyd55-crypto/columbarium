# 백엔드 모듈 구조

## 1. 도메인별 모듈

```
src/
├── app.module.ts
├── common/                    # 공통 가드, 필터, 데코레이터, 유틸
│   ├── guards/
│   │   ├── roles.guard.ts
│   │   └── jwt-auth.guard.ts
│   ├── decorators/
│   ├── filters/
│   └── interfaces/
├── config/                     # 설정 (DB, env)
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   └── dto/
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── entities/
│   └── dto/
├── operators/
├── facilities/
│   ├── facilities.module.ts
│   ├── facilities.controller.ts
│   ├── facilities.service.ts
│   ├── entities/ (facility, building, floor, section, layout)
│   └── dto/
├── units/                      # memorial_units
├── queue/
│   ├── queue.module.ts
│   ├── queue.service.ts
│   ├── queue.controller.ts
│   └── queue-worker.service.ts # 만료/승격/알림 트리거
├── contracts/
├── resale/
├── referrals/
├── notifications/
│   ├── notifications.module.ts
│   ├── notifications.service.ts  # 추상 채널 (푸시/SMS/이메일)
│   └── adapters/
├── payments/                   # 결제 추상화, mock 구현
└── admin/                      # 슈퍼관리자 전용 컨트롤러/서비스
```

## 2. 레이어 원칙

- **컨트롤러**: 요청/응답, 유효성 검사, 권한 위임. 비즈니스 로직 없음.
- **서비스**: 비즈니스 로직, 트랜잭션 경계.
- **리포지토리**: DB 접근 (TypeORM/Prisma 등).

## 3. 트랜잭션 처리 구간

- 대기열 참여 (queue_position 부여, unit 상태 등)
- ACTIVE → EXPIRED 전환 + 다음 순번 ACTIVE 승격
- 계약 생성 (contract, payment_record, queue COMPLETED, unit CONTRACTED)
- 재판매 완료 (기존 계약 TRANSFERRED, 신규 계약 생성, resale_listings SOLD)

## 4. 권한 가드

- `@Roles('USER', 'SALES_MANAGER')` 등으로 컨트롤러/핸들러 단위 적용.
- OPERATOR_ADMIN/SUPER_ADMIN은 리소스의 operator_id가 본인 소속과 일치하는지 서비스에서 검사.

---

*문서 버전: 1.0*
