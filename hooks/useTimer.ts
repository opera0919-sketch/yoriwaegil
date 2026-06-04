import { useState, useEffect, useRef } from 'react';

interface TimerState {
  remaining: number;
  total: number;
  running: boolean;
}

export function useTimer() {
  const [timers, setTimers] = useState<Record<string, TimerState>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const running = Object.values(timers).some((t) => t.running);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const k in next) {
          if (next[k].running && next[k].remaining > 0) {
            next[k] = { ...next[k], remaining: next[k].remaining - 1 };
            changed = true;
            if (next[k].remaining === 0) next[k].running = false;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const startTimer = (key: string, total: number) =>
    setTimers((t) => ({ ...t, [key]: { remaining: t[key]?.remaining ?? total, total, running: true } }));

  const pauseTimer = (key: string) =>
    setTimers((t) => (t[key] ? { ...t, [key]: { ...t[key], running: false } } : t));

  const resetTimer = (key: string, total: number) =>
    setTimers((t) => ({ ...t, [key]: { remaining: total, total, running: false } }));

  return { timers, startTimer, pauseTimer, resetTimer };
}
