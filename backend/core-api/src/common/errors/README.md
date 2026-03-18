# 에러 코드 (명세 8)

| 코드 | 의미 | HTTP |
|------|------|------|
| INVALID_QUEUE_STATE | 대기열 상태가 해당 작업에 맞지 않음 | 400 |
| QUEUE_ALREADY_JOINED | 이미 해당 칸에 대기 중 | 400 |
| NOT_ACTIVE_QUEUE | ACTIVE 상태가 아님 (계약 불가) | 400 |
| QUEUE_EXPIRED | 구매 기회 만료 | 400 |
| CONTRACT_ALREADY_EXISTS | 해당 칸에 이미 활성 계약 존재 | 400 |
| UNAUTHORIZED | 권한 없음 / 본인 아님 | 403 |
| RESALE_NOT_APPROVED | 재판매 미승인 또는 이미 등록됨 | 400 |
| RESALE_NOT_LISTED | LISTED 상태가 아님 (구매 불가) | 400 |
| NOT_FOUND | 리소스 없음 | 404 |
| UNIT_NOT_AVAILABLE | 칸 사용 불가 | 400 |

응답 형식: `{ success: false, data: null, error: { code, message } }`
