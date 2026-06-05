import { Recipe, Ingredient, Step } from './types';
import { CATS, GROUPS } from '../constants/Colors';

const uid = () => Math.random().toString(36).slice(2, 9);

const SYSTEM_PROMPT = `너는 요리 레시피를 구조화된 JSON으로 변환하는 도구다.
중요 규칙:
- 입력이 요리 이름이면: 반드시 그 이름을 title에 그대로 사용하라. 비슷하거나 더 유명한 다른 요리로 절대 대체하지 마라. 예) "계란국" 입력 시 title은 반드시 "계란국"이어야 한다.
- 입력이 URL이면: 해당 페이지의 레시피 제목을 title로 사용하라.
- 입력이 레시피 텍스트이면: 텍스트에 명시된 요리 이름을 title로 사용하라.
반드시 아래 JSON만 출력하고 그 외 설명·마크다운·백틱은 절대 출력하지 마라.
{"title":string,"category":"한식"|"중식"|"양식"|"일식"|"기타","description":string(한문장),"base_servings":number,"total_minutes":number,"difficulty":"쉬움"|"보통"|"어려움","tags":string[],"ingredients":[{"name":string,"amount":number,"unit":string,"grp":"채소"|"육류·해산물"|"양념·소스"|"기타"}],"steps":[{"title":string(짧게),"content":string,"timer_seconds":number|null}]}
규칙: amount는 숫자, unit은 "g"·"개"·"큰술"·"작은술"·"대"·"모"·"공기"·"ml" 등 짧은 한국어. timer_seconds는 끓이기·삶기·재우기 등 기다림 단계에만 넣고 나머지는 null. content는 한국어로 친절하게.`;

export async function importRecipeWithAI(input: string): Promise<Omit<Recipe, 'id' | 'user_id'>> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_KEY ?? '';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: input }] }],
      tools: [{ google_search: {} }],
      generation_config: { temperature: 0.2 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts
    ?.filter((p: { text?: string }) => p.text)
    ?.map((p: { text: string }) => p.text)
    ?.join('\n') ?? '';

  const clean = text.replace(/```json|```/g, '').trim();
  const m = clean.match(/\{[\s\S]*\}/);
  const obj = JSON.parse(m ? m[0] : clean);
  return normalizeRecipe(obj);
}

function normalizeRecipe(obj: Record<string, unknown>): Omit<Recipe, 'id' | 'user_id'> {
  return {
    title: String(obj.title || '제목 없는 레시피'),
    category: CATS.includes(obj.category as typeof CATS[number]) ? (obj.category as Recipe['category']) : '기타',
    description: String(obj.description || ''),
    base_servings: Number(obj.base_servings) || 2,
    total_minutes: Number(obj.total_minutes) || 30,
    difficulty: (['쉬움', '보통', '어려움'] as const).includes(obj.difficulty as '쉬움') ? (obj.difficulty as Recipe['difficulty']) : '보통',
    tags: Array.isArray(obj.tags) ? (obj.tags as string[]).slice(0, 6) : [],
    favorite: false,
    in_cart: false,
    note: '',
    cook_count: 0,
    last_cooked_at: null,
    version: 1,
    ingredients: ((obj.ingredients as Record<string, unknown>[]) || []).map((i, idx) => ({
      id: uid(),
      name: String(i.name || ''),
      amount: Number(i.amount) || 0,
      unit: String(i.unit || ''),
      grp: GROUPS.includes(i.grp as typeof GROUPS[number]) ? (i.grp as Ingredient['grp']) : '기타',
      sort_order: idx,
    })),
    steps: ((obj.steps as Record<string, unknown>[]) || []).map((s, idx) => ({
      id: uid(),
      title: String(s.title || ''),
      content: String(s.content || ''),
      timer_seconds: s.timer_seconds ? Number(s.timer_seconds) : null,
      sort_order: idx,
    } as Step & { sort_order: number })),
  };
}
