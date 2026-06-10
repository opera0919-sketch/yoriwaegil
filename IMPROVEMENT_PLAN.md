# 요리외길 채유나 — 프로젝트 리뷰 및 개선 작업계획

> 2026-06-10 기준 코드베이스(`recipe-box.jsx` 2,102줄, Edge Function `import-recipe`, `web/` Vite 빌드) 전수 리뷰 결과.

## 1. 프로젝트 히스토리 요약

| 단계 | 내용 |
|---|---|
| 초기 | Supabase 기반 공유 레시피 웹앱 + GitHub Pages 자동배포 구축 |
| 단일화 | `recipe-box.jsx` 단일 소스로 정리, Claude 아티팩트/Vite 빌드 겸용 → 이후 Vite 단일화 |
| AI 가져오기 | 클라이언트 Gemini 직호출 → **Edge Function으로 서버사이드 이전**(키 보호), 검색 그라운딩 → 2.5-flash 네이티브 영상 분석으로 진화 |
| 소셜 기능 | 구글 OAuth, 프로필(이모지·닉네임), 댓글·별점·조리기록, Supabase Realtime 동기화 |
| 정리 | 미사용 Expo 모바일 앱 제거 → 웹 단일 앱 |

현재 구현: 레시피 목록(검색/카테고리/즐겨찾기/정렬) · 상세(인분 환산, 단계별 타이머) · 요리 모드(전체화면 스텝) · 장보기(재료 합산·복사) · AI 가져오기(미리보기 확인 후 등록) · 댓글/별점/조리기록 · 실시간 동기화.

---

## 2. 발굴한 개선 사항

### A. 보안·데이터 안정성 (가장 먼저)

| # | 문제 | 위치 | 제안 |
|---|---|---|---|
| A1 | CI가 `VITE_GEMINI_API_KEY`를 빌드에 주입하는데, 이를 읽는 클라이언트 상수(`recipe-box.jsx:1773`)는 **이제 아무 데서도 안 쓰임**. 시크릿이 설정돼 있으면 공개 번들에 Gemini 키가 노출됨 | `deploy-web.yml`, `recipe-box.jsx:1771-1776` | 워크플로 `env` 제거 + 죽은 상수 제거. GitHub 시크릿 자체도 삭제, 노출 이력 있으면 키 교체 |
| A2 | RLS 비활성 전제(연결 오류 화면이 `disable row level security`를 안내). anon 키만 있으면 **누구나 모든 레시피 삭제/수정 가능** | Supabase, `recipe-box.jsx:1035-1041` | `recipes`/`app_users` RLS 활성화: 읽기 public, 쓰기 `authenticated`. 오류 화면 안내문도 교체 |
| A3 | Edge Function이 무인증 — anon 키로 Gemini 무한 호출 가능(비용·쿼터 위험) | `import-recipe/index.ts` | JWT 검증(로그인 사용자만) 또는 간단한 rate limit |
| A4 | 동시 수정 유실: `favorites`/`comments`/`cookLogs`를 **jsonb 배열 통째로 덮어쓰기**(last-write-wins). 두 사용자가 동시에 누르면 한쪽 변경 소실 | `update()` `recipe-box.jsx:890` | 단기: Postgres RPC로 원자적 배열 병합. 장기: 댓글·조리기록을 별도 테이블 분리 |

### B. 성능

| # | 문제 | 위치 | 제안 |
|---|---|---|---|
| B1 | supabase-js를 `esm.sh` CDN에서 **런타임 로드**(npm 패키지가 설치돼 있는데 번들에 미포함) — 초기 로드 지연 + CDN 장애 시 앱 전체 다운 | `recipe-box.jsx:2`, `vite.config.js` | Vite `resolve.alias`로 esm.sh URL → npm 패키지 매핑해 번들링 |
| B2 | Pretendard 폰트를 JS 실행 후 CSS `@import`로 발견 — 폰트 늦게 로드(FOUT) | `recipe-box.jsx:14` | `index.html`에 `<link rel="preload">` + dynamic-subset woff2 |
| B3 | 초기 로드 시 users → recipes **순차** 2회 쿼리 | `recipe-box.jsx:727-769` | `Promise.all` 병렬화 |
| B4 | 검색 타이핑마다 그리드 전체 entry 애니메이션 재실행 | `.rb-card` animation | 최초 마운트에만 애니메이션 적용 |

### C. UX·사용성 (주방 시나리오 기준)

