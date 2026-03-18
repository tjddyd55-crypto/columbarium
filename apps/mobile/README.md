# 봉안당 모바일 앱 (Expo)

## 실행

```bash
npm install
npx expo start
```

## 환경 변수

- `EXPO_PUBLIC_API_URL`: API 서버 URL (기본 `http://localhost:4000`)
- `.env`에 넣거나 실행 전 export

## 구조

- **src/app/screens**: 로그인, 회원가입, 홈, 시설 목록/상세, 좌석 선택, 대기열, 계약, 마이페이지
- **src/app/services**: Axios + auth/facility/queue/contract/resale/user API
- **src/app/hooks**: React Query 훅 (useFacilities, useMyQueue, useJoinQueue, useCreateContract 등)
- **src/app/store**: Zustand (authStore, uiStore)
- **src/app/components**: Button, Input, Card, UnitGrid, QueueInfoCard 등

## 플로우

1. 로그인/회원가입 → 2. 홈/시설에서 시설 선택 → 3. 좌석 선택 → 대기열 참여 → 4. 대기열 탭에서 상세 → ACTIVE 시 계약하기 → 5. 내 계약 탭에서 확인
