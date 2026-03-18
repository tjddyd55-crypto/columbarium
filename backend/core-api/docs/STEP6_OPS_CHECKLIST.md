# 운영 체크리스트 (STEP 6)

## 배포 전

- [ ] `DATABASE_URL` 운영 DB로 설정
- [ ] `JWT_SECRET` 강한 값으로 설정 (32자 이상)
- [ ] `CORS_ORIGIN` 운영 도메인만 설정
- [ ] Prisma 마이그레이션 적용: `npx prisma migrate deploy`
- [ ] 환경 변수 문서(STEP6_ENV.md) 검토

## 보안

- [ ] HTTPS 강제 (리버스 프록시/로드밸런서)
- [ ] Helmet 적용됨 (기본 설정)
- [ ] Rate limit 적용 (Throttler, 로그인 등 민감 API 추가 제한 검토)
- [ ] 관리자 API는 Role Guard로 SUPER_ADMIN/OPERATOR_ADMIN만 접근

## 감사/로그

- [ ] 중요 변경(계약/재판매/좌석/사업자) 시 audit_logs 기록 확인
- [ ] 구조화 로그 (requestId, userId, endpoint, duration, status) 수집 경로 확인
- [ ] 에러 시 스택/메시지 로그 수집 (민감정보 제외)

## 장애 대응

- [ ] 글로벌 에러 핸들러 동작 (일관된 에러 응답 형식)
- [ ] 알림 실패 재시도 정책 확인 (최대 3회)
- [ ] DB 연결 실패 시 로그 및 재시도

## 백업/복구

- [ ] DB 일일 백업 스크립트/스케줄 설정
- [ ] 백업 보관 기간 (7~30일) 정책 수립
- [ ] 복구 절차 문서화 및 테스트

## 모니터링 권장

- [ ] API 응답 시간 / 에러율
- [ ] Queue 처리 상태 (ACTIVE 승격/만료)
- [ ] Notification 실패율
- [ ] DB 쿼리 시간 (필요 시)

## CI/CD

- [ ] PR/merge 시 빌드 및 (선택) 테스트 자동 실행
- [ ] 배포는 태그 또는 main 브랜치 기준 자동화 검토
- [ ] 배포 전 마이그레이션 자동 적용 여부 결정

## 금지 사항

- 운영 DB 직접 수정 (마이그레이션/시드 제외)
- 로그 없이 상태 변경
- 관리자 권한 검증 없이 API 호출
- 민감정보 평문 저장
- 테스트 없이 배포
