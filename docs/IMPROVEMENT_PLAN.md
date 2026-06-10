# 요리외길 채유나 (RecipeBox) — 프로젝트 리뷰 & 개선 계획

> 2026-06 기준. `recipe-box.jsx`(2,102줄), `supabase/functions/import-recipe/index.ts`,
> `web/`(Vite), `.github/workflows/deploy-web.yml` 전체 코드와 git 히스토리를 검토한 결과.

---

## 1. 프로젝트 히스토리 요약

| 단계 | 커밋 | 내용 |
|---|---|---|
| 탄생 | `09282b3` | Supabase 기반 공유 레시피 웹앱 (Claude 아티팩트 출신) |
| 배포 | `96c9ba6`~`4d47720` | Vite 웹 빌드 + GitHub Pages 자동배포, 단일 소스(`recipe-box.jsx`)로 정리 |
| 백엔드 정리 | `7565415`, `cfc5c1c` | supabase-js → raw fetch 전환(이후 OAuth 도입으로 SDK 복귀), AI 가져오기를 Gemini로 교체 |
| 소셜 기능 | `339b4d2`~`cac76d3` | 댓글·별점·장보기 인분·토스트·검색바 개선 |
| 계정 체계 | `51a5268`~`9b9792c` | 구글 OAuth 로그인(계정=구글), 프로필(이모지·닉네임), 첫 로그인 설정 플로우 |
| 안정화 | `2d3ace9`~`851a2e2` | 프로필 저장 await 누락, 분량 누락, DB 미저장/샘플 초기화, UPDATE 비컬럼 키 오류 등 수정 |
| AI 고도화 | `1ef229d`~`a50005c` | Gemini 2.0→2.5-flash, Search 그라운딩, 등록 전 미리보기 확인, 유튜브 네이티브 영상 분석 |
| 단일화 | `22b6029` | 미사용 Expo 모바일 앱 제거 — 웹 단일 앱 |

## 2. 현재 구현 상태

- **프론트:** 단일 파일 React 컴포넌트. 탭 2개(저장된 레시피 / 장보기), 검색·카테고리 필터·정렬·즐겨찾기, 레시피 상세(인분 환산·단계 타이머·댓글·별점·조리 기록), 풀스크린 요리 모드(단계 진행 + 타이머 + 완료 평가), 장보기(레시피별 인분 조절 + 재료 그룹별 합산 + 체크 + 복사), AI 가져오기(이름/URL/유튜브/텍스트 → 미리보기 → 등록), 직접 입력/편집 폼, 구글 OAuth + 이모지 프로필.
- **데이터:** Supabase `recipes`·`app_users` 두 테이블. 댓글·조리기록·즐겨찾기·장바구니가 모두 `recipes` 행의 JSON 컬럼. Realtime 구독으로 다기기 동기화. 낙관적 업데이트 + 실패 시 롤백.
- **백엔드:** Edge Function `import-recipe` — 유튜브는 Gemini 2.5-flash 영상 직접 분석(LOW 해상도), 그 외는 Search 그라운딩. API 키는 서버 시크릿.
- **배포:** master push → GitHub Pages 자동배포.

## 3. 개선 계획

우선순위: **P0**(안정성·보안 — 먼저), **P1**(사용성 핵심), **P2**(UX 폴리시), **P3**(성능·구조 다듬기).
각 항목은 독립적으로 작업·배포 가능.

### P0 — 안정성 / 보안

1. **RLS 활성화 + 정책 설계** `[보안]`
   현재 에러 화면이 "RLS를 끄세요"를 안내할 정도로 RLS 꺼짐이 전제다. anon 키는 번들에 공개되므로 **누구나 REST API로 전체 레시피를 수정·삭제 가능**한 상태.
   - `recipes`/`app_users`: SELECT는 공개(둘러보기 유지), INSERT/UPDATE/DELETE는 `auth.uid()` 인증 필요.
   - `app_users`는 본인 행만 UPDATE 가능하게.
   - 클라이언트 `requireLogin()`은 UI 가드일 뿐이므로 서버 측 강제와 짝을 맞춘다.
   - 에러 화면의 "RLS 비활성화 SQL 안내" 문구 제거.

