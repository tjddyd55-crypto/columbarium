# 역할(RBAC) · 온보딩 · API · 커미션 운영 가이드

## 1. 사업자 생성 흐름 (ADMIN)

**엔드포인트:** `POST /admin/onboarding/company-with-operator`

1. `Company` 레코드 생성 (`companyName`)
2. `OPERATOR` 역할을 가진 `User` 생성
3. `User.companyId` → 위 Company 연결
4. 비밀번호: `operatorPassword` 미입력 시 서버가 임시 비밀번호 자동 생성

**응답 (1회만 평문 비밀번호 노출):**

- `company`: `{ id, name, createdAt }`
- `operatorAccount`: `{ userId, loginId, initialPassword }`

**감사:** `COMPANY_AND_OPERATOR_ONBOARDED`  
**로그:** `[COMPANY_OPERATOR_ONBOARDED]`

온보딩으로 생성된 운영자·에이전트 계정은 `mustChangePassword=true`이며, 로그인 후 비밀번호 변경 화면으로 유도됩니다.

---

## 2. AGENT 발급 흐름 (ADMIN)

**엔드포인트:** `POST /admin/onboarding/agent-user`

1. `AGENT` 역할 `User` 생성 (`loginId`, `userName`, `phone`, …)
2. 동일 트랜잭션에서 `Agent` 행 생성 (`companyId`, `agentDisplayName`, `commissionRate`)
3. `code`는 서버에서 자동 생성(충돌 시 재시도)
4. 비밀번호: `password` 미입력 시 자동 생성

**응답:**

- `agent`: `{ id, code, name, commissionRate, companyId }`
- `agentAccount`: `{ userId, loginId, initialPassword }`

**레거시:** 기존 사용자에만 `Agent`를 붙일 때는 `POST /admin/agents` (`userId` 지정) 유지.

**로그:** `[AGENT_CODE_CREATED]` (온보딩·기존 생성 공통 패턴)

---

## 3. 역할별 관리자 UI 메뉴 (확정)

| 메뉴 | ADMIN | OPERATOR | AGENT |
|------|:-----:|:--------:|:-----:|
| 대시보드 | ✅ | ✅ | ✅ |
| 사업자+운영자 통합 등록 | ✅ | ❌ | ❌ |
| 에이전트 발급 | ✅ | ❌ | ❌ |
| 사업자만 등록(레거시) | ✅ | ❌ | ❌ |
| 시설/구역/좌석/정책 | ✅ | ✅ (본인 company 스코프 API) | ❌ |
| 사업자·시설 관리(기존 메모리얼) | ✅ | ❌ | ❌ |
| 봉안함(칸)·대기열·계약·재판매(레거시) | ✅ | ❌ | ❌ |
| 회원·감사로그 | ✅ | ❌ | ❌ |
| 알림 관리 | ✅ | ❌ | ❌ |

프론트는 메뉴 숨김만으로 보안을 대체하지 않습니다. 서버에서 동일하게 차단합니다.

---

## 4. 역할별 API 접근표 (요약)

| 구역 | ADMIN | OPERATOR | AGENT | 비고 |
|------|:-----:|:--------:|:-----:|------|
| `POST /admin/onboarding/*` | ✅ | ❌ | ❌ | 통합 온보딩 |
| `GET/POST /admin/*` (기존) | ✅ | ❌ | ❌ | 전사 시설·좌석 등 |
| `GET/POST/PATCH /admin/me/*` | ❌ | ✅¹ | ❌ | 본인 `companyId`만 |
| `GET /dashboard/summary` | ✅ | ✅² | ✅³ | 역할별 응답 분기 |
| `GET /operator/*` (레거시) | ✅ | ❌ | ❌ | 메모리얼 Operator |
| 좌석 예약·결제·취소 `/seats/*` `/payments/*` `/reservations/*` | USER+ | 동일 | 동일 | 본인 예약만 |
| `/resale/*` (좌석 재판매) | USER+ | 동일 | 동일 | JWT만 |

¹ `User.companyId` 필수. 레거시 `OPERATOR_ADMIN`만 있고 `companyId` 없으면 403.  
² 대시보드·`/admin/me/*` 사용.  
³ `Agent` 프로필 필수; 요약만.

**AGENT 전용 단일 API는 없음** — `GET /dashboard/summary`가 AGENT 뷰를 반환.

---

## 5. 커미션(`Commission`) 상태

| 상태 | 의미 |
|------|------|
| `PENDING` | 예약 시 생성, 결제 확정 전 |
| `PAID` | `confirmPayment` 후(매출 확정에 따른 정산 확정) |
| `CANCELLED` | 예약 취소·결제 실패 등 |

### APPROVED 단계 도입 여부 (제안)

- **현재:** `PENDING` → (결제 성공) → `PAID` 로 단순.
- **운영이 복잡해지면:** `PENDING` → `APPROVED`(관리자/정산 배치 확인) → `PAID`(실지급) 로 분리해 **정산 승인과 실지급**을 나눌 수 있음.
- 스키마에 `APPROVED` 추가 시: 마이그레이션 + `confirmPayment`는 `APPROVED`까지 올리고, 배치/관리 API에서 `PAID` 처리하는 식이 일반적.

