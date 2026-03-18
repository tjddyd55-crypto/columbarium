# API 명세 초안

## 1. 공통

- **Base URL**: `https://api.example.com/v1` (환경별 치환)
- **인증**: `Authorization: Bearer <access_token>`
- **공통 응답**: 성공 시 `{ "data": ... }`, 오류 시 `{ "error": { "code": "...", "message": "..." } }`
- **페이징**: `?page=1&limit=20`, 응답 `meta: { total, page, limit }`

---

## 2. 인증 (Auth)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | /auth/signup | 회원가입 | X |
| POST | /auth/login | 일반 로그인 | X |
| POST | /auth/logout | 로그아웃 | O |
| POST | /auth/refresh | 토큰 갱신 | Refresh |
| POST | /auth/social/naver | 네이버 로그인/연동 | X |
| POST | /auth/social/kakao | 카카오 로그인/연동 | X |
| POST | /auth/phone/send | 휴대폰 인증번호 발송 | O(선택) |
| POST | /auth/phone/verify | 휴대폰 인증 확인 | O(선택) |
| POST | /auth/password/forgot | 비밀번호 찾기(이메일/연락처) | X |
| POST | /auth/password/reset | 비밀번호 재설정 | X(토큰) |

---

## 3. 사용자 (Users)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | /users/me | 내 프로필 | O |
| PATCH | /users/me | 내 정보 수정 | O |
| GET | /users/me/agreements | 내 동의 이력 | O |

---

## 4. 시설 (Facilities)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | /facilities | 시설 목록 (필터: 지역, 가격, 분양가능, 선분양, 재판매) | O(선택) |
| GET | /facilities/:id | 시설 상세 | O(선택) |
| GET | /facilities/:id/buildings | 건물 목록 | O |
| GET | /facilities/:id/floors | 층 목록 | O |
| GET | /facilities/:id/sections | 구역 목록 | O |
| GET | /facilities/:id/layouts | 배치도 목록 | O |
| GET | /facilities/:id/units | 칸(unit) 목록 (층/구역 필터) | O |
| GET | /facilities/:id/units/:unitId | 칸 상세 | O |

---

## 5. 대기열 (Queue)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | /queue/join | 대기열 참여 (unitId, partnerId 선택) | O USER |
| GET | /queue/my | 내 대기열 목록 | O USER |
| GET | /queue/:id | 대기열 상세 | O USER |
| POST | /queue/:id/cancel | 대기 취소 | O USER |
| GET | /queue/unit/:unitId/status | 특정 칸 대기열 상태 (순번, 인원 수) | O |

---

## 6. 계약 (Contracts)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | /contracts | 계약 생성 (대기열 ACTIVE에서 호출) | O USER |
| GET | /contracts/my | 내 계약 목록 | O USER |
| GET | /contracts/:id | 계약 상세 | O (본인/관리자) |
| GET | /contracts/:id/documents | 계약 문서 목록 | O |

---

## 7. 재판매 (Resale)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | /resale | 재판매 신청 | O USER |
| GET | /resale/my | 내 재판매 신청/등록 목록 | O USER |
| GET | /resale/listings | 재판매 목록 (공개, 필터) | O |
| GET | /resale/listings/:id | 재판매 상세 | O |
| POST | /resale/:id/approve | 재판매 승인 | O OPERATOR/SUPER |
| POST | /resale/:id/reject | 재판매 반려 | O OPERATOR/SUPER |
| POST | /resale/:id/buy | 재판매 구매(계약 생성) | O USER |

---

## 8. 추천/영업 (Referrals)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | /referrals/me | 내 영업 프로필(링크/코드) | O SALES_MANAGER |
| POST | /referrals/link | 추천 링크 생성 | O SALES_MANAGER |
| GET | /referrals/customers | 내 추천 고객 목록 | O SALES_MANAGER |
| GET | /referrals/commissions | 수수료 대상 계약 | O SALES_MANAGER |

---

## 9. 업체관리자 (Operator)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | /operator/facilities | 시설 등록 | O OPERATOR_ADMIN |
| PATCH | /operator/facilities/:id | 시설 수정 | O OPERATOR_ADMIN |
| GET | /operator/facilities | 내 시설 목록 | O OPERATOR_ADMIN |
| POST | /operator/facilities/:id/buildings | 건물 추가 | O OPERATOR_ADMIN |
| POST | /operator/facilities/:id/floors | 층 추가 | O OPERATOR_ADMIN |
| POST | /operator/facilities/:id/sections | 구역 추가 | O OPERATOR_ADMIN |
| POST | /operator/units/bulk | 칸 일괄 생성 | O OPERATOR_ADMIN |
| PATCH | /operator/units/:id | 칸 수정(상태, 가격 등) | O OPERATOR_ADMIN |
| GET | /operator/queue | 대기열 현황 | O OPERATOR_ADMIN |
| GET | /operator/contracts | 계약 목록 | O OPERATOR_ADMIN |
| GET | /operator/resale | 재판매 신청 목록 | O OPERATOR_ADMIN |
| GET | /operator/notifications | 알림 발송 이력 | O OPERATOR_ADMIN |

---

## 10. 슈퍼관리자 (Admin)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | /admin/operators | 사업자 생성 | O SUPER_ADMIN |
| GET | /admin/operators | 사업자 목록 | O SUPER_ADMIN |
| PATCH | /admin/operators/:id | 사업자 수정 | O SUPER_ADMIN |
| POST | /admin/operators/:id/admins | 업체관리자 지정 | O SUPER_ADMIN |
| GET | /admin/users | 회원 목록 | O SUPER_ADMIN |
| GET | /admin/contracts | 전체 계약 | O SUPER_ADMIN |
| GET | /admin/facilities | 전체 시설 | O SUPER_ADMIN |
| GET | /admin/stats | 대시보드 통계 | O SUPER_ADMIN |

---

## 11. 알림 (Notifications)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | /notifications | 내 알림 목록 | O |
| PATCH | /notifications/:id/read | 읽음 처리 | O |
| GET | /notifications/unread-count | 미읽음 개수 | O |

---

## 12. 결제 (Payments) — Mock

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | /payments/request | 결제 요청 (계약 연동) | O USER |
| GET | /payments/:id | 결제 상태 조회 | O |
| POST | /payments/:id/complete-mock | Mock 완료 처리 (개발/테스트) | O (개발 전용) |

---

## 13. 주소/지도

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | /addresses/search | 주소 검색 (한국 주소) | O(선택) |

지도 자체는 클라이언트에서 네이버 지도 API 사용. 시설 등은 `lat`, `lng` 포함하여 제공.

---

*문서 버전: 1.0*
