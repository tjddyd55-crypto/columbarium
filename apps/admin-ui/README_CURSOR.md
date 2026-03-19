# 🚀 Cursor AI 완전 가이드 - 낙골당 관리자 대시보드

## 📋 빠른 시작 (3단계)

### 1단계: 프로젝트 생성
터미널에서 실행:
```bash
npm create vite@latest nakgoldang-admin -- --template react-ts
cd nakgoldang-admin
npm install react-router lucide-react recharts
```

### 2단계: Cursor AI에 복사-붙여넣기
1. **Cursor IDE 열기**
2. **Ctrl/Cmd + L** 눌러서 AI 채팅 열기
3. 아래 순서대로 파일 내용 복사-붙여넣기:

**첫 번째:** `CURSOR_AI_GUIDE.md` 전체 내용 복사 → Cursor에 붙여넣기

**두 번째:** `CURSOR_AI_REMAINING_PAGES.md` 전체 내용 복사 → Cursor에 붙여넣기

**세 번째:** 다음 프롬프트 입력
```
위 가이드대로 낙골당 관리자 대시보드를 완전히 구현해줘.
모든 파일(11개 페이지 + 6개 컴포넌트 + 스타일)을 정확히 생성해줘.
```

### 3단계: 실행
```bash
npm run dev
```

---

## 📁 생성되는 파일 목록 (총 19개)

### 스타일 (1개)
- `/src/styles/theme.css`

### 핵심 (2개)
- `/src/app/App.tsx`
- `/src/app/routes.tsx`

### 레이아웃 컴포넌트 (3개)
- `/src/app/components/Layout.tsx`
- `/src/app/components/Sidebar.tsx`
- `/src/app/components/Header.tsx`

### 공통 컴포넌트 (3개)
- `/src/app/components/KPICard.tsx`
- `/src/app/components/StatusBadge.tsx`
- `/src/app/components/DataTable.tsx`

### 페이지 (11개)
- `/src/app/pages/Login.tsx` - 로그인
- `/src/app/pages/Dashboard.tsx` - 대시보드 (KPI + 차트)
- `/src/app/pages/OperatorManagement.tsx` - 사업자 관리
- `/src/app/pages/FacilityManagement.tsx` - 시설 관리
- `/src/app/pages/UnitManagement.tsx` - 봉안함(칸) 관리
- `/src/app/pages/QueueManagement.tsx` - 대기열 관리
- `/src/app/pages/ContractManagement.tsx` - 계약 관리
- `/src/app/pages/ResaleManagement.tsx` - 재판매 관리
- `/src/app/pages/MemberManagement.tsx` - 회원 관리
- `/src/app/pages/NotificationManagement.tsx` - 알림 관리
- `/src/app/pages/AuditLog.tsx` - 감사 로그

---

## 🎯 핵심 기능 요약

### 1. 용어 변경 (봉안당 특화)
- ❌ 좌석/Seat → ✅ **봉안함/안치칸/Unit**
- ❌ 분 단위 대기 → ✅ **개월 단위 대기**
- ❌ 1년 단기 계약 → ✅ **20/30/50년 장기 계약**

### 2. 대기열 관리
- **개월 단위** 예상 대기 기간 (estimatedMonths)
- **총 대기 인원** 표시 (waitingCount)
- **순번 조정** 버튼 (↑ ↓)
- **강제 취소** 기능

### 3. 계약 관리
- **30년 장기 계약** 중심 구조
- **계약 상세 모달** (클릭 시 팝업)
- **강제 계약 생성** 버튼
- **필터 시스템** (시설/상태/기간)
- **승인/수정/취소** 액션

### 4. 재판매 관리 (5단계 프로세스)
1. **REQUESTED** - 승인대기
2. **APPROVED** - 승인됨
3. **LISTED** - 판매중
4. **COMPLETED** - 거래완료
5. **REJECTED** - 반려됨