2. **Edge Function 남용 방지** `[보안][비용]`
   `import-recipe`는 anon 키만 있으면 누구나 호출 가능 → Gemini 무료 한도/비용 소진 공격에 노출. JWT 검증(로그인 사용자만 호출) 또는 최소한의 rate limit 추가.

3. **supabase-js 런타임 CDN 의존 제거** `[성능][안정성]`
   `recipe-box.jsx`가 `https://esm.sh/@supabase/supabase-js@2`를 import → Vite는 절대 URL을 external 처리하므로 **배포본이 매 방문 esm.sh에 의존**(esm.sh 장애 = 앱 다운, 버전 고정도 `@2` 메이저뿐). `web/package.json`의 npm 패키지는 미사용.
   → `vite.config.js`에 `resolve.alias`로 esm.sh URL → npm 패키지 매핑(아티팩트 호환 유지) 또는 import 문 자체를 교체.

4. **죽은 Gemini 클라이언트 코드 정리** `[보안][정리]`
   `recipe-box.jsx`의 `GEMINI_API_KEY`/`GEMINI_MODEL` 상수(1773~1776행)는 Edge Function 전환 후 미사용. CI의 `VITE_GEMINI_API_KEY` 주입도 함께 제거(시크릿이 설정돼 있으면 공개 번들에 키가 박힐 수 있는 경로).

### P1 — 사용성 핵심 (요리하는 순간의 경험)

5. **요리 모드 화면 꺼짐 방지 — Wake Lock API** `[UX]`
   요리 중 폰 화면이 꺼지는 게 이 앱 최대 사용성 구멍. `navigator.wakeLock.request("screen")`을 요리 모드 진입 시 요청, 종료/visibilitychange 시 해제·재요청. 미지원 브라우저는 조용히 무시.

6. **타이머를 timestamp 기반으로 재설계** `[UX][정확성]`
   현재 1초 `setInterval` 감산 방식 → 백그라운드 탭에서 인터벌이 스로틀되어 **타이머가 사실상 멈추고 알람도 안 울림**. 시작 시각(endAt) 저장 + 표시 시 `endAt - now` 계산으로 변경, 복귀 시 즉시 보정. 종료 알림은 beep + (권한 허용 시) Notification API. 타이머 구동 중 앱 전체가 매초 리렌더되는 문제도 함께 해소(타이머 상태를 하위 컴포넌트로 격리).

7. **PWA화 — 홈 화면 설치 + 기본 오프라인** `[UX]`
   가족용 모바일 웹앱인데 매번 브라우저로 접속. manifest(아이콘·이름·standalone) + 서비스워커(앱 셸 캐시, 레시피는 마지막 데이터 캐시)로 "앱처럼" 설치 가능하게. 장보기 목록은 마트(오프라인 빈번)에서 보는 화면이므로 오프라인 열람 가치가 특히 큼.

8. **장보기 상태 영속화** `[UX][버그성]`
   체크 상태(`checked`)와 레시피별 인분(`servingsMap`)이 메모리에만 있어 **탭 전환·새로고침 시 전부 초기화**(특히 `servingsMap`은 컴포넌트 state라 탭만 바꿔도 리셋). localStorage(개인 데이터이므로 충분)에 저장.

9. **댓글·조리기록 동시 수정 유실 방지** `[데이터]`
   댓글이 `recipes.comments` JSON 배열 통째 UPDATE라 두 사람이 동시에 댓글 달면 한쪽이 사라짐(last-write-wins). 별도 `comments` 테이블 분리(또는 jsonb append RPC). 분리하면 Realtime 반영도 자연스러워짐.

### P2 — UX / 디자인 폴리시

10. **레시피 대표 이미지** `[디자인]`
    카드가 텍스트뿐이라 그리드가 단조롭고 스캔이 느림. (a) 유튜브 출처면 썸네일(`i.ytimg.com/vi/{id}/hqdefault.jpg`) 자동 사용, (b) 직접 업로드(Supabase Storage)는 후순위. 이미지 없으면 카테고리 색 그라데이션 placeholder.

