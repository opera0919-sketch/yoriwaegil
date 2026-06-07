# import-recipe (Supabase Edge Function)

레시피 가져오기 백엔드. 유튜브 링크면 **Gemini가 영상을 직접(화면+음성) 분석**해 레시피화하고,
그 외 입력(요리 이름·글 URL·텍스트)은 Gemini + Google Search 그라운딩으로 처리한다.
Gemini API 키는 클라이언트에 노출하지 않고 이 함수의 시크릿으로만 보관한다.

> 참고: 초기엔 서버에서 유튜브 자막을 직접 스크래핑하려 했으나, 클라우드(데이터센터) IP는
> 유튜브가 봇 페이지를 반환해 자막을 못 가져온다(전 영상 실패 확인). 그래서 Gemini에 유튜브 URL을
> 직접 넘기는 **네이티브 영상 분석**으로 전환했다. 영상 토큰 절약을 위해 `MEDIA_RESOLUTION_LOW` 사용.

## 입출력

- 요청: `POST` body `{ "input": "<유튜브 링크 | 요리 이름 | URL | 텍스트>" }`
- 응답:
  - 성공: `{ "text": "<모델이 출력한 레시피 JSON 문자열>", "source": { "url": "", "title": "" } }`
  - 자막 없음: `{ "needsManualInput": true }`
  - 오류: `{ "error": "..." }`

클라이언트(`recipe-box.jsx`)는 `text`를 기존 파서/`normalize()`로 처리한다.

## 배포

```bash
# 1) 로그인 & 프로젝트 연결 (최초 1회)
npx supabase login
npx supabase link --project-ref fbkriifozbwuaoegmmcf

# 2) Gemini API 키를 시크릿으로 등록 (웹에서 쓰던 VITE_GEMINI_API_KEY 값과 동일)
npx supabase secrets set GEMINI_API_KEY=<your_gemini_api_key>

# 3) 배포
npx supabase functions deploy import-recipe
```

## 참고 / 한계

- 유튜브 영상은 Gemini 2.5-flash에 `fileData.fileUri`로 직접 전달해 화면+음성을 분석한다.
  **공개 영상만** 가능하며, 비공개·삭제·분석 불가 영상은 `needsManualInput: true`로 폴백한다.
- 무료 플랜에서 동작하나 영상은 토큰 소모가 크다(저해상도 ~100토큰/초). 긴 영상은 250K TPM 한도 주의.
  무료 플랜 유튜브 입력은 하루 8시간 제한이 있다.
