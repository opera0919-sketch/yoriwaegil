import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface Props {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}

export default function RatingStars({ value, onChange, size = 28 }: Props) {
  return (
    <View style={s.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} hitSlop={6}>
          <Ionicons
            name={n <= value ? 'star' : 'star-outline'}
            size={size}
            color={Colors.gold}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
});
