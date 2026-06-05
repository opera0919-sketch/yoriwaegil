import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, CATS, GROUPS } from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';
import { useRecipes } from '../hooks/useRecipes';
import { importRecipeWithAI } from '../lib/ai';
import { Ingredient, Recipe, Step } from '../lib/types';

const uid = () => Math.random().toString(36).slice(2, 9);

type Mode = 'ai' | 'manual';

export default function AddScreen() {
  const { user } = useAuth();
  const { addRecipe } = useRecipes(user?.id);
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('ai');

  const handleAdd = async (data: Omit<Recipe, 'id' | 'user_id'>) => {
    await addRecipe(data);
    router.back();
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>레시피 추가</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.soft} />
        </TouchableOpacity>
      </View>

      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, mode === 'ai' && s.tabOn]} onPress={() => setMode('ai')}>
          <Ionicons name="sparkles" size={14} color={mode === 'ai' ? '#fff' : Colors.soft} />
          <Text style={[s.tabText, mode === 'ai' && s.tabTextOn]}>AI로 가져오기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, mode === 'manual' && s.tabOn]} onPress={() => setMode('manual')}>
          <Ionicons name="pencil" size={14} color={mode === 'manual' ? '#fff' : Colors.soft} />
          <Text style={[s.tabText, mode === 'manual' && s.tabTextOn]}>직접 입력</Text>
        </TouchableOpacity>
      </View>

      {mode === 'ai' ? <AIImport onAdd={handleAdd} /> : <ManualForm onAdd={handleAdd} />}
    </View>
  );
}

function AIImport({ onAdd }: { onAdd: (r: Omit<Recipe, 'id' | 'user_id'>) => Promise<void> }) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [preview, setPreview] = useState<Omit<Recipe, 'id' | 'user_id'> | null>(null);

  const run = async () => {
    if (!input.trim()) return;
    setBusy(true);
    setErr('');
    try {
      const recipe = await importRecipeWithAI(input.trim());
      setPreview(recipe);
    } catch (e) {
      console.error('[AIImport] 오류:', e);
      setErr('레시피를 불러오지 못했어요. 요리 이름을 더 구체적으로 적거나 레시피 텍스트를 직접 붙여넣어 보세요.\n' + String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setSaving(true);
    try {
      await onAdd(preview);
    } finally {
      setSaving(false);
    }
  };

  if (preview) {
    return (
      <ScrollView style={s.body} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={s.previewHeading}>가져온 레시피를 확인하세요</Text>
        <RecipePreviewCard recipe={preview} />
        <View style={s.previewActions}>
          <TouchableOpacity style={[s.btnOutline, { flex: 1 }]} onPress={() => setPreview(null)}>
            <Ionicons name="refresh-outline" size={16} color={Colors.ink} />
            <Text style={s.btnOutlineText}>다시 가져오기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnAccent, { flex: 2 }]} onPress={handleConfirm} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <><Ionicons name="checkmark" size={16} color="#fff" /><Text style={s.btnAccentText}>등록하기</Text></>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.body} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.hint}>
        요리 이름(예: <Text style={{ fontWeight: '700' }}>알리오 올리오</Text>), 레시피{' '}
        <Text style={{ fontWeight: '700' }}>URL</Text>, 또는 레시피{' '}
        <Text style={{ fontWeight: '700' }}>전체 텍스트</Text>를 붙여넣으세요.
        {'\n'}AI가 재료·단계·타이머까지 자동으로 정리해 줍니다.
      </Text>
      <TextInput
        style={s.textarea}
        value={input}
        onChangeText={setInput}
        multiline
        placeholder={'예) 백종원 김치찌개\n또는 https://...\n또는 레시피 텍스트 붙여넣기'}
        placeholderTextColor={Colors.soft}
      />
      <TouchableOpacity style={[s.btnAccent, (!input.trim() || busy) && { opacity: 0.5 }]} onPress={run} disabled={busy || !input.trim()}>
        {busy
          ? <ActivityIndicator color="#fff" />
          : <><Ionicons name="sparkles" size={16} color="#fff" /><Text style={s.btnAccentText}>AI로 정리하기</Text></>
        }
      </TouchableOpacity>
      {err ? <Text style={{ color: Colors.accent, fontSize: 12.5, marginTop: 10, lineHeight: 18 }}>{err}</Text> : null}
    </ScrollView>
  );
}

