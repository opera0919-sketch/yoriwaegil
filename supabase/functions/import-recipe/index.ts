// Supabase Edge Function: import-recipe
// 요리 레시피 가져오기 백엔드.
//  - YouTube 링크 → 자막(음성+자막) 추출 → Gemini 로 레시피화
//  - 그 외(요리 이름 / 글 URL / 텍스트) → Gemini + Google Search 그라운딩
// Gemini API 키는 서버 시크릿(GEMINI_API_KEY)으로만 보관 → 클라이언트 노출 방지.

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_MODEL = "gemini-2.5-flash";

// Supabase가 Edge Function 런타임에 자동 주입하는 값들 (별도 시크릿 설정 불필요)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

/* ---------------- Auth ----------------
   로그인한 사용자의 액세스 토큰만 허용한다.
   anon 키만으로 호출하면 거부 → 외부인이 Gemini 쿼터를 소모하는 것을 차단. */
async function isLoggedInUser(req: Request): Promise<boolean> {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token || token === SUPABASE_ANON_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ---------------- YouTube helpers ---------------- */

function youtubeId(input: string): string | null {
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?[^ ]*\bv=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  return null;
}

/* ---------------- Gemini ---------------- */

const SCHEMA_RULES = `반드시 아래 JSON 형태만 출력하고 그 외 설명은 절대 하지 마라.
{"title":"요리명","category":"한식","description":"설명","baseServings":2,"totalMinutes":30,"difficulty":"보통","tags":["태그"],"ingredients":[{"name":"재료명","amount":1,"unit":"개","group":"채소"}],"steps":[{"title":"단계","content":"설명","timerSeconds":null}]}
규칙:
- description은 반드시 한 문장(한 줄)으로, 음식 평론가처럼 핵심 맛·식감·정체성을 함축적으로 표현해라. 절대 두 문장 이상 쓰지 마라.
- category는 "한식"·"중식"·"양식"·"일식"·"기타" 중 하나. difficulty는 "쉬움"·"보통"·"어려움" 중 하나. group은 "채소"·"육류·해산물"·"양념·소스"·"기타" 중 하나.
- amount는 반드시 아라비아 숫자만 넣어라(예: 1, 2, 0.5). "적당히"·"약간" 같은 표현은 쓰지 말고 숫자로 추정해라(모르면 1). unit은 "g"·"개"·"큰술"·"작은술"·"대"·"모"·"공기"·"ml"·"약간" 등 짧게.
- timerSeconds는 끓이기·삶기·재우기 등 기다림 단계에만 초 단위 숫자로 넣고 나머지는 null.`;

const SYS_SEARCH = `너는 요리 레시피를 구조화된 JSON으로 변환하는 전문가야.
사용자가 준 요리 이름, URL, 또는 레시피 텍스트를 바탕으로 레시피를 작성해.
URL이나 요리 이름만 주어지면 구글 검색을 통해 신뢰할 수 있는 정보를 찾아 한국식 가정 레시피로 재구성해.
입력이 요리 이름이면 반드시 그 이름을 title에 그대로 사용하고, 비슷하거나 더 유명한 다른 요리로 절대 대체하지 마라(예: "계란국" 입력 시 title은 반드시 "계란국").
${SCHEMA_RULES}`;

const SYS_VIDEO = `너는 요리 유튜브 영상을 화면과 음성으로 직접 보고 레시피를 구조화된 JSON으로 정리하는 전문가야.
진행자가 말하는 분량·시간이 흐릿하면 화면에 보이는 재료·조리 동작을 근거로 합리적으로 추정해서 정확한 재료 분량과 단계를 복원하라.
title은 영상에서 만드는 요리 이름으로 정하라(영상 제목의 채널명·수식어는 제외).
${SCHEMA_RULES}`;

// 유튜브 영상을 Gemini가 직접(화면+음성) 분석. 저해상도로 영상 토큰 절약(무료 플랜 한도 보호).
async function callGeminiVideo(videoUrl: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    systemInstruction: { parts: [{ text: SYS_VIDEO }] },
    contents: [
      {
        role: "user",
        parts: [
          { fileData: { fileUri: videoUrl } },
          { text: "이 요리 영상을 보고 레시피를 위 형식의 JSON으로 정리해줘." },
        ],
      },
    ],
    generationConfig: { mediaResolution: "MEDIA_RESOLUTION_LOW" },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(`Gemini-video ${res.status}: ${(e as { error?: { message?: string } })?.error?.message ?? ""}`);
  }
  const data = await res.json();
  const cand = data.candidates?.[0];
  const text: string = (cand?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("\n");
  return { text };
}

async function callGemini(sys: string, userText: string, useSearch: boolean) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: sys }] },
    contents: [{ role: "user", parts: [{ text: userText }] }],
  };
  if (useSearch) body.tools = [{ googleSearch: {} }];

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(`Gemini ${res.status}: ${(e as { error?: { message?: string } })?.error?.message ?? ""}`);
  }
  const data = await res.json();
  const cand = data.candidates?.[0];
  const text: string = (cand?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("\n");
  const chunk = cand?.groundingMetadata?.groundingChunks?.find((c: { web?: { uri?: string } }) => c.web?.uri);
  const source = chunk ? { url: chunk.web.uri, title: chunk.web.title ?? "" } : { url: "", title: "" };
  return { text, source };
}

/* ---------------- Handler ---------------- */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!GEMINI_API_KEY) return json({ error: "GEMINI_API_KEY 미설정" }, 500);
  if (!(await isLoggedInUser(req))) return json({ error: "로그인이 필요해요" }, 401);

  let input = "";
  try {
    const b = await req.json();
    input = String(b.input ?? "").trim();
  } catch {
    return json({ error: "잘못된 요청" }, 400);
  }
  if (!input) return json({ error: "입력이 비어있어요" }, 400);

  try {
    const vid = youtubeId(input);
    if (vid) {
      try {
        const { text } = await callGeminiVideo(`https://www.youtube.com/watch?v=${vid}`);
        if (!text.trim()) return json({ needsManualInput: true });
        return json({ text, source: { url: input, title: "" } });
      } catch (e) {
        // 비공개·삭제·분석 불가 영상 → 수동 입력 안내로 폴백
        console.error("video analyze failed:", e);
        return json({ needsManualInput: true });
      }
    }

    // 비영상 입력 → 검색 그라운딩
    const { text, source } = await callGemini(SYS_SEARCH, input, true);
    return json({ text, source });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 502);
  }
});
