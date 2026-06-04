import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { CookLog } from '../../lib/types';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<CookLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('cook_logs')
      .select('*, recipe:recipes(title, category)')
      .eq('user_id', user.id)
      .order('cooked_at', { ascending: false })
      .then(({ data }) => {
        setLogs((data as CookLog[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={Colors.accent} />;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>조리 기록</Text>
        <Text style={s.sub}>총 {logs.length}회</Text>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        renderItem={({ item: l }) => (
          <View style={s.card}>
            <View style={s.cardLeft}>
              <Text style={s.recipeTitle}>{l.recipe?.title ?? '삭제된 레시피'}</Text>
              <Text style={s.date}>{new Date(l.cooked_at).toLocaleDateString('ko-KR')}</Text>
              {l.memo ? <Text style={s.memo}>{l.memo}</Text> : null}
            </View>
            <View style={s.cardRight}>
              {l.home_rating ? (
                <View style={s.stars}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons
                      key={n}
                      name={n <= l.home_rating! ? 'star' : 'star-outline'}
                      size={13}
                      color={Colors.gold}
                    />
                  ))}
                </View>
              ) : null}
              <Text style={s.servings}>{l.servings}인분</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="time-outline" size={40} color={Colors.soft} />
            <Text style={s.emptyText}>아직 조리 기록이 없어요.{'\n'}요리 모드를 완료하면 기록이 쌓여요!</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8,
    padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.ink },
  sub: { fontSize: 13, color: Colors.soft },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 14, padding: 14, marginBottom: 8,
  },
  cardLeft: { flex: 1, gap: 4 },
  recipeTitle: { fontSize: 15, fontWeight: '600', color: Colors.ink },
  date: { fontSize: 11, color: Colors.soft },
  memo: { fontSize: 12, color: Colors.soft, marginTop: 4, fontStyle: 'italic' },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  stars: { flexDirection: 'row', gap: 1 },
  servings: { fontSize: 11, color: Colors.soft },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: Colors.soft, textAlign: 'center', lineHeight: 22 },
});
