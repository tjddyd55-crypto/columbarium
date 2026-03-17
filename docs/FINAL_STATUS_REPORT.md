# Supabase DB 최종 상태 보고

## 실행 결과 요약

| 항목 | 상태 | 비고 |
|------|------|------|
| **ENV** | **FAIL** | `.env`에 placeholder 사용 중 (`your-project.supabase.co`, `your-anon-key`). 실제 Supabase URL·Anon Key로 교체 필요. |
| **Tables** | **미확인** | DB 연결 실패로 테이블 존재 여부 확인 불가. schema.sql 수동 실행 필요. |
| **Audit** | **FAIL** | `npm run db:audit` exit code 1. waitlist/contracts select·count·insert 모두 `TypeError: fetch failed` (연결 실패). |
| **Ready for next step** | **NO** | 감사 통과 전까지 개발 진행 불가. |

---

## 실패 원인

- **ENV:** `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`가 아직 예시 값이라, Supabase 서버로 연결되지 않음.
- **테이블:** 연결이 되지 않아 `waitlist`, `contracts` 존재 여부를 검증하지 못함.
- **RLS:** 연결 단계에서 실패해 RLS 여부는 확인하지 못함.

---

## 다음 진행을 위해 할 일 (순서대로)

1. **ENV 교체**
   - Supabase 대시보드 → **Settings** → **API**
   - **Project URL** → `.env`의 `VITE_SUPABASE_URL`에 넣기
   - **anon public** key → `.env`의 `VITE_SUPABASE_ANON_KEY`에 넣기
   - `.env` 저장

2. **스키마 실행**
   - Supabase 대시보드 → **SQL Editor**
   - 프로젝트의 **`supabase/schema.sql`** 전체 복사 후 붙여넣기 → **RUN**
   - **Table Editor**에서 `waitlist`, `contracts` 테이블 생성 확인
   - 필요 시 검증: `select * from waitlist limit 1;`, `select * from contracts limit 1;`

3. **감사 재실행**
   ```bash
   npm run db:audit
   ```
   - **exit code 0**이 나올 때까지 1~2번 반복 점검.
   - insert 실패 시 RLS일 수 있음 → `docs/SUPABASE_SETUP_FINAL.md`의 RLS 정책 2줄 실행 후 다시 `npm run db:audit`.

4. **감사 통과 후**
   - ENV: OK, Tables: OK, Audit: PASS, Ready: YES 로 간주하고 다음 개발 진행.

---

## 참고 문서

- **`docs/SUPABASE_SETUP_FINAL.md`** — ENV 확인, schema 실행, 검증 쿼리, RLS 임시 조치, 체크리스트 정리.
