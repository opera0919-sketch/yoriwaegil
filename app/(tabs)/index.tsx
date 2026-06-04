import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator,
} from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, CATS } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { useRecipes } from '../../hooks/useRecipes';
import { Recipe } from '../../lib/types';
import RecipeCard from '../../components/RecipeCard';

export default function BoxScreen() {
  const { user, signOut } = useAuth();
  const { recipes, loading, updateRecipe } = useRecipes(user?.id);
  const router = useRouter();

  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('all');

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (cat !== 'all' && r.category !== cat) return false;
      if (q.trim()) {
        const haystack = [
          r.title, r.description,
          ...(r.tags ?? []),
          ...(r.ingredients ?? []).map((i) => i.name),
        ].join(' ').toLowerCase();
        if (!haystack.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [recipes, cat, q]);

  const cartCount = recipes.filter((r) => r.in_cart).length;

  return (
    <View style={s.container}>
      {/* header */}
      <View style={s.header}>
        <View style={s.brand}>
          <View style={s.logo}>
            <Ionicons name="restaurant" size={22} color="#fff" />
          </View>
          <View>
            <Text style={s.title}>레시피 보관함</Text>
            <Text style={s.sub}>{recipes.length}개 저장 · {recipes.filter(r => r.cook_count > 0).length}개 요리함</Text>
          </View>
        </View>
        <TouchableOpacity onPress={signOut}>
          <Ionicons name="log-out-outline" size={22} color={Colors.soft} />
        </TouchableOpacity>
      </View>

      {/* search */}
      <View style={s.searchBox}>
        <Ionicons name="search" size={16} color={Colors.soft} />
        <TextInput
          style={s.searchInput}
          placeholder="요리 이름, 재료, 태그로 검색…"
          placeholderTextColor={Colors.soft}
          value={q}
          onChangeText={setQ}
        />
        {q ? <TouchableOpacity onPress={() => setQ('')}><Ionicons name="close" size={16} color={Colors.soft} /></TouchableOpacity> : null}
      </View>

      {/* category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {(['all', ...CATS] as string[]).map((c) => {
          const active = cat === c;
          const color = c === 'all' ? Colors.ink : Colors.catColor[c];
          return (
            <TouchableOpacity
              key={c}
              style={[s.catBtn, active && { backgroundColor: color, borderColor: color }]}
              onPress={() => setCat(c)}
            >
              {c !== 'all' && <View style={[s.dot, { backgroundColor: color }]} />}
              <Text style={[s.catText, active && { color: '#fff' }]}>
                {c === 'all' ? `전체 ${recipes.length}` : `${c} ${recipes.filter(r => r.category === c).length}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={Colors.accent} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          numColumns={2}
          contentContainerStyle={{ padding: 8, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => router.push(`/recipe/${item.id}`)}
              onFavorite={() => updateRecipe(item.id, { favorite: !item.favorite })}
              onCart={() => updateRecipe(item.id, { in_cart: !item.in_cart })}
            />
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="restaurant-outline" size={40} color={Colors.soft} />
              <Text style={s.emptyText}>레시피가 없어요{'\n'}+ 버튼으로 추가해 보세요</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => router.push('/add')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.ink },
  sub: { fontSize: 11, color: Colors.soft, marginTop: 2 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.ink },
  catRow: { marginBottom: 8 },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 6,
    backgroundColor: Colors.card,
  },
  dot: { width: 7, height: 7, borderRadius: 99 },
  catText: { fontSize: 12.5, color: Colors.soft },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: Colors.soft, textAlign: 'center', lineHeight: 22 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
