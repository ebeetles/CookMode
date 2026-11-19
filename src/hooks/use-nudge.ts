import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, type RefObject } from 'react';

import {
  BUMP_THRESHOLD_G,
  COOLDOWN_MS,
  FLAT_HOLD_MS,
  FLAT_MAX_XY_G,
  FLAT_MIN_Z_G,
  FLAT_WINDOW_MS,
  SAMPLE_INTERVAL_MS,
  TOUCH_SUPPRESS_MS,
} from '@/constants/nudge';

export type TouchState = {
  /** A finger is on the screen. */
  active: boolean;
  /** When the last finger lifted (Date.now()). */
  lastEnd: number;
};

type Sample = { t: number; x: number; y: number; z: number };

/**
 * Calls onNudge when the phone, lying flat, gets bumped (e.g. a knuckle tap on the counter).
 * Listens to the accelerometer only while `active` is true.
 */
export function useNudge(active: boolean, onNudge: () => void, touch: RefObject<TouchState>) {
  const onNudgeRef = useRef(onNudge);
  useEffect(() => {
    onNudgeRef.current = onNudge;
  });

  useEffect(() => {
    if (!active) return;

    let samples: Sample[] = [];
    let flatSince: number | null = null;
    let lastNudgeAt = -Infinity;

    Accelerometer.setUpdateInterval(SAMPLE_INTERVAL_MS);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const t = Date.now();

      // Judge the bump against the flat state of the samples before it, so the bump itself
      // can't break its own flat check.
      const flatLongEnough = flatSince !== null && t - flatSince >= FLAT_HOLD_MS;
      const bump = Math.abs(Math.sqrt(x * x + y * y + z * z) - 1) > BUMP_THRESHOLD_G;
      const touchSuppressed = touch.current.active || t - touch.current.lastEnd < TOUCH_SUPPRESS_MS;
      const coolingDown = t - lastNudgeAt < COOLDOWN_MS;
      if (bump && flatLongEnough && !touchSuppressed && !coolingDown) {
        lastNudgeAt = t;
        onNudgeRef.current();
      }

      samples.push({ t, x, y, z });
      samples = samples.filter((sample) => t - sample.t <= FLAT_WINDOW_MS);
      const avg = (key: 'x' | 'y' | 'z') => samples.reduce((sum, s) => sum + s[key], 0) / samples.length;
      const flat =
        Math.abs(avg('z')) >= FLAT_MIN_Z_G && Math.abs(avg('x')) <= FLAT_MAX_XY_G && Math.abs(avg('y')) <= FLAT_MAX_XY_G;

      if (!flat) flatSince = null;
      else if (flatSince === null) flatSince = t;
    });

    return () => subscription.remove();
  }, [active, touch]);
}
