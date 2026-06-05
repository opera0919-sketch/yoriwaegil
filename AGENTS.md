# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# 이 저장소에는 두 개의 분리된 앱이 있다 — 작업 전 반드시 구분하라

- **라이브(사용자가 실제 쓰는 웹):** `recipe-box.jsx` (단일 파일) → `web/`(Vite) → GitHub Pages 자동 배포
- **미배포 모바일:** `app/`, `lib/` (Expo RN). 웹에 영향 없음.

## 규칙
1. "사용자가 보는 화면/웹" 관련 요구는 `recipe-box.jsx`에서 작업한다. `app/`·`lib/`이 아니다.
2. 배포는 `.github/workflows/deploy-web.yml`이 `web/**`·`recipe-box.jsx`·워크플로우 변경 시에만 트리거된다. `app/`·`lib/` 커밋은 배포되지 않는다.
3. 무엇을 고치기 전에 "이 변경이 사용자가 실행 중인 빌드에 실제로 도달하는가"를 먼저 확인한다.
4. "왜 실패하나"는 추측을 나열하지 말고 실제 응답/에러/실행 중 빌드부터 확인한다. 데이터가 없으면 "모른다, 로깅부터"라고 말한다. 신뢰도 별점으로 추측을 확신처럼 포장 금지.
5. API 동작을 바꾸는 변경은 빌드/테스트로 검증 후에만 반영한다. 요청하지 않은 기능(예: grounding)을 임의로 추가하지 않는다.
6. 빌드 검증: `cp recipe-box.jsx web/src/recipe-box.jsx && cd web && npm run build`
7. prod 배포(push)는 커밋까지만 하고 사용자 확인을 받은 뒤 push한다.