각 단계마다 상세 정보 + 액션 버튼

### 5. 봉안함 관리
- **그리드 배치도** (시각적 표시)
- **상태별 색상** (판매가능/대기중/완료)
- **필터** (시설/상태)
- **강제 활성화** (PENDING → ACTIVE)
- **일괄 작업** (생성/가격수정/상태변경)

### 6. 대시보드
- **KPI 카드 5개** (시설/봉안함/계약/대기열/오늘계약)
- **막대 차트** (월별 계약 통계)
- **파이 차트** (봉안함 상태 분포)
- **최근 계약 테이블**
- **최근 알림 목록**

---

## 🎨 디자인 시스템

### 색상 코드
```css
--color-primary: #3B82F6        /* 블루 - 주요 버튼 */
--color-secondary: #1E293B      /* 네이비 - 사이드바 */
--color-success: #10B981        /* 초록 - 성공/활성 */
--color-warning: #F59E0B        /* 노랑 - 대기/경고 */
--color-error: #EF4444          /* 빨강 - 에러/취소 */
```

### 상태 배지
- **ACTIVE** / 활성 → 초록색
- **PENDING** / 대기 → 노란색
- **COMPLETED** / 완료 → 파란색
- **REJECTED** / 반려 → 빨간색

---

## ✅ 완료 체크리스트

프로젝트 생성 후 확인:

### 기본 실행
- [ ] `npm run dev` 실행 성공
- [ ] `http://localhost:5173` 접속
- [ ] 로그인 페이지 표시 (`/login`)

### 페이지 네비게이션
- [ ] 로그인 후 대시보드 이동
- [ ] 사이드바 11개 메뉴 모두 클릭 가능
- [ ] 각 페이지 정상 표시

### 핵심 기능
- [ ] **대시보드**: KPI 카드 5개 + 차트 2개
- [ ] **봉안함 관리**: 그리드 배치도 표시
- [ ] **대기열 관리**: 순번 조정 버튼 (↑↓)
- [ ] **계약 관리**: 상세 버튼 클릭 → 모달 팝업
- [ ] **재판매 관리**: 상세 버튼 클릭 → 모달 팝업
- [ ] **필터 시스템**: 모든 관리 페이지에 필터 표시

### 액션 버튼
- [ ] 승인/반려 버튼 표시 (PENDING 상태일 때)
- [ ] 상세/수정/삭제 버튼 표시
- [ ] 버튼 hover 효과 작동

---

## 🚨 문제 해결

### 1. 패키지 오류
```bash
# 모든 패키지 재설치
rm -rf node_modules package-lock.json
npm install
```

### 2. React Router 오류
```bash
# react-router-dom이 아닌 react-router 사용
npm uninstall react-router-dom
npm install react-router
```

### 3. Tailwind 인식 안 됨
`/src/styles/theme.css` 상단에 반드시:
```css
@import "tailwindcss";
```

### 4. 차트 안 보임
```bash
# recharts 설치 확인
npm install recharts
```

---

## 📊 데이터 구조 예시

### 대기열 (Queue)
```typescript
{
  position: 1,                  // 순번
  user: "김철수",               // 사용자
  facility: "강남 낙골당",      // 시설
  unit: "A-101",                // 봉안함
  waitingCount: 12,             // 총 대기 인원
  estimatedMonths: 3,           // 예상 대기 기간 (개월)
  status: "WAITING",            // 상태
  createdAt: "2026-03-17 14:30" // 생성일시
}
```

### 계약 (Contract)
```typescript
{
  contractNo: "C-2026-001",     // 계약번호
  buyer: "김철수",              // 계약자
  facility: "강남 낙골당",      // 시설
  unit: "A-101",                // 봉안함
  contractYears: 30,            // 계약 기간 (년)
  amount: "5,000,000원",        // 계약 금액
  status: "ACTIVE",             // 상태
  startDate: "2026-01-01",      // 시작일
  endDate: "2056-01-01"         // 종료일 (30년 후)
}
```