function RecipePreviewCard({ recipe }: { recipe: Omit<Recipe, 'id' | 'user_id'> }) {
  const catColor = Colors.catColor[recipe.category] ?? Colors.soft;
  return (
    <View style={s.previewCard}>
      <Text style={s.previewTitle}>{recipe.title}</Text>
      <View style={s.previewMetaRow}>
        <View style={[s.previewBadge, { backgroundColor: catColor }]}>
          <Text style={s.previewBadgeText}>{recipe.category}</Text>
        </View>
        <View style={s.previewBadgeOutline}>
          <Text style={s.previewBadgeOutlineText}>{recipe.difficulty}</Text>
        </View>
        <View style={s.previewBadgeOutline}>
          <Ionicons name="time-outline" size={12} color={Colors.soft} />
          <Text style={s.previewBadgeOutlineText}>{recipe.total_minutes}분</Text>
        </View>
        <View style={s.previewBadgeOutline}>
          <Ionicons name="people-outline" size={12} color={Colors.soft} />
          <Text style={s.previewBadgeOutlineText}>{recipe.base_servings}인분</Text>
        </View>
      </View>

      {!!recipe.description && (
        <Text style={s.previewDesc}>{recipe.description}</Text>
      )}

      {recipe.tags.length > 0 && (
        <View style={s.previewTagRow}>
          {recipe.tags.map((t) => (
            <View key={t} style={s.previewTag}>
              <Text style={s.previewTagText}>#{t}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={s.previewSection}>
        <Text style={s.previewSectionTitle}>재료 {recipe.ingredients.length}가지</Text>
        {recipe.ingredients.map((ing) => (
          <View key={ing.id} style={s.previewIngRow}>
            <Text style={s.previewIngName}>{ing.name}</Text>
            <Text style={s.previewIngAmount}>
              {ing.amount > 0 ? `${ing.amount} ${ing.unit}` : ing.unit || '-'}
            </Text>
          </View>
        ))}
      </View>

      <View style={s.previewSection}>
        <Text style={s.previewSectionTitle}>조리 {recipe.steps.length}단계</Text>
        {recipe.steps.map((step, idx) => (
          <View key={step.id} style={s.previewStepRow}>
            <View style={s.previewStepNum}>
              <Text style={s.previewStepNumText}>{idx + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {!!step.title && <Text style={s.previewStepTitle}>{step.title}</Text>}
              <Text style={s.previewStepContent} numberOfLines={2}>{step.content}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function ManualForm({ onAdd }: { onAdd: (r: Omit<Recipe, 'id' | 'user_id'>) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<typeof CATS[number]>('한식');
  const [desc, setDesc] = useState('');
  const [servings, setServings] = useState('2');
  const [minutes, setMinutes] = useState('30');
  const [difficulty, setDifficulty] = useState<'쉬움' | '보통' | '어려움'>('보통');
  const [tags, setTags] = useState('');
  const [ings, setIngs] = useState<Ingredient[]>([{ id: uid(), name: '', amount: 0, unit: '', grp: '기타' }]);
  const [steps, setSteps] = useState<(Step & { minStr: string })[]>([{ id: uid(), title: '', content: '', timer_seconds: null, minStr: '' }]);

  const submit = async () => {
    if (!title.trim()) { Alert.alert('알림', '요리 이름을 입력해 주세요.'); return; }
    await onAdd({
      title, category, description: desc,
      base_servings: Number(servings) || 2,
      total_minutes: Number(minutes) || 30,
      difficulty, note: '',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      favorite: false, in_cart: false, cook_count: 0, last_cooked_at: null, version: 1,
      ingredients: ings.filter((i) => i.name.trim()).map((i, idx) => ({ ...i, sort_order: idx })),
      steps: steps.filter((s) => s.content.trim()).map((s, idx) => ({
        id: s.id, title: s.title, content: s.content,
        timer_seconds: s.minStr ? Math.round(Number(s.minStr) * 60) : null,
        sort_order: idx,
      })),
    });
  };

  const updateIng = (id: string, patch: Partial<Ingredient>) =>
    setIngs((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i));

  const updateStep = (id: string, patch: Partial<Step & { minStr: string }>) =>
    setSteps((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));

  return (
    <ScrollView style={s.body} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={s.label}>요리 이름</Text>
      <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="예) 엄마표 김치찌개" placeholderTextColor={Colors.soft} />

      <Text style={s.label}>카테고리</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {CATS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[s.chip, category === c && { backgroundColor: Colors.catColor[c], borderColor: Colors.catColor[c] }]}
            onPress={() => setCategory(c)}
          >
            <Text style={[s.chipText, category === c && { color: '#fff' }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>인분</Text>
          <TextInput style={s.input} value={servings} onChangeText={setServings} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>조리 시간(분)</Text>
          <TextInput style={s.input} value={minutes} onChangeText={setMinutes} keyboardType="numeric" />
        </View>
      </View>

      <Text style={s.label}>난이도</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {(['쉬움', '보통', '어려움'] as const).map((d) => (
          <TouchableOpacity
            key={d}
            style={[s.chip, difficulty === d && { backgroundColor: Colors.ink, borderColor: Colors.ink }]}
            onPress={() => setDifficulty(d)}
          >
            <Text style={[s.chipText, difficulty === d && { color: '#fff' }]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>한 줄 설명</Text>
      <TextInput style={s.input} value={desc} onChangeText={setDesc} placeholder="요리 한 줄 소개" placeholderTextColor={Colors.soft} />

      <Text style={s.label}>태그 (쉼표로 구분)</Text>
      <TextInput style={s.input} value={tags} onChangeText={setTags} placeholder="매운맛, 간단" placeholderTextColor={Colors.soft} />

      <Text style={s.label}>재료</Text>
      {ings.map((ing) => (
        <View key={ing.id} style={s.ingRow}>
          <TextInput style={[s.input, { flex: 2, marginBottom: 0 }]} value={ing.name} onChangeText={(v) => updateIng(ing.id, { name: v })} placeholder="이름" placeholderTextColor={Colors.soft} />
          <TextInput style={[s.input, { width: 60, marginBottom: 0 }]} value={ing.amount > 0 ? String(ing.amount) : ''} onChangeText={(v) => updateIng(ing.id, { amount: Number(v) })} placeholder="양" keyboardType="numeric" placeholderTextColor={Colors.soft} />
          <TextInput style={[s.input, { width: 54, marginBottom: 0 }]} value={ing.unit} onChangeText={(v) => updateIng(ing.id, { unit: v })} placeholder="단위" placeholderTextColor={Colors.soft} />
          <TouchableOpacity onPress={() => setIngs((p) => p.filter((x) => x.id !== ing.id))}>
            <Ionicons name="close-circle" size={20} color={Colors.soft} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={s.addRowBtn} onPress={() => setIngs((p) => [...p, { id: uid(), name: '', amount: 0, unit: '', grp: '기타' }])}>
        <Ionicons name="add" size={16} color={Colors.ink} />
        <Text style={{ fontSize: 13, color: Colors.ink }}>재료 추가</Text>
      </TouchableOpacity>

      <Text style={[s.label, { marginTop: 8 }]}>조리 단계</Text>
      {steps.map((st, idx) => (
        <View key={st.id} style={s.stepCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Text style={s.stepNum}>{idx + 1}</Text>
            <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} value={st.title} onChangeText={(v) => updateStep(st.id, { title: v })} placeholder="단계 제목" placeholderTextColor={Colors.soft} />
            <TextInput style={[s.input, { width: 80, marginBottom: 0 }]} value={st.minStr} onChangeText={(v) => updateStep(st.id, { minStr: v })} placeholder="타이머(분)" keyboardType="numeric" placeholderTextColor={Colors.soft} />
            <TouchableOpacity onPress={() => setSteps((p) => p.filter((x) => x.id !== st.id))}>
              <Ionicons name="close-circle" size={20} color={Colors.soft} />
            </TouchableOpacity>
          </View>
          <TextInput style={[s.input, { marginBottom: 0 }]} value={st.content} onChangeText={(v) => updateStep(st.id, { content: v })} placeholder="설명" placeholderTextColor={Colors.soft} />
        </View>
      ))}
      <TouchableOpacity style={s.addRowBtn} onPress={() => setSteps((p) => [...p, { id: uid(), title: '', content: '', timer_seconds: null, minStr: '' }])}>
        <Ionicons name="add" size={16} color={Colors.ink} />
        <Text style={{ fontSize: 13, color: Colors.ink }}>단계 추가</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.btnAccent, { marginTop: 24 }, !title.trim() && { opacity: 0.5 }]} onPress={submit} disabled={!title.trim()}>
        <Ionicons name="checkmark" size={18} color="#fff" />
        <Text style={s.btnAccentText}>레시피 저장</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.ink },
  tabs: { flexDirection: 'row', gap: 8, padding: 12 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.line, borderRadius: 99,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.card,
  },
  tabOn: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  tabText: { fontSize: 13, color: Colors.soft },
  tabTextOn: { color: '#fff' },
  body: { flex: 1, padding: 16 },
  hint: { fontSize: 13, color: Colors.soft, lineHeight: 20, marginBottom: 14 },
  textarea: {
    borderWidth: 1, borderColor: Colors.line, borderRadius: 12,
    padding: 12, minHeight: 130, fontSize: 14, color: Colors.ink,
    backgroundColor: Colors.card, textAlignVertical: 'top', marginBottom: 14,
  },
  btnAccent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: 14, padding: 15,
  },
  btnAccentText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: Colors.ink, borderRadius: 14, padding: 15,
    backgroundColor: Colors.card,
  },
  btnOutlineText: { color: Colors.ink, fontWeight: '600', fontSize: 15 },
  label: { fontSize: 12, color: Colors.soft, marginBottom: 6, marginTop: 2 },
  input: {
    borderWidth: 1, borderColor: Colors.line, borderRadius: 11,
    padding: 11, fontSize: 14, color: Colors.ink,
    backgroundColor: Colors.card, marginBottom: 12,
  },
  chip: {
    borderWidth: 1, borderColor: Colors.line, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7, marginRight: 6,
    backgroundColor: Colors.card,
  },
  chipText: { fontSize: 13, color: Colors.soft },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  addRowBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.line, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.card,
    alignSelf: 'flex-start', marginBottom: 8,
  },
  stepCard: {
    borderWidth: 1, borderColor: Colors.line, borderRadius: 12,
    padding: 10, marginBottom: 8, backgroundColor: Colors.card,
  },
  stepNum: { fontSize: 14, fontWeight: '700', color: Colors.ink, width: 20, textAlign: 'center' },

  // Preview
  previewHeading: { fontSize: 13, color: Colors.soft, marginBottom: 10 },
  previewCard: {
    backgroundColor: Colors.card,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.line,
    padding: 16, marginBottom: 4,
  },
  previewTitle: { fontSize: 20, fontWeight: '700', color: Colors.ink, marginBottom: 10 },
  previewMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  previewBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  previewBadgeText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  previewBadgeOutline: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderWidth: 1, borderColor: Colors.line, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4, backgroundColor: Colors.paper,
  },
  previewBadgeOutlineText: { fontSize: 12, color: Colors.soft },
  previewDesc: { fontSize: 13, color: Colors.soft, lineHeight: 19, marginBottom: 8 },
  previewTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  previewTag: { backgroundColor: Colors.paper, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  previewTagText: { fontSize: 12, color: Colors.soft },
  previewSection: { marginTop: 12 },
  previewSectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.ink, marginBottom: 6 },
  previewIngRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  previewIngName: { fontSize: 13, color: Colors.ink },
  previewIngAmount: { fontSize: 13, color: Colors.soft },
  previewStepRow: { flexDirection: 'row', gap: 10, paddingVertical: 6 },
  previewStepNum: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.ink,
    alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0,
  },
  previewStepNumText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  previewStepTitle: { fontSize: 13, fontWeight: '600', color: Colors.ink, marginBottom: 2 },
  previewStepContent: { fontSize: 12.5, color: Colors.soft, lineHeight: 18 },
  previewActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
});
