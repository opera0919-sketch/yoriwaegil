import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Recipe } from '../lib/types';

interface Props {
  recipe: Recipe;
  onPress: () => void;
  onFavorite: () => void;
  onCart: () => void;
}

export default function RecipeCard({ recipe: r, onPress, onFavorite, onCart }: Props) {
  const color = Colors.catColor[r.category] ?? Colors.soft;

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[s.band, { backgroundColor: color }]} />
      <View style={s.body}>
        <Text style={[s.cat, { color }]}>{r.category}</Text>
        <View style={s.row}>
          <Text style={s.title} numberOfLines={2}>{r.title}</Text>
          <TouchableOpacity onPress={onFavorite} hitSlop={8}>
            <Ionicons
              name={r.favorite ? 'star' : 'star-outline'}
              size={18}
              color={r.favorite ? Colors.gold : Colors.soft}
            />
          </TouchableOpacity>
        </View>
        <Text style={s.desc} numberOfLines={2}>{r.description}</Text>
        <View style={s.meta}>
          <Ionicons name="time-outline" size={12} color={Colors.soft} />
          <Text style={s.metaText}>{r.total_minutes}분</Text>
          <Ionicons name="flame-outline" size={12} color={Colors.soft} />
          <Text style={s.metaText}>{r.difficulty}</Text>
        </View>
        {(r.tags ?? []).length > 0 && (
          <View style={s.tags}>
            {(r.tags ?? []).slice(0, 3).map((t) => (
              <View key={t} style={s.tag}>
                <Text style={s.tagText}>#{t}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={s.footer}>
        <View style={s.triedRow}>
          {r.cook_count > 0 && (
            <Ionicons name="checkmark-circle" size={14} color={Colors.accent} />
          )}
          <Text style={s.triedText}>
            {r.cook_count > 0 ? `${r.cook_count}회 요리함` : '아직 안 만듦'}
          </Text>
        </View>
        <TouchableOpacity onPress={onCart} hitSlop={8}>
          <Ionicons
            name={r.in_cart ? 'cart' : 'cart-outline'}
            size={18}
            color={r.in_cart ? Colors.accent : Colors.soft}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  band: { height: 6 },
  body: { padding: 12, flex: 1 },
  cat: { fontSize: 10, fontWeight: '700', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.ink, lineHeight: 20 },
  desc: { fontSize: 11.5, color: Colors.soft, marginTop: 5, lineHeight: 16 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  metaText: { fontSize: 11, color: Colors.soft, marginRight: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  tag: { backgroundColor: '#F6E6DD', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 10, color: Colors.accentDark },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    backgroundColor: '#FCF7EE',
  },
  triedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  triedText: { fontSize: 11, color: Colors.soft },
});
