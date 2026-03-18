# STEP 3 — 모바일 앱 (React Native / Expo)

## 1. 구조

```
mobile/
├── App.tsx                 # QueryClientProvider, NavigationContainer, Toast
├── src/
│   └── app/
│       ├── navigation/     # AuthStack, MainTabs, RootNavigator
│       ├── screens/        # Login, Signup, Home, FacilityList, FacilityDetail, UnitSelection, Queue, QueueDetail, Contract, ContractList, MyPage
│       ├── components/     # Button, Input, Card, Badge, Loading, EmptyState, Layout, UnitGrid, QueueInfoCard, ContractSummaryCard
│       ├── hooks/          # useFacilities, useFacilityDetail, useUnits, useMyQueue, useQueueDetail, useJoinQueue, useCancelQueue, useMyContracts, useCreateContract, useMe
│       ├── services/       # api (axios), auth.api, facility.api, queue.api, contract.api, resale.api, user.api
│       ├── store/          # authStore (Zustand), uiStore
│       ├── types/          # api.ts (ApiResponse, User, Facility, Unit, QueueEntry, Contract, ResaleListing)
│       └── utils/          # constants (API_BASE_URL, UNIT_STATUS_COLORS), theme
└── package.json
```

## 2. 기술 스택

- React Native (Expo 50), TypeScript
- React Query (서버 상태), Zustand (auth, UI)
- React Navigation (Stack + Bottom Tabs)
- Axios (interceptor에서 token 주입)
- 스타일: theme + StyleSheet (Tailwind/NativeWind 패키지는 포함, 바벨 미적용)

## 3. 네비게이션

- **Auth**: Login → Signup (비로그인 시)
- **Main**: 탭(홈, 시설, 대기열, 내 계약, 마이)
- **상세**: FacilityDetail → UnitSelection | QueueDetail | Contract (Stack)

## 4. API 연동

- 모든 데이터/뮤테이션은 React Query 훅 사용 (API 직접 호출 없음)
- `EXPO_PUBLIC_API_URL` (기본 `http://localhost:4000`)
- 로그인 시 token 저장 → axios interceptor에서 Bearer 설정
- 토큰·유저는 AsyncStorage로 유지 (hydrate)

## 5. 핵심 플로우

1. **로그인** → authApi.login → setAuth → Main
2. **시설 조회** → useFacilities() → 카드 터치 → FacilityDetail → useFacilityDetail
3. **좌석 선택** → UnitSelection → useUnits() → UnitGrid → 선택 → useJoinQueue().mutate(unitId)
4. **대기열** → useMyQueue() → QueueInfoCard → QueueDetail → useQueueDetail() → ACTIVE 시 타이머 + useCreateContract()
5. **계약 완료** → createContract 성공 → Main → Contract 탭
6. **내 계약** → useMyContracts() → ContractSummaryCard

## 6. 실행

```bash
cd mobile
npm install
# .env 또는 환경변수 EXPO_PUBLIC_API_URL=http://실서버주소
npx expo start
```

백엔드가 로컬이면 에뮬레이터/기기에서 `http://localhost:4000` 대신 PC IP를 쓰거나 터널 사용.
