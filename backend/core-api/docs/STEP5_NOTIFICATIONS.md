# STEP 5 알림 시스템 - 구현 요약

## 1. Prisma Schema 변경

- **Notification** 확장: `type`(NotificationType), `relatedTable`, `relatedId`, `metadata`(Json), `scheduledAt`, `sentAt`, `failedAt`, `retryCount`, `providerName`, `providerMessageId`, `errorCode`, `errorMessage`, `dedupeKey`(unique), `status`(NotificationStatus)
- **UserDevice** 신규: `userId`, `platform`(IOS/ANDROID), `pushToken`, `appVersion`, `deviceModel`, `isActive`, `lastSeenAt`, `@@unique([userId, pushToken])`
- **NotificationLog** 신규: `notificationId`, `attemptNo`, `channel`, `providerName`, `requestPayload`, `responsePayload`, `status`, `errorMessage`
- **Enum 추가**: `NotificationStatus`, `NotificationType`, `DevicePlatform`

마이그레이션:

```bash
npx prisma migrate dev --name step5_notifications
```

## 2. Notifications Module 구조

```
src/notifications/
├── notifications.module.ts
├── notifications.service.ts      # createNotification, createMultiChannelNotifications, markAsRead, getMyNotifications, getUnreadCount, findDispatchable, markSent, markFailed
├── notification-template.service.ts
├── notification-policy.service.ts
├── notification-dispatcher.service.ts  # dispatchPendingNotifications(), dispatchOne(id)
├── notification-scheduler.service.ts   # processQueueReminders (cron 09:00), processPendingNotifications (cron 1분)
├── notifications.controller.ts         # GET /notifications/me, unread-count, PATCH :id/read, read-all
├── admin-notifications.controller.ts   # GET /admin/notifications, GET /admin/notifications/failed, POST /admin/notifications/:id/retry
├── types/notification.types.ts
└── providers/
    ├── push/push.provider.interface.ts, fcm.push.provider.ts
    ├── sms/sms.provider.interface.ts, mock.sms.provider.ts
    └── email/email.provider.interface.ts, mock.email.provider.ts
```

## 3. Devices Module

- **DevicesService**: registerDevice(userId, { pushToken, platform, appVersion?, deviceModel? }), unregisterDevice(userId, pushToken), getMyDevices(userId)
- **API**: POST /devices/register, POST /devices/unregister, GET /devices/me

## 4. Provider 인터페이스

- **IPushProvider**: sendToUser(userId, payload), sendToTokens(tokens, payload) → PushSendResult
- **ISmsProvider**: send(phone, message) → SmsSendResult
- **IEmailProvider**: send(email, subject, body) → EmailSendResult

토큰 주입: `PUSH_PROVIDER`, `SMS_PROVIDER`, `EMAIL_PROVIDER` → FcmPushProvider, MockSmsProvider, MockEmailProvider

## 5. 스케줄러

- **NotificationSchedulerService** (매일 09:00): 7일 전/1일 전 리마인더 알림 생성, `notified7dAt`/`notified1dAt` 업데이트
- **NotificationSchedulerService** (1분마다): PENDING/SCHEDULED 알림 디스패치
- **QueueSchedulerService** (5분마다): unit별 ACTIVE 승격, ACTIVE 만료 처리 (QueueService 호출)

## 6. 이벤트 연결

- **QueueService.activateNextQueue / expireQueue**: ACTIVE 승격 직후 `createMultiChannelNotifications(QUEUE_ACTIVE_NOW)` 호출, `notifiedActiveAt` 설정
- **ContractService.createContract**: 계약 생성 직후 `createMultiChannelNotifications(CONTRACT_COMPLETED)`
- **ResaleService.approveResale / rejectResale**: 승인/반려 직후 `createMultiChannelNotifications(RESALE_APPROVED | RESALE_REJECTED)`
- **ResaleService.buyResale**: 재판매 구매 계약 생성 직후 `createMultiChannelNotifications(CONTRACT_COMPLETED)`

## 7. API 정리

| 용도 | Method | 경로 |
|------|--------|------|
| 사용자 | GET | /notifications/me |
| 사용자 | GET | /notifications/unread-count |
| 사용자 | PATCH | /notifications/:id/read |
| 사용자 | PATCH | /notifications/read-all |
| 사용자 | POST | /devices/register |
| 사용자 | POST | /devices/unregister |
| 사용자 | GET | /devices/me |
| 관리자 | GET | /admin/notifications |
| 관리자 | GET | /admin/notifications/failed |
| 관리자 | POST | /admin/notifications/:id/retry |

## 8. 테스트 시나리오

1. **디바이스 등록**: 로그인 후 POST /devices/register { pushToken, platform: "ANDROID" } → 200, id 반환
2. **인앱 알림 조회**: GET /notifications/me → items, nextCursor; GET /notifications/unread-count → { count }
3. **대기열 ACTIVE 알림**: Queue 스케줄러 또는 POST /queue/worker/activate/:unitId 호출 후 해당 유저의 GET /notifications/me 에 QUEUE_ACTIVE_NOW 타입 IN_APP 알림 생성 확인
4. **계약 완료 알림**: 계약 생성(또는 재판매 구매) 후 해당 유저 알림에 CONTRACT_COMPLETED 확인
5. **재판매 승인/반려 알림**: 관리자가 재판매 승인/반려 후 판매자 알림에 RESALE_APPROVED / RESALE_REJECTED 확인
6. **7일/1일 리마인더**: WAITING 대기열 데이터로 매일 09:00 크론 후 notified7dAt/notified1dAt 및 notification 레코드 생성 확인 (예상 ACTIVE 시점 = createdAt + (queuePosition-1)*30일)
7. **디스패치**: PENDING 알림이 1분 크론으로 SENT 처리되는지 확인 (IN_APP은 즉시 SENT, PUSH/SMS/EMAIL은 mock provider로 성공 처리)
8. **관리자**: GET /admin/notifications, GET /admin/notifications/failed, 실패 건에 대해 POST /admin/notifications/:id/retry 후 재발송 확인
9. **읽음 처리**: PATCH /notifications/:id/read, PATCH /notifications/read-all 후 unread-count 감소 확인

## 9. 재시도 정책

- 최대 3회 재시도
- 1차 실패 후 5분, 2차 실패 후 30분에 scheduledAt 설정, status = SCHEDULED
- 3차 실패 시 status = FAILED 고정
- NotificationLog에 attemptNo, request/response, status, errorMessage 기록

## 10. 중복 방지

- dedupeKey = `{type}:{channel}:{relatedTable}:{relatedId}:{userId}`
- 동일 키로 PENDING/SCHEDULED/SENT가 있으면 새 레코드 생성 스킵
