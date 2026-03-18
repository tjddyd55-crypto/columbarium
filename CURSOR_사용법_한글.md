# 🎯 Cursor AI 바로 적용 가이드 - 봉안당 관리자 대시보드

## 📌 이 3개 파일만 있으면 됩니다!

1. **CURSOR_AI_GUIDE.md** ← 메인 파일 (핵심 컴포넌트 + 주요 페이지 6개)
2. **CURSOR_AI_REMAINING_PAGES.md** ← 나머지 페이지 5개
3. **README_CURSOR.md** ← 사용법 + 트러블슈팅

---

## ⚡ 초간단 3단계 (5분 완성)

### 1️⃣ 프로젝트 생성 (1분)
터미널에서 실행:
```bash
npm create vite@latest nakgoldang-admin -- --template react-ts
cd nakgoldang-admin
npm install react-router lucide-react recharts
```

### 2️⃣ Cursor AI에 복붙 (2분)
1. **Cursor IDE** 실행
2. **Ctrl + L** (Mac: Cmd + L) 눌러서 AI 채팅 열기
3. **CURSOR_AI_GUIDE.md** 전체 내용 복사 → Cursor에 붙여넣기
4. **CURSOR_AI_REMAINING_PAGES.md** 전체 내용 복사 → Cursor에 붙여넣기
5. 아래 한 줄 입력:

```
위 가이드대로 봉안당 관리자 대시보드를 완전히 구현해줘. 모든 코드를 정확히 그대로 사용해줘.
```

### 3️⃣ 실행 (1분)
```bash
npm run dev
```

**끝! 🎉**

---

## 📦 생성되는 것들

### ✅ 11개 페이지
- 로그인
- 대시보드 (KPI + 차트)
- 사업자 관리
- 시설 관리
- **봉안함(칸) 관리** ← 그리드 배치도
- **대기열 관리** ← 개월 단위 + 순번 조정
- **계약 관리** ← 30년 장기 계약 + 상세 모달
- **재판매 관리** ← 5단계 프로세스 + 상세 모달
- 회원 관리
- 알림 관리
- 감사 로그

### ✅ 핵심 기능
- **용어**: 좌석 → 봉안함/안치칸
- **대기**: 분 → 개월 단위
- **계약**: 1년 → 20/30/50년
- **재판매**: 단순 테이블 → 5단계 워크플로우
- **필터**: 모든 페이지에 필터 시스템
- **액션**: 승인/반려/수정/삭제 버튼
- **모달**: 상세 정보 팝업

---

## 🎨 화면 구성

```
┌─────────────────────────────────────────────────┐
│  사이드바           │  헤더 (관리자/로그아웃)    │
│  ┌───────────┐     ├───────────────────────────┤
│  │ 봉안당    │     │                           │
│  │ 관리자    │     │  메인 콘텐츠 영역         │
│  ├───────────┤     │  - 필터                   │
│  │ 대시보드  │     │  - KPI 카드               │
│  │ 사업자    │     │  - 차트/그래프            │
│  │ 시설      │     │  - 데이터 테이블          │
│  │ 봉안함    │     │  - 액션 버튼              │
│  │ 대기열    │     │                           │
│  │ 계약      │     │                           │
│  │ 재판매    │     │                           │
│  │ 회원      │     │                           │
│  │ 알림      │     │                           │
│  │ 감사로그  │     │                           │
│  └───────────┘     │                           │
└─────────────────────────────────────────────────┘
```

---

## 💎 핵심 차별점

### Before (일반 카페/스터디룸)
```typescript
{
  seat: "A-12",           ❌ 좌석
  waitTime: "25분",        ❌ 분 단위
  contract: "1년",         ❌ 단기 계약
}
```

### After (봉안당 특화)
```typescript
{
  unit: "A-12",                    ✅ 봉안함/안치칸
  estimatedMonths: 3,              ✅ 개월 단위 대기
  contractYears: 30,               ✅ 30년 장기 계약
  startDate: "2026-01-01",
  endDate: "2056-01-01"            ✅ 30년 후
}
```

---

## 🔥 관리자 강력 기능

### 1. 봉안함 관리
- **강제 ACTIVE** - 대기중 → 판매가능으로 강제 변경
- **일괄 작업** - 여러 개 한번에 생성/수정/변경

### 2. 대기열 관리
- **순번 조정** - ↑↓ 버튼으로 순서 변경
- **강제 취소** - 대기 강제 해제

### 3. 계약 관리
- **강제 생성** - 관리자 권한 즉시 계약
- **상세 모달** - 클릭 한번에 모든 정보