11. **네이티브 `confirm()`/토스트 개선** `[디자인]`
    - 레시피 삭제가 브라우저 기본 `confirm()` — 앱 톤에 맞는 확인 시트로 교체.
    - 토스트가 실패 메시지에도 체크 아이콘 + 동일 스타일 → 성공/오류 변형 추가(`toast.error`), 오류는 색·아이콘 구분.

12. **요리 모드 보강** `[UX]`
    - 진행 중 **재료를 볼 수 없음** → 하단 시트로 재료(현재 인분 환산) 열람.
    - 단계 점프(진행바 탭 또는 단계 리스트), 좌우 스와이프 전환.
    - 비로그인으로 요리 완료 시 기록이 조용히 로그인 시트로 빠지는 흐름 정리(기록 없이 종료 선택지 제공).

13. **접근성·모바일 디테일** `[접근성][모바일]`
    - `rb-ico` 등 클릭 가능한 `div` → `button`으로, aria-label 부여.
    - 오버레이/시트: ESC 닫기, 포커스 트랩, 배경 스크롤 잠금(현재 시트 뒤 body 스크롤 가능).
    - `100vh`/`92vh` → `dvh` 단위(iOS Safari 주소창 점프 대응).
    - 카드 별점(15px)·댓글 삭제 등 터치 타깃 44px 확보.

14. **"만들어 봄" 해제 시 조리 횟수 유실** `[데이터][UX]`
    체크 해제가 `count: 0`으로 덮어써 누적 기록이 사라짐. 해제는 표시만 끄고 count는 보존하거나, 해제 시 경고.

15. **정렬 기본값 정리** `[UX]`
    "기본순"이 사실상 DB 임의 순서. 기본을 "최근 추가순"으로 하고 선택지를 명확한 이름으로 정리.

### P3 — 성능 / 구조

16. **검색·그리드 렌더 최적화** `[성능]`
    검색 입력 키 입력마다 전체 트리 리렌더 → 카드 컴포넌트 분리 + `React.memo`, 검색어에 `useDeferredValue`. 카드 등장 애니메이션 `i * 0.04s` 지연은 상한(예: 12장)을 둬 레시피가 많아져도 후반 카드가 늦게 뜨지 않게.

17. **Edge Function 구조화 출력** `[안정성]`
    현재 클라이언트가 정규식으로 JSON을 "수선"(amount 문자열화 등)하는 취약한 파이프라인. Gemini `responseMimeType: "application/json"` + `responseSchema`를 쓰면 수선 로직 대부분 제거 가능. (단, googleSearch 도구와 responseSchema 동시 사용 제약은 사전 확인 필요 — 영상 경로만 우선 적용해도 됨.)

18. **폰트 로딩 개선** `[성능]`
    Pretendard를 CSS `@import`(jsdelivr, 전체 웨이트 static CSS)로 로드 → 사용 웨이트(400/600/700)만 woff2 self-host 또는 `<link rel=preload>` + `font-display: swap`. 첫 페인트 체감 개선.

19. **레거시 정리** `[정리]`
    localStorage → DB 마이그레이션 코드(`recipebox:v1:*`, `migrateRecipes`)는 이행 완료 후 제거 가능. DB가 비면 샘플 데이터를 재시드하는 로직도 운영 데이터가 자리 잡은 지금은 의도치 않은 동작 위험이 더 크므로 빈 상태 UI로 대체 검토.

## 4. 제안 작업 순서

1. **1차 (보안·기반):** P0 전체 — RLS 정책, Edge Function 가드, esm.sh alias, 죽은 키 코드 제거. *(DB 정책 변경은 실서비스 영향이 있으므로 적용 전 사용자 확인)*
2. **2차 (요리 경험):** #5 Wake Lock → #6 타이머 재설계 → #8 장보기 영속화. 셋 다 작고 효과가 즉각적.
3. **3차 (설치형 앱):** #7 PWA, #10 썸네일.
4. **4차 (폴리시):** #11~#15를 묶어 한 번에, 이후 P3는 여유 있을 때.

— 각 항목은 `recipe-box.jsx` 단일 파일 원칙(작업 규칙 1)을 유지한 채 구현 가능하며, 배포는 기존 master push 플로우를 그대로 따른다.
