# 시설/좌석 UI 연동 최종 보고

## 1. 연결된 관리자 화면 목록

| 화면 | 경로 | API | 비고 |
|------|------|-----|------|
| 사업자 등록 | `/admin/company` | POST /admin/company | 사업자명 입력 |
| 시설 등록 | `/admin/site` | GET /admin/companies, POST /admin/facility | 시설명, 주소, 사업자 선택 |
| 구역 생성 | `/admin/section` | GET /admin/facilities, POST /admin/section | 시설 선택, 구역명, rows, cols, 생성 후 좌석 수 표시 |
| 좌석 관리 | `/admin/seat-management` | GET /admin/facilities, GET /admin/facilities/:id/sections, GET /admin/sections/:id/seats, PATCH /admin/seat/:id, PATCH /admin/seat/:id/block | 구역별 그리드, 가격 수정, 차단/해제 |
| 정책 설정 | `/admin/policy` | GET /admin/facilities, GET /admin/facilities/:id/policy, POST /admin/policy | maxWaiting, maxYears |

- 관리자 앱: `apps/admin-ui` (Vite + React).
- 사이드바에 "사업자 등록", "시설 등록", "구역 생성", "좌석 관리", "정책 설정" 메뉴 추가됨 (SUPER_ADMIN만 노출).

---

## 2. 생성된 샘플 데이터 개수

- **시드 스크립트**: `backend/core-api/prisma/seed.ts` 에서 시설/좌석 샘플 생성.
- 실행: `cd backend/core-api && npx prisma db seed`

| 항목 | 개수 |
|------|------|
| Company | 1 (이름: 샘플 사업자) |
| Facility (Site) | 1 (샘플 강남 봉안당) |
| Section | 2 (A: 4×6, B: 3×5) |
| Seat | 4×6 + 3×5 = 24 + 15 = **39** |
| SeatPolicy | 1 (maxWaiting: 3, maxYears: 30) |

- 시드 재실행 시 기존 샘플 사업자/시설/구역이 있으면 생성 건너뜀.

---

## 3. 유저 화면에서 확인된 시설/좌석 상태

| 화면 | 경로 | API | 비고 |
|------|------|-----|------|
| 시설 목록 | `/facilities` | GET /facilities | 카드 클릭 시 시설 상세로 이동 |
| 시설 상세 | `/facilities/:id` | GET /facilities/:id | "좌석표 보기" 버튼으로 좌석 페이지 이동 |
| 좌석표 | `/facilities/:id/seats` | GET /facilities/:id/seats | GREEN(초록)·YELLOW(노랑)·RED(빨강) 색상, 행/열 그리드 |

- **GREEN**: 즉시 구매 가능 → 클릭 시 "즉시 구매" 버튼 → POST /seats/:id/reserve
- **YELLOW**: 대기 가능 → "대기 등록" 버튼 → POST /seats/:id/wait
- **RED**: 구매/대기 불가 → 버튼 비활성

- 유저 앱: `apps/user-ui`. 프록시: `/facilities`, `/seats` → backend 4000.

---

## 4. reserve / wait 성공 여부

- **서버 검증** (이미 구현 + 보강):
  - **reserve**: 직전에 상태 재계산, GREEN이 아니면 실패. 해당 좌석에 CONFIRMED가 이미 있으면 실패 (CONFIRMED_ALREADY_EXISTS).
  - **wait**: 직전에 상태 재계산, YELLOW가 아니면 실패. 동일 유저가 같은 좌석에 WAITING 중복 불가 (DUPLICATE_WAITING). maxWaiting 초과 시 WAITING 생성 불가 (WAITING_LIMIT_REACHED).
- **프론트**: 로그인 필수. 401 시 로그인 페이지로 이동. 성공 시 알림 후 좌석 목록 재조회.

---

## 5. 남은 미구현 항목

- 관리자 UI
  - 시설/구역 **목록 조회 전용** 화면(테이블): 현재는 등록·생성·관리 시 선택용 드롭다운으로만 사용.
- 유저 UI
  - “내 예약/대기 목록”에서 새 API(Reservation) 기반 목록 노출은 미구현. (기존 대기열/계약 API와 별도.)
- 공통
  - 결제 연동, 이메일/문자 알림, 예약 취소 API/UI는 미구현.

---

## 6. 테스트 체크리스트

1. **관리자**: superadmin 로그인 → 사업자 등록 → 시설 등록 → 구역 2개 생성 → 좌석 관리에서 가격/차단 → 정책 설정.
2. **시드**: `npx prisma db seed` 후 로그에 companyCount, facilityCount, sectionCount, seatCount 확인.
3. **유저**: 시설 목록 → 시설 클릭 → 좌석표 보기 → GREEN 좌석 클릭 → 로그인 후 즉시 구매 → YELLOW 좌석에서 대기 등록.
4. **예외**: 같은 좌석에 같은 유저가 대기 중복 등록 시 400, RED 좌석에서 reserve/wait 시 400 확인.
