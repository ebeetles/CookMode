import { useEffect, useState } from 'react';
import { Animated, AppState, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, space, TIMER_PULSE_MS, TIMER_TICK_MS, touchTarget } from '@/constants/theme';
import { heavyHaptic, speak } from '@/lib/feedback';
import { formatRemaining } from '@/lib/recipes';
import { useDisplayFont, useDisplayFontLoaded } from '@/state/display-font';

type Status = 'running' | 'done' | 'dismissed';

type Props = {
  minutes: number;
};

/**
 * Starts counting down from full duration when mounted. Remount it (new key) to restart;
 * unmounting cancels it, so no alarm fires after leaving the step.
 */
export function TimerChip({ minutes }: Props) {
  const [endAt] = useState(() => Date.now() + minutes * 60_000);
  const [now, setNow] = useState(() => Date.now());
  const [status, setStatus] = useState<Status>('running');
  const [opacity] = useState(() => new Animated.Value(1));
  const remaining = Math.max(0, endAt - now);

  useEffect(() => {
    if (status !== 'running') return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (time < endAt) return;
      setStatus('done');
      heavyHaptic();
      // Spoken even when read aloud is off.
      speak('Timer done.');
    };
    const interval = setInterval(tick, TIMER_TICK_MS);
    // Timers don't run in the background; catch up as soon as the app is back.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [status, endAt]);

  useEffect(() => {
    if (status !== 'done') {
      opacity.setValue(1);
      return;
    }
    const half = TIMER_PULSE_MS / 2;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: half, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: half, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [status, opacity]);

  const time = formatRemaining(remaining);

  return (
    <Pressable
      accessibilityRole="timer"
      accessibilityLabel={status === 'running' ? `Timer, ${time} left` : 'Timer done'}
      onPress={() => {
        // No pausing in v1: a tap only stops the pulse once the timer is done.
        if (status === 'done') setStatus('dismissed');
      }}>
      <Animated.View
        style={[styles.chip, { backgroundColor: status === 'running' ? colors.flame : colors.alarm, opacity }]}>
        <TabularTime value={time} />
      </Animated.View>
    </Pressable>
  );
}

/** Each character sits in a fixed-width box so the digits and colon never shift as they count down. */
function TabularTime({ value }: { value: string }) {
  const displayFont = useDisplayFont();
  const barlow = useDisplayFontLoaded();
  const digitWidth = barlow ? 20 : 23;
  const colonWidth = barlow ? 10 : 12;

  return (
    <View style={styles.time}>
      {value.split('').map((char, index) => (
        <Text
          key={index}
          style={[styles.char, displayFont, { width: char === ':' ? colonWidth : digitWidth }]}>
          {char}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: touchTarget.cook,
    borderRadius: radius.card,
    paddingHorizontal: space.m,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  time: {
    flexDirection: 'row',
  },
  char: {
    fontSize: fontSize.cookTimer,
    color: colors.white,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