| # | 문제 | 제안 |
|---|---|---|
| C1 | **타이머가 setInterval 기반** — 화면 꺼짐/백그라운드 탭에서 브라우저 스로틀로 시간이 밀림. 요리 앱에 치명적 | `endAt` timestamp 기반 계산으로 변경 + 요리 모드에서 **Wake Lock API**(화면 꺼짐 방지) + 종료 시 소리·Notification |
| C2 | **장보기 체크/인분 상태가 메모리 전용** — 마트에서 새로고침하면 체크가 전부 날아감 | localStorage(또는 DB) 보존 |
| C3 | 레시피 카드가 텍스트뿐 — 시각적 구분 어려움 | 유튜브 출처 레시피는 `i.ytimg.com/vi/{id}/hqdefault.jpg` 썸네일 자동 표시(추가 컬럼 불필요, sourceUrl에서 파생 가능) |
| C4 | AI 가져오기 대기 UX — 영상 분석은 30초+ 걸리는데 스피너 한 줄뿐, 타임아웃도 없음 | 단계별 진행 메시지 + `AbortController` 타임아웃. 미리보기에서 **바로 수정 가능**(직접입력 폼 프리필) |
| C5 | URL 라우팅 없음 — 상세 화면 공유 불가, 모바일 뒤로가기 시 앱 이탈 | 해시 라우팅(`#/recipe/:id`) + 뒤로가기로 시트 닫힘 |
| C6 | PWA 아님 — 홈화면 설치·오프라인 조회 불가 | manifest + 서비스워커(레시피 캐시). 주방 앱 특성상 가치 큼 |
| C7 | 개인 메모(`notes`) — 데이터 모델·CSS(`.rb-note`)는 있는데 **UI가 없음**(과거 기능 잔재) | 상세에 "내 메모" 섹션 복원 또는 데이터 정리 중 택1 |
| C8 | 초성 검색 미지원(ㄱㅊㅉㄱ → 김치찌개) | 검색 매처에 초성 분해 추가 |
| C9 | 기본 정렬이 DB 반환 순서(사실상 무작위) | 기본값을 "최근 추가순"으로 |
| C10 | 삭제가 `window.confirm` + 실행취소 없음 | 토스트에 "실행취소" 버튼 |

### D. 디자인·접근성

- D1. 시트/모달: ESC·스와이프 닫기, 포커스 트랩 없음. 아이콘 버튼이 `div`(키보드 접근 불가), `aria-label` 부재.
- D2. 다크 모드 없음 — CSS 변수 구조라 `prefers-color-scheme` 대응 비용 낮음.
- D3. `og:` 메타태그 없음 — 카톡 등 공유 시 미리보기 카드 없음.

### E. 코드·CI 위생

- E1. PR 빌드 검증 워크플로 없음(master push에서만 빌드) → PR마다 `npm run build` 체크 추가.
- E2. 죽은 코드 정리: 클라이언트 `GEMINI_API_KEY`/`GEMINI_MODEL`(A1), `.rb-note`/`.rb-other-notes` CSS, localStorage 마이그레이션 경로(`migrateRecipes` — DB가 비어있을 일이 더는 없음).
- E3. Edge Function에서 Gemini `responseMimeType: "application/json"` + `responseSchema` 사용 → 클라이언트의 정규식 JSON 수선(`recipe-box.jsx:1816-1826`) 대부분 제거 가능, 파싱 실패율 감소.

---

## 3. 작업계획 (제안 순서)

### Phase 1 — 보안·데이터 보호 ✅ 완료 (2026-06-10)
1. ✅ A1: 워크플로 시크릿 주입 제거 + 죽은 상수 삭제
2. ✅ A2: RLS 정책 적용 완료(읽기 anon / 쓰기 authenticated, `supabase/migrations/20260610000000_enable_rls.sql`) — **라이브 DB에 적용·검증됨**
3. ✅ A3: Edge Function 로그인 사용자 제한 — 코드 완료, **master 배포 후 함수 재배포 필요** (순서 중요: 웹 먼저)
4. ✅ C2: 장보기 체크·인분 localStorage 보존

### Phase 2 — 체감 성능 ✅ 완료 (2026-06-10)
5. ✅ B1: supabase-js 번들링(bare import 전환)
6. ✅ B2: 폰트 dynamic-subset preload / ✅ B3: 초기 쿼리 병렬화 / ✅ B4: 검색 중 애니메이션 지연 제거

### Phase 3 — 핵심 UX (1~2일)
7. C1: 타이머 timestamp화 + Wake Lock + 종료 알림
8. C3: 유튜브 썸네일 카드
9. C4: AI 가져오기 진행 표시 + 타임아웃 + 미리보기 편집
10. C5: 해시 라우팅 + 뒤로가기 닫기

### Phase 4 — 마감·품질 (점진)
11. E3: Gemini JSON 스키마 응답 / E1: PR 빌드 CI / E2: 죽은 코드 정리
12. C6 PWA → C8 초성검색 → C9 기본 정렬 → C10 undo → C7 메모 → D1~D3 접근성·다크모드·og 태그
13. A4: 동시 수정 병합(RPC 또는 테이블 분리) — 사용자 수 늘면 우선순위 상향

> 각 Phase는 독립 배포 가능. prod(master) 반영은 작업 규칙대로 사용자 확인 후 진행.
