# Supabase DB 설정 완료 가이드

## 1️⃣ ENV 값 확인 (필수)

프로젝트 루트 `.env` 파일에 **실제 값**이 있어야 합니다.

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-real-anon-key
```

- **Supabase 대시보드** → **Project Settings** → **API**
- **Project URL** → `VITE_SUPABASE_URL`에 복사
- **anon public** key → `VITE_SUPABASE_ANON_KEY`에 복사

placeholder(`your-project`, `your-anon-key`)가 있으면 **반드시 실제 값으로 교체** 후 저장.

---

## 2️⃣ 스키마 실행 (필수)

1. **Supabase 대시보드** → **SQL Editor**
2. 프로젝트의 **`supabase/schema.sql`** 파일 전체 복사
3. SQL Editor에 붙여넣기 → **RUN** 실행
4. **Table Editor**에서 `waitlist`, `contracts` 테이블 생성 확인

### 검증 쿼리 (SQL Editor에서 실행)

```sql
select * from waitlist limit 1;
select * from contracts limit 1;
```

에러가 나면 → schema.sql이 제대로 실행되지 않은 것. 다시 실행.

---

## 3️⃣ 로컬 감사 실행

```bash
npm run db:audit
```

**기대 결과:** 모든 항목 통과, **exit code 0**

- ENV loaded correctly
- waitlist select OK
- contracts select OK
- waitlist count OK
- waitlist insert/delete OK

---

## 4️⃣ 실패 시 점검

| 증상 | 원인 | 조치 |
|------|------|------|
| ENV / fetch failed | URL 또는 키 잘못됨 | .env를 대시보드 API 값과 일치시키기 |
| relation "waitlist" does not exist | 테이블 미생성 | schema.sql 전체 다시 실행 |
| insert 권한/RLS 오류 | RLS 정책 차단 | 아래 RLS 임시 정책 실행 |

### RLS 임시 조치 (개발용)

Supabase **SQL Editor**에서 실행:

```sql
create policy "allow all" on waitlist for all using (true) with check (true);
create policy "allow all" on contracts for all using (true) with check (true);
```

`contracts`에 이미 같은 이름 정책이 있으면 테이블별로 하나씩만 실행.

---

## 5️⃣ 진행 조건

다음이 모두 만족될 때만 다음 개발 진행:

- ✔ schema.sql 실행 완료
- ✔ waitlist, contracts 테이블 존재 확인
- ✔ `npm run db:audit` **exit code 0** 통과

---

## 최종 체크리스트

- [ ] .env에 실제 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 설정
- [ ] Supabase SQL Editor에서 schema.sql 실행
- [ ] Table Editor에서 waitlist, contracts 확인
- [ ] `npm run db:audit` 실행 → exit code 0
- [ ] (선택) RLS 오류 시 위 정책 2줄 실행 후 감사 재실행