### 재판매 (Resale)
```typescript
{
  seller: "김철수",                      // 판매자
  buyer: null,                           // 구매자 (승인 전까지 null)
  facility: "강남 낙골당",               // 시설
  unit: "A-101",                         // 봉안함
  originalPrice: "5,000,000원",          // 원가
  resalePrice: "4,800,000원",            // 재판매가
  status: "REQUESTED",                   // 상태 (5단계 프로세스)
  requestReason: "이사로 인한 사용 불가", // 신청 사유
  rejectionReason: null                  // 반려 사유 (반려시)
}
```

---

## 🔥 관리자 핵심 기능

### 봉안함 관리
- ✅ **강제 ACTIVE 처리** - PENDING → ACTIVE 변경
- ✅ **일괄 생성** - 여러 봉안함 한번에 생성
- ✅ **가격 일괄 수정** - 여러 봉안함 가격 한번에 변경
- ✅ **상태 일괄 변경** - 여러 봉안함 상태 한번에 변경

### 대기열 관리
- ✅ **순번 조정** - ↑↓ 버튼으로 순번 올리기/내리기
- ✅ **강제 취소** - 대기열 강제로 취소

### 계약 관리
- ✅ **강제 계약 생성** - 관리자 권한으로 즉시 계약 생성
- ✅ **계약 승인** - PENDING 계약 승인
- ✅ **계약 취소** - 계약 강제 취소

### 재판매 관리
- ✅ **재판매 승인** - 신청 승인
- ✅ **재판매 반려** - 신청 거절 (사유 입력)
- ✅ **판매 중단** - 판매중인 재판매 강제 중단

---

## 🎓 Cursor AI 프롬프트 예시

### 전체 생성
```
CURSOR_AI_GUIDE.md와 CURSOR_AI_REMAINING_PAGES.md의 모든 코드를 
정확히 그대로 사용해서 낙골당 관리자 대시보드를 완전히 구현해줘.
```

### 개별 페이지 생성
```
UnitManagement.tsx 페이지를 위 가이드대로 정확히 생성해줘.
```

### 기능 추가
```
ContractManagement.tsx에 엑셀 내보내기 버튼을 추가해줘.
```

### 스타일 수정
```
사이드바 배경색을 #0F172A로 더 어둡게 변경해줘.
```

---

## 💡 다음 단계 (추가 개발)

### 1. Supabase 연결
```bash
npm install @supabase/supabase-js
```
- 실제 데이터베이스 통합
- 실시간 업데이트

### 2. 인증 시스템
```bash
npm install @supabase/auth-helpers-react
```
- JWT 토큰 기반 인증
- 로그인/로그아웃 실제 구현

### 3. 권한 관리
- 슈퍼관리자 vs 일반관리자
- 페이지별 권한 제어

### 4. 파일 업로드
```bash
npm install react-dropzone
```
- 계약서 업로드
- 이미지 첨부

### 5. 엑셀 내보내기
```bash
npm install xlsx
```
- 데이터 엑셀 다운로드
- 리포트 생성

---

## 📞 지원

### 문제 발생 시
1. **오류 메시지** 전체 복사
2. **Cursor AI 채팅**에 붙여넣기
3. "이 오류를 해결해줘" 요청

### 추가 기능 요청
Cursor AI에 자연어로 요청:
```
"재판매 관리에 가격 제안 기능을 추가해줘"
"대시보드에 이번 주 매출 그래프를 추가해줘"
"계약 필터에 금액 범위 검색을 추가해줘"
```

---

## ✨ 완성!

이 가이드대로 진행하면 **완전히 작동하는 낙골당 관리자 대시보드**가 생성됩니다!

**총 19개 파일 / 11개 페이지 / 6개 컴포넌트**

모든 기능이 봉안당 분양 플랫폼에 최적화되어 있습니다. 🎉
