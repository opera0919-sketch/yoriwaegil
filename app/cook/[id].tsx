import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,
} from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { useRecipes } from '../../hooks/useRecipes';
import { useTimer } from '../../hooks/useTimer';
import { supabase } from '../../lib/supabase';
import RatingStars from '../../components/RatingStars';

const mmss = (s: number) => {
  const m = Math.floor(s / 60), x = s % 60;
  return `${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`;
};

export default function CookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { recipes, markCooked } = useRecipes(user?.id);
  const router = useRouter();
  const { timers, startTimer, pauseTimer, resetTimer } = useTimer();

  const r = recipes.find((x) => x.id === id);
  const [stepIdx, setStepIdx] = useState(0);
  const [showLog, setShowLog] = useState(false);
  const [logServings, setLogServings] = useState(r?.base_servings ?? 2);
  const [rating, setRating] = useState(0);
  const [memo, setMemo] = useState('');

  if (!r || r.steps.length === 0) return null;

  const step = r.steps[stepIdx];
  const key = `${r.id}::${step.id}`;
  const t = timers[key];
  const total = step.timer_seconds ?? 0;
  const remaining = t ? t.remaining : total;
  const warn = t?.running && remaining <= 10;
  const isLast = stepIdx === r.steps.length - 1;
  const progress = (stepIdx + 1) / r.steps.length;

  const finish = async () => {
    if (!user) return;
    await markCooked(r.id);
    await supabase.from('cook_logs').insert({
      recipe_id: r.id,
      user_id: user.id,
      servings: logServings,
      home_rating: rating || null,
      memo: memo.trim() || null,
    });
    setShowLog(false);
    router.back();
  };

  return (
    <View style={s.container}>
      {/* header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.miniLogo}><Ionicons name="restaurant" size={16} color="#fff" /></View>
          <Text style={s.recipeTitle} numberOfLines={1}>{r.title}</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      {/* progress */}
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${progress * 100}%` as `${number}%` }]} />
      </View>

      {/* step body */}
      <View style={s.body}>
        <Text style={s.stepLabel}>STEP {stepIdx + 1} / {r.steps.length}</Text>
        <Text style={s.stepTitle}>{step.title}</Text>
        <Text style={s.stepContent}>{step.content}</Text>

        {step.timer_seconds ? (
          <>
            <Text style={[s.bigTimer, warn && s.warn]}>{mmss(remaining)}</Text>
            <View style={s.timerBtns}>
              {t?.running ? (
                <TouchableOpacity style={s.btnDark} onPress={() => pauseTimer(key)}>
                  <Ionicons name="pause" size={18} color="#fff" />
                  <Text style={s.btnDarkText}>일시정지</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={s.btnAccent} onPress={() => startTimer(key, total)}>
                  <Ionicons name="play" size={18} color="#fff" />
                  <Text style={s.btnDarkText}>타이머 시작</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={s.btn} onPress={() => resetTimer(key, total)}>
                <Ionicons name="refresh" size={16} color={Colors.ink} />
                <Text style={s.btnText}>리셋</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </View>

      {/* footer nav */}
      <View style={s.footer}>
        <TouchableOpacity style={s.btn} disabled={stepIdx === 0} onPress={() => setStepIdx((x) => x - 1)}>
          <Ionicons name="chevron-back" size={16} color={stepIdx === 0 ? Colors.soft : Colors.ink} />
          <Text style={[s.btnText, stepIdx === 0 && { color: Colors.soft }]}>이전</Text>
        </TouchableOpacity>
        {isLast ? (
          <TouchableOpacity style={s.btnAccent} onPress={() => setShowLog(true)}>
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={s.btnDarkText}>요리 완료!</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.btnDark} onPress={() => setStepIdx((x) => x + 1)}>
            <Text style={s.btnDarkText}>다음</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* cook log modal */}
      <Modal visible={showLog} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>요리 완료!</Text>
            <Text style={s.modalSub}>어떠셨나요? 기록을 남겨보세요.</Text>

            <Text style={s.logLabel}>인분</Text>
            <View style={s.servRow}>
              <TouchableOpacity onPress={() => setLogServings((x) => Math.max(1, x - 1))}>
                <Ionicons name="remove-circle-outline" size={28} color={Colors.ink} />
              </TouchableOpacity>
              <Text style={s.servNum}>{logServings}</Text>
              <TouchableOpacity onPress={() => setLogServings((x) => x + 1)}>
                <Ionicons name="add-circle-outline" size={28} color={Colors.ink} />
              </TouchableOpacity>
            </View>

            <Text style={s.logLabel}>우리집 평점</Text>
            <RatingStars value={rating} onChange={setRating} />

            <Text style={[s.logLabel, { marginTop: 16 }]}>메모 (선택)</Text>
            <TextInput
              style={s.memoInput}
              value={memo}
              onChangeText={setMemo}
              placeholder="맛이 어땠나요? 다음엔 뭘 바꿀까요?"
              placeholderTextColor={Colors.soft}
              multiline
            />

            <TouchableOpacity style={s.btnAccentFull} onPress={finish}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>저장하고 마치기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => { router.back(); }}>
              <Text style={{ color: Colors.soft, textAlign: 'center' }}>그냥 나가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  miniLogo: { width: 30, height: 30, borderRadius: 9, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  recipeTitle: { fontSize: 15, fontWeight: '700', color: Colors.ink, flex: 1 },
  progressBar: { height: 5, backgroundColor: Colors.line },
  progressFill: { height: 5, backgroundColor: Colors.accent },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  stepLabel: { fontSize: 12, color: Colors.accent, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  stepTitle: { fontSize: 28, fontWeight: '700', color: Colors.ink, textAlign: 'center', marginBottom: 16, lineHeight: 36 },
  stepContent: { fontSize: 17, color: '#4a4036', lineHeight: 28, textAlign: 'center' },
  bigTimer: { fontSize: 60, fontWeight: '700', color: Colors.ink, letterSpacing: 2, marginTop: 28, marginBottom: 12 },
  warn: { color: Colors.accent },
  timerBtns: { flexDirection: 'row', gap: 10 },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 18, borderTopWidth: 1, borderTopColor: Colors.line,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.line, borderRadius: 11,
    paddingHorizontal: 18, paddingVertical: 12, backgroundColor: Colors.card,
  },
  btnText: { fontSize: 14, color: Colors.ink },
  btnDark: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.ink, borderRadius: 11,
    paddingHorizontal: 18, paddingVertical: 12,
  },
  btnAccent: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.accent, borderRadius: 11,
    paddingHorizontal: 18, paddingVertical: 12,
  },
  btnDarkText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(43,33,24,0.5)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: Colors.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 48,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: Colors.ink, marginBottom: 4 },
  modalSub: { fontSize: 13, color: Colors.soft, marginBottom: 20 },
  logLabel: { fontSize: 12, color: Colors.soft, marginBottom: 8 },
  servRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  servNum: { fontSize: 24, fontWeight: '700', color: Colors.ink, minWidth: 30, textAlign: 'center' },
  memoInput: {
    borderWidth: 1, borderColor: Colors.line, borderRadius: 12,
    padding: 12, minHeight: 70, fontSize: 14, color: Colors.ink,
    backgroundColor: Colors.card, marginBottom: 20,
  },
  btnAccentFull: { backgroundColor: Colors.accent, borderRadius: 14, padding: 16, alignItems: 'center' },
});
