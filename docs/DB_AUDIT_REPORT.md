# Supabase DB 감사 결과 보고서

## 수행한 작업

1. **`.env` 파일 생성**  
   - `.env.example`을 복사해 `.env` 생성  
   - 현재 값: placeholder (`https://your-project.supabase.co`, `your-anon-key`)  
   - **실제 Supabase 프로젝트 URL과 anon key로 교체해야 합니다.**

2. **스키마 실행**  
   - Supabase 대시보드 → SQL Editor에서 `supabase/schema.sql` 실행은 **수동**으로 해주세요.  
   - 실행 후 Table Editor에서 `waitlist`, `contracts` 테이블 생성 여부를 확인하세요.

3. **`npm run db:audit` 실행**  
   - 아래 “현재 감사 결과” 기준으로 실행했습니다.

---

## 현재 감사 결과 (placeholder .env 기준)

| 항목 | 결과 | 비고 |
|------|------|------|
| env 로드 | ✅ 성공 | `.env` 존재, `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 파싱됨 |
| waitlist select | ❌ 실패 | `TypeError: fetch failed` (placeholder URL로 인한 연결 실패) |
| contracts select | ❌ 실패 | 동일 |
| waitlist count | ❌ 실패 | 동일 |
| waitlist insert 후 delete | ❌ 실패 | 동일 |

**실패 원인 (현재):**  
- `.env`에 **실제 Supabase URL/Anon Key가 아닌 placeholder**가 들어 있어, Supabase 서버로의 연결이 되지 않음.  
- 따라서 **env 누락이 아니라, 값 미교체**에 해당합니다.

---

## 최종 결과 정리 (표준 형식)

| 항목 | 상태 |
|------|------|
| **DB 연결** | ⚠️ 클라이언트 생성까지 성공, 실제 요청은 실패 (placeholder URL) |
| **ENV 설정** | ✅ 성공 (파일 존재, 변수 로드됨) |
| **테이블 생성** | ⏳ 미확인 (Supabase에서 schema.sql 수동 실행 필요) |
| **select/count** | ❌ 실패 (연결 불가로 미실행) |
| **insert/delete** | ❌ 실패 (연결 불가로 미실행) |
| **RLS 상태** | ⏳ 미확인 (감사 통과 후 확인) |
| **다음 진행 가능 여부** | ❌ **불가** — `npm run db:audit`이 exit code 0으로 통과할 때까지 대기 |

---

## 다음 진행을 위해 필요한 작업

1. **`.env`에 실제 값 설정**  
   - Supabase 대시보드 → Project Settings → API  
   - `Project URL` → `VITE_SUPABASE_URL`  
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`  
   - `.env`에 위 값으로 교체 후 저장.

2. **스키마 적용**  
   - Supabase 대시보드 → SQL Editor  
   - `supabase/schema.sql` 전체 복사 후 실행.  
   - Table Editor에서 `waitlist`, `contracts` (및 필요 시 `unique_active_contract` 인덱스) 확인.

3. **감사 재실행**  
   ```bash
   npm run db:audit
   ```  
   - **exit code 0**이 나와야 “다음 진행 가능”으로 간주.

4. **실패 시 점검**  
   - **테이블 미생성** → schema.sql 다시 실행 후 테이블 존재 여부 확인.  
   - **RLS 정책 문제** → RLS 활성화 시 `docs/SUPABASE_AUDIT.md` 또는 `schema.sql` 하단의 정책 예시 적용.  
   - **키 권한 문제** → anon key가 맞는지, 프로젝트가 pause되지 않았는지 확인.

---

## 감사 통과 후 추가 점검 (체크리스트)

`npm run db:audit`이 0으로 통과한 뒤, 아래를 순서대로 확인하세요.

| # | 점검 항목 | 구현 여부 | 확인 방법 |
|---|-----------|-----------|-----------|
| 1 | 동일 `seat_id`에 ACTIVE contract 중복 생성 방지 | ✅ 코드/DB | DB: `unique_active_contract` 인덱스 존재. 앱: ContractPage에서 insert 전 ACTIVE 존재 시 차단. |
| 2 | waitlist insert 시 `position` 정상 계산 | ✅ 코드 | WaitlistPage에서 WAITING 개수 조회 후 `position = count + 1` 로 insert. |
| 3 | SeatSelectionPage 상태 우선순위 (1. ACTIVE contract → 2. WAITING count → 3. AVAILABLE) | ✅ 코드 | `fetchSeatStatus`: contracts ACTIVE 조회 → waitlist WAITING count → else AVAILABLE. |

- **1:** Supabase Table Editor에서 `contracts`에 동일 `seat_id`로 ACTIVE 2건 넣으려 할 때 제약/앱 차단으로 불가한지 확인.  
- **2:** 대기열 신청 후 `waitlist` 행의 `position`이 1, 2, 3… 순으로 증가하는지 확인.  
- **3:** 해당 seat에 ACTIVE 계약 있으면 ACTIVE, 없고 대기열만 있으면 WAITING, 둘 다 없으면 AVAILABLE로 표시되는지 확인.

---

## 진행 정지 조건 (준수 사항)

- **`npm run db:audit`이 exit code 0으로 통과하기 전까지**  
  - waitlist 실기능 확장  
  - contract 실기능 확장  
  - 관리자 승인 기능 고도화  
  를 진행하지 마세요.

- 감사 통과 후에는 위 “감사 통과 후 추가 점검”을 수행한 뒤, 그 결과에 따라 다음 개발을 진행하면 됩니다.
