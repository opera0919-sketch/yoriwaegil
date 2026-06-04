import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const mmss = (s: number) => {
  const m = Math.floor(s / 60), x = s % 60;
  return `${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`;
};

interface TimerState {
  remaining: number;
  total: number;
  running: boolean;
}

interface Props {
  timerKey: string;
  total: number;
  state?: TimerState;
  onStart: (key: string, total: number) => void;
  onPause: (key: string) => void;
  onReset: (key: string, total: number) => void;
}

export default function StepTimer({ timerKey, total, state, onStart, onPause, onReset }: Props) {
  const remaining = state ? state.remaining : total;
  const running = state?.running ?? false;
  const warn = running && remaining <= 10;

  return (
    <View style={[s.container, running && s.running]}>
      <Ionicons name="time-outline" size={15} color={running ? Colors.accent : Colors.soft} />
      <Text style={[s.time, warn && s.warn]}>{mmss(remaining)}</Text>
      {running ? (
        <TouchableOpacity style={s.btn} onPress={() => onPause(timerKey)}>
          <Ionicons name="pause" size={15} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={s.btn} onPress={() => onStart(timerKey, total)}>
          <Ionicons name="play" size={15} color="#fff" />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={s.btnGhost} onPress={() => onReset(timerKey, total)}>
        <Ionicons name="refresh" size={14} color={Colors.soft} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FCF6EC', borderWidth: 1, borderColor: Colors.line,
    borderRadius: 12, paddingVertical: 7, paddingHorizontal: 12, marginTop: 10, alignSelf: 'flex-start',
  },
  running: { borderColor: Colors.accent, backgroundColor: '#FBEDE6' },
  time: { fontSize: 17, fontWeight: '600', color: Colors.ink, minWidth: 52 },
  warn: { color: Colors.accent },
  btn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center',
  },
  btnGhost: {
    width: 28, height: 28, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center',
  },
});
