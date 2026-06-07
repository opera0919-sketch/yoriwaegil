# 요리외길 채유나 (RecipeBox) — 프로젝트 스펙

한국어 레시피 웹앱. 채유나가 실제 사용하는 **웹 단일 앱**이다. (과거 공존하던 Expo 모바일 앱은 미사용으로 삭제됨.)

## 구조 / 배포
- **앱 본체:** `recipe-box.jsx` — 단일 파일 React 컴포넌트(~2,000줄, 로컬 import 없음, 자체 완결).
- **빌드:** `web/` (Vite). CI가 빌드 시 `recipe-box.jsx` → `web/src/recipe-box.jsx`로 복사 후 `web`에서 `npm ci && npm run build`.
- **배포:** GitHub Pages 자동배포. `.github/workflows/deploy-web.yml`이 `web/**`·`recipe-box.jsx`·워크플로우 파일 push 시 트리거. **master에 push하면 자동 반영된다.**
- **빌드 검증(로컬):** `cp recipe-box.jsx web/src/recipe-box.jsx && cd web && npm run build`

## 백엔드
- **Supabase** (project ref: `fbkriifozbwuaoegmmcf`). URL·anon 키는 `recipe-box.jsx` 상단에 하드코딩됨.
- **Edge Function `import-recipe`** (`supabase/functions/import-recipe/index.ts`) — 레시피 가져오기 백엔드.
  - 유튜브 링크 → **Gemini 2.5-flash 네이티브 영상 분석**(화면+음성 직접 이해, `MEDIA_RESOLUTION_LOW`로 토큰 절약).
  - 그 외(요리 이름·글 URL·텍스트) → Gemini + Google Search 그라운딩.
  - 분석 불가(비공개·삭제) 영상 → `{ needsManualInput: true }` 폴백.
  - 응답: `{ text: "<레시피 JSON 문자열>", source }` — 클라이언트가 기존 파서/`normalize()`로 처리.
  - **Gemini API 키는 서버 시크릿 `GEMINI_API_KEY`로만 보관**(클라이언트 비노출).
  - 배포: `npx supabase functions deploy import-recipe` (먼저 `$env:SUPABASE_ACCESS_TOKEN` 설정 또는 `supabase login`).
  - 키 교체: `npx supabase secrets set GEMINI_API_KEY=<새키>` (코드 변경·재배포 불필요, 다음 호출부터 적용).

## AI 가져오기 흐름
`recipe-box.jsx`의 `AIImport` → `POST {SUPABASE_URL}/functions/v1/import-recipe` (body `{input}`, `Authorization: Bearer <anon>`) → 응답 `text` 파싱 → `normalize()` → 미리보기 → 저장.

## 작업 규칙
1. "사용자가 보는 화면/웹" 요구는 **`recipe-box.jsx`에서** 작업한다.
2. 배포를 일으키려면 `recipe-box.jsx` 또는 `web/` 변경이 필요하다.
3. **추측 금지** — "왜 실패하나"는 실제 응답/에러/실행 중 빌드부터 확인한다. 데이터 없으면 "모른다, 로깅부터".
4. prod push는 사용자 확인 후 진행한다.
5. 요청하지 않은 기능을 임의로 추가하지 않는다.
