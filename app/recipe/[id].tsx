import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { useState, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, GROUPS } from '../../constants/Colors';
import { Ingredient } from '../../lib/types';
import { useAuth } from '../../hooks/useAuth';
import { useRecipes } from '../../hooks/useRecipes';
import { useTimer } from '../../hooks/useTimer';
import StepTimer from '../../components/StepTimer';

const fmt = (n: number) => String(Math.round(n * 100) / 100);

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { recipes, updateRecipe, deleteRecipe } = useRecipes(user?.id);
  const router = useRouter();
  const { timers, startTimer, pauseTimer, resetTimer } = useTimer();

  const r = recipes.find((x) => x.id === id);
  const [servings, setServings] = useState(r?.base_servings ?? 2);
  const [note, setNote] = useState(r?.note ?? '');
  const [editNote, setEditNote] = useState(false);

  const factor = r ? servings / r.base_servings : 1;

  const grouped = useMemo(() => {
    const g: Record<string, Ingredient[]> = {};
    r?.ingredients.forEach((i) => (g[i.grp] = g[i.grp] || []).concat(i));
    return g;
  }, [r]);

  if (!r) return null;

  const color = Colors.catColor[r.category] ?? Colors.soft;

  const handleDelete = () => {
    Alert.alert('삭제', '이 레시피를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => { deleteRecipe(r.id); router.back(); } },
    ]);
  };

  return (
    <View style={s.container}>
      {/* header band */}
      <View style={[s.band, { backgroundColor: color }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.bandActions}>
          <TouchableOpacity onPress={() => updateRecipe(r.id, { favorite: !r.favorite })}>
            <Ionicons name={r.favorite ? 'star' : 'star-outline'} size={20} color={r.favorite ? Colors.gold : '#fff'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.title}>{r.title}</Text>
        <Text style={s.desc}>{r.description}</Text>

        <View style={s.meta}>
          <Ionicons name="time-outline" size={14} color={Colors.soft} />
          <Text style={s.metaText}>약 {r.total_minutes}분</Text>
          <Ionicons name="flame-outline" size={14} color={Colors.soft} />
          <Text style={s.metaText}>{r.difficulty}</Text>
          {r.cook_count > 0 && <>
            <Ionicons name="checkmark-circle" size={14} color={Colors.accent} />
            <Text style={s.metaText}>{r.cook_count}회 요리함</Text>
          </>}
        </View>

        {/* action buttons */}
        <View style={s.actions}>
          <TouchableOpacity style={s.btnDark} onPress={() => router.push(`/cook/${r.id}`)}>
            <Ionicons name="play" size={15} color="#fff" />
            <Text style={s.btnDarkText}>요리 모드</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btn, r.in_cart && s.btnAccent]} onPress={() => updateRecipe(r.id, { in_cart: !r.in_cart })}>
            <Ionicons name="cart-outline" size={15} color={r.in_cart ? '#fff' : Colors.ink} />
            <Text style={[s.btnText, r.in_cart && { color: '#fff' }]}>{r.in_cart ? '담김' : '장보기'}</Text>
          </TouchableOpacity>
        </View>

        {/* ingredients */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Ionicons name="list" size={16} color={Colors.ink} />
            <Text style={s.sectionTitle}>재료</Text>
            <View style={s.servingCtrl}>
              <TouchableOpacity style={s.servBtn} onPress={() => setServings((x) => Math.max(1, x - 1))}>
                <Ionicons name="remove" size={15} color={Colors.ink} />
              </TouchableOpacity>
              <Text style={s.servText}>{servings}인분</Text>
              <TouchableOpacity style={s.servBtn} onPress={() => setServings((x) => x + 1)}>
                <Ionicons name="add" size={15} color={Colors.ink} />
              </TouchableOpacity>
            </View>
          </View>
          {GROUPS.filter((g) => grouped[g]).map((g) => (
            <View key={g}>
              <Text style={s.groupLabel}>{g}</Text>
              {grouped[g].map((ing) => (
                <View key={ing.id} style={s.ingRow}>
                  <Text style={s.ingName}>{ing.name}</Text>
                  <Text style={s.ingAmt}>{fmt(ing.amount * factor)}{ing.unit}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* steps */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Ionicons name="restaurant" size={16} color={Colors.ink} />
            <Text style={s.sectionTitle}>조리 순서</Text>
          </View>
          {r.steps.map((step, i) => {
            const key = `${r.id}::${step.id}`;
            return (
              <View key={step.id} style={s.step}>
                <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.stepTitle}>{step.title}</Text>
                  <Text style={s.stepContent}>{step.content}</Text>
                  {step.timer_seconds ? (
                    <StepTimer
                      timerKey={key}
                      total={step.timer_seconds}
                      state={timers[key]}
                      onStart={startTimer}
                      onPause={pauseTimer}
                      onReset={resetTimer}
                    />
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        {/* note */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Ionicons name="pencil" size={16} color={Colors.ink} />
            <Text style={s.sectionTitle}>나의 메모</Text>
          </View>
          {editNote ? (
            <>
              <TextInput
                style={s.noteInput}
                value={note}
                onChangeText={setNote}
                multiline
                placeholder="다음에 만들 때 바꿀 점, 가족 반응 등을 적어두세요."
                placeholderTextColor={Colors.soft}
              />
              <TouchableOpacity style={s.btnAccentFull} onPress={() => { updateRecipe(r.id, { note }); setEditNote(false); }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>저장</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={s.noteBox} onPress={() => setEditNote(true)}>
              <Text style={{ color: note ? Colors.ink : Colors.soft }}>{note || '탭하여 메모 추가…'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={15} color={Colors.accent} />
          <Text style={{ color: Colors.accent, fontSize: 13 }}>레시피 삭제</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  band: { height: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 12, paddingTop: 44 },
  backBtn: { padding: 4 },
  bandActions: { flexDirection: 'row', gap: 12 },
  body: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.ink, lineHeight: 32, marginBottom: 8 },
  desc: { fontSize: 14, color: Colors.soft, lineHeight: 22, marginBottom: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 16 },
  metaText: { fontSize: 12, color: Colors.soft, marginRight: 8 },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.line, borderRadius: 11,
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.card,
  },
  btnDark: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.ink, borderRadius: 11,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  btnDarkText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  btnAccent: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  btnText: { fontSize: 13, color: Colors.ink },
  btnAccentFull: { backgroundColor: Colors.accent, borderRadius: 11, padding: 12, alignItems: 'center', marginTop: 8 },
  section: { marginBottom: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.ink, flex: 1 },
  servingCtrl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.line, borderRadius: 10, overflow: 'hidden' },
  servBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.card },
  servText: { paddingHorizontal: 12, fontSize: 14, fontWeight: '700', color: Colors.ink },
  groupLabel: { fontSize: 10, color: Colors.soft, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6, marginTop: 10 },
  ingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.line },
  ingName: { fontSize: 14, color: Colors.ink },
  ingAmt: { fontSize: 14, color: Colors.accentDark, fontWeight: '600' },
  step: { flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.line },
  stepNum: { width: 27, height: 27, borderRadius: 9, backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stepTitle: { fontSize: 15, fontWeight: '700', color: Colors.ink, marginBottom: 4 },
  stepContent: { fontSize: 13.5, color: '#4a4036', lineHeight: 22 },
  noteBox: { backgroundColor: '#FCF6EC', borderWidth: 1, borderColor: Colors.line, borderRadius: 12, padding: 14, minHeight: 80 },
  noteInput: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.line, borderRadius: 12, padding: 12, minHeight: 90, fontSize: 14, color: Colors.ink },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 8 },
});
