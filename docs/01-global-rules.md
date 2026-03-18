# 절대 규칙 (GLOBAL RULES)

**가장 먼저 적용·준수할 규칙이다.**

1. **백엔드는 반드시 1개만 사용한다.**  
   → `backend/core-api` (NestJS)만 허용.

2. **모든 API는 반드시 core-api를 통해서만 접근한다.**  
   → web / admin-ui / mobile에서 다른 API 서버 호출 금지.

3. **web / admin-ui / mobile에서는 DB 접근 절대 금지.**  
   → DB 접근은 core-api만 가능.

4. **legacy/express-api는 완전 폐기 대상.**  
   → 참고용만 유지, 신규/운영 API 사용 금지.

5. **UI는 Figma 기준 절대 수정 금지.**  
   → 디자인 변경은 Figma 반영 후에만 적용.

---

**작업 10 (레거시 제거)**  
- 조건: 모든 API가 NestJS(core-api)에서 정상 동작한 뒤에만 실행.  
- 실행: `legacy/express-api` 삭제. (현재는 DEPRECATED README만 적용, 폴더는 참고용 유지.)

---

- 폴더 구조·API 경로·인증·환경 변수·DB 규칙은 `00-server-architecture.md`, `STRUCTURE.md` 및 본 문서와 일치해야 한다.
