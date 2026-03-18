# 환경 변수 관리 (STEP 6)

## 필수 변수

| 변수 | 설명 | 예시 |
|------|------|------|
| `PORT` | 서버 포트 | `4000` |
| `NODE_ENV` | 환경 (development / staging / production) | `production` |
| `JWT_SECRET` | JWT 서명 시크릿 (32자 이상 권장) | 운영에서 별도 생성 |
| `JWT_EXPIRES_IN` | Access Token 만료 시간 | `7d`, `1h` |
| `DATABASE_URL` | PostgreSQL 연결 문자열 | `postgresql://user:pass@host:5432/db` |
| `CORS_ORIGIN` | 허용 Origin (쉼표 구분) | `https://admin.example.com` |

## 선택 변수

| 변수 | 설명 |
|------|------|
| `FCM_SERVER_KEY` | FCM 푸시 알림 서버 키 |
| `SMS_API_KEY` | SMS 공급사 API 키 |
| `EMAIL_FROM` | 발신 이메일 주소 |

## 환경별 권장

- **development**: `.env` 또는 `.env.local` 사용, `JWT_SECRET` 기본값 허용
- **staging**: 운영과 동일 보안 수준, 별도 DB
- **production**: `JWT_SECRET` 반드시 강한 값, `CORS_ORIGIN` 실제 도메인만, DB URL 비공개

## 보안

- 로그/모니터링에 비밀번호·토큰·API 키를 절대 기록하지 않는다.
- `.env`는 버전 관리에 포함하지 않는다 (`.gitignore` 확인).