초기 운영에서는 **3단계 유지**를 권장하고, 월 정산·이의 제기 프로세스가 생기면 `APPROVED`를 도입합니다.

---

## 6. AGENT 실적 규칙

- **실적에 포함되는 예약:** `Reservation.status === CONFIRMED` 인 건만.
- `RESERVED` / `WAITING` / `CANCELLED` 는 실적·매출 집계에서 제외.
- 대시보드 AGENT 뷰의 `confirmedSalesLinkedCount`가 이 정의를 따름.

---

## 7. 재판매와 AGENT 정책

- **초기 정책:** 재판매(`SeatResale`)에는 **새 agentCode를 적용하지 않음**.  
  최초 좌석 예약 시 연결된 `Reservation.agentId`·`Commission`만 유효.
- `buyListing`은 소유권(`Reservation.userId`)과 listing 상태만 처리; 에이전트 커미션을 재생성하지 않음.
- 향후 “재판매 소개 수수료” 등은 별도 엔티티·플래그로 확장 (코드 주석 참고).

---

## 8. 남은 미구현·주의 항목

1. **OPERATOR + 레거시 대기열/계약 UI:** 메뉴는 숨겼으나, 향후 동일 `companyId` 스코프 API가 필요하면 별도 설계.
2. **OPERATOR_ADMIN + `companyId`:** 레거시 계정은 `User.companyId`가 없을 수 있음 → `/admin/me/*` 사용 불가. 마이그레이션 또는 수동 보정 권장.
3. **초기 비밀번호 전달:** 응답에만 평문 노출 — 이메일/SMS 발송 채널은 미구현.
4. **AGENT 전용 목록 API:** 현재 대시보드 요약에 의존; 모바일 앱 등을 위해 `GET /dashboard/agent/commissions` 같은 전용 API는 선택 과제.
5. **좌석 재판매·USER 역할:** 일반 사용자 JWT로 접근; AGENT/OPERATOR가 앱에서 동일 API를 쓰면 본인 검증은 각 핸들러에서 처리됨.

---

## 부록: 운영자 스코프 API (`/admin/me`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/admin/me/facilities` | 소속 시설 목록 |
| POST | `/admin/me/facility` | 시설 생성 (자기 company) |
| GET | `/admin/me/facilities/:id/sections` | 구역 목록 |
| POST | `/admin/me/section` | 구역 생성 |
| GET | `/admin/me/sections/:id/seats` | 좌석 목록 |
| PATCH | `/admin/me/seat/:id` | 가격 |
| PATCH | `/admin/me/seat/:id/block` | 차단 |
| GET | `/admin/me/facilities/:id/policy` | 정책 조회 |
| POST | `/admin/me/policy` | 정책 저장 |

모든 쓰기/조회는 JWT의 `companyId`와 대상 `Site`/`Section`/`Seat`의 소속이 일치할 때만 허용됩니다.

---

## 관리자 웹 콘솔 로그인 (`ADMIN` / `SUPER_ADMIN` 전용)

- **엔드포인트:** `POST /api/auth/admin-login` (body: `login_id`, `password` — 일반 `POST /api/auth/login` 과 동일)
- **동작:** 자격 증명 검증 후, 역할 목록에 `ADMIN` 또는 `SUPER_ADMIN` 이 없으면 **403** `관리자만 접근 가능`. 토큰은 발급하지 않음.
- **프론트:** 관리자 로그인 화면은 위 API만 사용. `/admin/*` 레이아웃에서 `canAccessAdminPortal` 로 재검증 후 비관리자는 `/admin/login` 으로 리다이렉트.

---

## 부록: 초기 비밀번호 · 강제 변경 (`mustChangePassword`)

| 항목 | 설명 |
|------|------|
| DB | `User.mustChangePassword` 기본값 `true`. **직접 회원가입**(`POST /api/auth/signup`)은 `false`로 저장. |
| 온보딩 | `company-with-operator`, `agent-user`로 만든 계정은 `true` 유지. |
| 로그인 응답 | `user.mustChangePassword` 포함 (레거시 `/api/auth/login` 동일). |
| 변경 API | `POST /api/auth/change-password` (레거시) 또는 `POST /auth/change-password` — 본인 JWT, `current_password` / `new_password` (또는 camelCase DTO). 성공 시 `mustChangePassword: false` 및 새 토큰 발급. |
| 관리자 리셋 | `POST /admin/reset-password` — `SUPER_ADMIN`/`ADMIN`, body `{ userId, newPassword }`. bcrypt 저장, `mustChangePassword: true`. **응답·감사 로그에 비밀번호 미포함.** |
| API 방어 | `mustChangePassword === true` 인 JWT로는 위 변경 API·`GET /api/auth/me` 외 대부분의 인증 API가 403. |

### 수동 검증 시나리오

1. **최초 로그인 강제 변경:** 온보딩으로 발급된 계정으로 로그인 → UI가 비밀번호 변경 화면으로 이동하는지 확인 → 변경 후 정상 이용.
2. **관리자 리셋:** `POST /admin/reset-password` 호출 후 해당 계정으로 로그인 → 다시 변경 화면으로 유도되는지 확인.
