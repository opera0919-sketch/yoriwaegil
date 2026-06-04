import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { useState, useMemo } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Colors, GROUPS } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { useRecipes } from '../../hooks/useRecipes';
import { Ingredient } from '../../lib/types';

interface AggItem {
  key: string;
  name: string;
  unit: string;
  grp: string;
  amount: number;
  from: string[];
}

export default function CartScreen() {
  const { user } = useAuth();
  const { recipes, updateRecipe } = useRecipes(user?.id);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const cartRecipes = recipes.filter((r) => r.in_cart);

  const shopList = useMemo(() => {
    const map: Record<string, AggItem> = {};
    cartRecipes.forEach((r) => {
      (r.ingredients ?? []).forEach((ing: Ingredient) => {
        const k = `${ing.name}|${ing.unit}`;
        if (!map[k]) map[k] = { key: k, name: ing.name, unit: ing.unit, grp: ing.grp, amount: 0, from: [] };
        map[k].amount += Number(ing.amount) || 0;
        if (!map[k].from.includes(r.title)) map[k].from.push(r.title);
      });
    });
    const byGroup: Record<string, AggItem[]> = {};
    Object.values(map).forEach((v) => {
      (byGroup[v.grp] = byGroup[v.grp] || []).push(v);
    });
    return byGroup;
  }, [cartRecipes]);

  const allItems = Object.values(shopList).flat();
  const doneCount = allItems.filter((x) => checked[x.key]).length;

  const copyList = async () => {
    let txt = '🛒 장보기 목록\n';
    GROUPS.filter((g) => shopList[g]).forEach((g) => {
      txt += `\n[${g}]\n`;
      shopList[g].forEach((x) => (txt += `- ${x.name} ${x.amount}${x.unit}\n`));
    });
    await Clipboard.setStringAsync(txt);
    Alert.alert('복사됨', '클립보드에 복사했어요.');
  };

  if (cartRecipes.length === 0) {
    return (
      <View style={s.empty}>
        <Ionicons name="cart-outline" size={48} color={Colors.soft} />
        <Text style={s.emptyText}>장보기 목록이 비어 있어요.{'\n'}보관함에서 🛒 아이콘을 눌러 담아보세요.</Text>
      </View>
    );
  }

  const sections = GROUPS.filter((g) => shopList[g]).map((g) => ({ title: g, data: shopList[g] }));

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>장보기 목록</Text>
        <Text style={s.sub}>{doneCount}/{allItems.length} 담음</Text>
      </View>

      {/* selected recipes */}
      <View style={s.pills}>
        {cartRecipes.map((r) => (
          <View key={r.id} style={s.pill}>
            <View style={[s.dot, { backgroundColor: Colors.catColor[r.category] }]} />
            <Text style={s.pillText}>{r.title}</Text>
            <TouchableOpacity onPress={() => updateRecipe(r.id, { in_cart: false })}>
              <Ionicons name="close" size={14} color={Colors.soft} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={s.btn} onPress={copyList}>
          <Ionicons name="copy-outline" size={15} color={Colors.ink} />
          <Text style={s.btnText}>복사</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.btn, { borderColor: Colors.accent }]}
          onPress={() => cartRecipes.forEach((r) => updateRecipe(r.id, { in_cart: false }))}
        >
          <Text style={[s.btnText, { color: Colors.accent }]}>전체 비우기</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        renderItem={({ item: section }) => (
          <View style={{ marginBottom: 20 }}>
            <Text style={s.groupLabel}>{section.title}</Text>
            {section.data.map((x) => {
              const on = !!checked[x.key];
              return (
                <TouchableOpacity
                  key={x.key}
                  style={[s.item, on && s.itemDone]}
                  onPress={() => setChecked((c) => ({ ...c, [x.key]: !c[x.key] }))}
                >
                  <View style={[s.checkbox, on && s.checkboxOn]}>
                    {on && <Ionicons name="checkmark" size={13} color="#fff" />}
                  </View>
                  <Text style={[s.itemName, on && s.strikethrough]}>{x.name}</Text>
                  <Text style={s.itemAmt}>{x.amount}{x.unit}</Text>
                  {x.from.length > 1 && (
                    <View style={s.fromPill}>
                      <Text style={s.fromText}>{x.from.length}개 레시피</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  empty: { flex: 1, backgroundColor: Colors.paper, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: Colors.soft, textAlign: 'center', lineHeight: 22 },
  header: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8,
    padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.ink },
  sub: { fontSize: 13, color: Colors.soft },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 12 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 99 },
  pillText: { fontSize: 12.5, color: Colors.ink },
  actions: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 8 },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.line, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.card,
  },
  btnText: { fontSize: 13, color: Colors.ink },
  groupLabel: { fontSize: 11, fontWeight: '700', color: Colors.ink, letterSpacing: 0.5, marginBottom: 8 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 12, padding: 12, marginBottom: 6,
  },
  itemDone: { opacity: 0.5 },
  checkbox: {
    width: 22, height: 22, borderRadius: 7,
    borderWidth: 1.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  itemName: { flex: 1, fontSize: 14, color: Colors.ink },
  strikethrough: { textDecorationLine: 'line-through' },
  itemAmt: { fontSize: 13, color: Colors.accentDark, fontWeight: '600' },
  fromPill: { backgroundColor: '#F1E6D2', borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2 },
  fromText: { fontSize: 10, color: Colors.soft },
});