### 4. 재판매 관리
- **5단계 프로세스**:
  1. REQUESTED (승인대기)
  2. APPROVED (승인됨)
  3. LISTED (판매중)
  4. COMPLETED (거래완료)
  5. REJECTED (반려됨)

---

## 🎯 Cursor AI 프롬프트 모음

### 전체 생성
```
CURSOR_AI_GUIDE.md와 CURSOR_AI_REMAINING_PAGES.md를 사용해서 
봉안당 관리자 대시보드를 완전히 구현해줘.
```

### 기능 추가
```
계약 관리에 엑셀 내보내기 버튼 추가해줘
```

```
재판매 상세 모달에 거래 내역을 추가해줘
```

### 디자인 수정
```
사이드바를 더 어둡게 만들어줘
```

```
KPI 카드에 애니메이션 효과를 추가해줘
```

### 버그 수정
```
대기열 순번 조정 버튼이 안 보여. 고쳐줘
```

```
계약 상세 모달이 안 닫혀. 수정해줘
```

---

## ⚠️ 주의사항

### ✅ 반드시 설치
```bash
npm install react-router lucide-react recharts
```

### ✅ react-router (not react-router-dom)
```bash
# ❌ 틀림
npm install react-router-dom

# ✅ 맞음
npm install react-router
```

### ✅ theme.css 첫 줄
```css
@import "tailwindcss";  /* 이거 필수! */
```

---

## 🐛 문제 해결

### 에러: "Cannot find module 'react-router'"
```bash
npm install react-router
```

### 에러: Tailwind 스타일 안 먹힘
`/src/styles/theme.css` 첫 줄 확인:
```css
@import "tailwindcss";
```

### 에러: 차트 안 보임
```bash
npm install recharts
```

### 에러: 아이콘 안 보임
```bash
npm install lucide-react
```

### 전체 재설치
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 완성 체크리스트

### 기본 실행
- [ ] `npm run dev` 성공
- [ ] `localhost:5173` 접속
- [ ] 로그인 페이지 표시

### 페이지 이동
- [ ] 로그인 → 대시보드 이동
- [ ] 사이드바 11개 메뉴 클릭
- [ ] 각 페이지 정상 표시

### 핵심 기능
- [ ] 대시보드: KPI 5개 + 차트 2개
- [ ] 봉안함: 그리드 배치도
- [ ] 대기열: 순번 조정 버튼 (↑↓)
- [ ] 계약: 상세 버튼 → 모달 팝업
- [ ] 재판매: 상세 버튼 → 모달 팝업

### 관리자 기능
- [ ] 봉안함: 강제 ACTIVE 버튼
- [ ] 대기열: 순번 올리기/내리기
- [ ] 계약: 강제 생성 버튼
- [ ] 재판매: 승인/반려 버튼

---

## 🎓 추가 개발 가이드

### Supabase 연결
```bash
npm install @supabase/supabase-js
```

Cursor AI에 요청:
```
Supabase를 연결하고 실제 데이터베이스를 사용하도록 수정해줘
```

### 인증 시스템
```
JWT 기반 인증 시스템을 추가해줘
```

### 엑셀 내보내기
```bash
npm install xlsx
```

```
계약 관리에 엑셀 내보내기 기능 추가해줘
```

---

## 💯 최종 확인

### 생성된 파일 (19개)
```
src/
├── styles/
│   └── theme.css                      ✅
├── app/
│   ├── App.tsx                        ✅
│   ├── routes.tsx                     ✅
│   ├── components/
│   │   ├── Layout.tsx                 ✅
│   │   ├── Sidebar.tsx                ✅
│   │   ├── Header.tsx                 ✅
│   │   ├── KPICard.tsx                ✅
│   │   ├── StatusBadge.tsx            ✅
│   │   └── DataTable.tsx              ✅
│   └── pages/
│       ├── Login.tsx                  ✅
│       ├── Dashboard.tsx              ✅
│       ├── OperatorManagement.tsx     ✅
│       ├── FacilityManagement.tsx     ✅
│       ├── UnitManagement.tsx         ✅
│       ├── QueueManagement.tsx        ✅
│       ├── ContractManagement.tsx     ✅
│       ├── ResaleManagement.tsx       ✅
│       ├── MemberManagement.tsx       ✅
│       ├── NotificationManagement.tsx ✅
│       └── AuditLog.tsx               ✅
```

---

## 🎉 완성!

**3분이면 완성되는 전문 봉안당 관리자 대시보드!**

- ✅ 11개 완전 작동 페이지
- ✅ 봉안당 특화 용어/구조
- ✅ 관리자 강력 기능
- ✅ 필터 + 모달 + 액션 버튼
- ✅ 깔끔한 네이비+블루 디자인

**Cursor AI에 복붙하고 5분 기다리면 끝!** 🚀
