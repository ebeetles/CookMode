import Ionicons from '@expo/vector-icons/Ionicons';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { IconToggle } from '@/components/icon-toggle';
import { ProgressSegments } from '@/components/progress-segments';
import { TimerChip } from '@/components/timer-chip';
import {
  colors,
  fontSize,
  LONG_PRESS_MS,
  NUDGE_FLASH_MS,
  NUDGE_FLASH_OPACITY,
  SLIDE_DURATION_MS,
  space,
  touchTarget,
} from '@/constants/theme';
import { useNudge, type TouchState } from '@/hooks/use-nudge';
import { lightHaptic, speak, stopSpeaking } from '@/lib/feedback';
import { goToRecipes } from '@/lib/navigation';
import { clampStep, stepSpeech, type Recipe } from '@/lib/recipes';
import { useDisplayFont } from '@/state/display-font';
import { useRecipes } from '@/state/recipes-store';

const FINISH_TEXT = "That's everything. Enjoy.";

export default function CookModeScreen() {
  // Released when this screen unmounts, so the other screens auto-lock normally.
  useKeepAwake();
  const { id, step } = useLocalSearchParams<{ id: string; step?: string }>();
  const { loaded, recipes, progress } = useRecipes();

  if (!loaded) return <View style={styles.screen} />;

  const recipe = recipes.find((item) => item.id === id);
  if (!recipe) return <RecipeNotFound />;

  const requested = step === undefined ? NaN : Number(step);
  const initialStep = clampStep(Number.isFinite(requested) ? requested : (progress[recipe.id] ?? 0), recipe);

  return <CookSession recipe={recipe} initialStep={initialStep} />;
}

function CookSession({ recipe, initialStep }: { recipe: Recipe; initialStep: number }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const displayFont = useDisplayFont();
  const { settings, updateSettings, setProgress, clearProgress } = useRecipes();

  const [stepIndex, setStepIndex] = useState(initialStep);
  const [finished, setFinished] = useState(false);
  // Bumped on every step change; keys the timer so revisiting a step restarts it.
  const [visit, setVisit] = useState(0);
  const [slide] = useState(() => new Animated.Value(0));
  const [darken] = useState(() => new Animated.Value(0));
  const animating = useRef(false);
  const direction = useRef<1 | -1>(1);
  const touch = useRef<TouchState>({ active: false, lastEnd: 0 });

  const total = recipe.steps.length;
  const current = recipe.steps[stepIndex];

  // Save progress on open and on every step change; delete it once the finish view appears.
  useEffect(() => {
    if (finished) clearProgress(recipe.id);
    else setProgress(recipe.id, stepIndex);
  }, [finished, stepIndex, recipe.id, setProgress, clearProgress]);

  // Read each step aloud as it appears. Turning read aloud off stops speech at once.
  useEffect(() => {
    if (!settings.readAloud) {
      stopSpeaking();
      return;
    }
    speak(finished ? FINISH_TEXT : stepSpeech(recipe.steps[stepIndex]));
  }, [settings.readAloud, finished, stepIndex, recipe]);

  useEffect(() => stopSpeaking, []);

  // Slide the new step in before it paints: from the right on next, from the left on back.
  useLayoutEffect(() => {
    if (visit === 0) return;
    animating.current = true;
    slide.setValue(direction.current * width);
    Animated.timing(slide, {
      toValue: 0,
      duration: SLIDE_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      animating.current = false;
    });
  }, [visit, slide, width]);

  /** Moves one step; returns false when the move is ignored. */
  const move = (dir: 1 | -1): boolean => {
    if (animating.current || finished) return false;
    if (dir === -1 && stepIndex === 0) return false;
    if (dir === 1 && stepIndex === total - 1) setFinished(true);
    else setStepIndex(stepIndex + dir);
    direction.current = dir;
    setVisit((value) => value + 1);
    return true;
  };

  const next = () => {
    if (move(1)) lightHaptic();
  };

  const back = () => {
    if (move(-1)) lightHaptic();
  };

  const nudge = () => {
    if (animating.current || finished) return;
    darken.setValue(NUDGE_FLASH_OPACITY);
    Animated.timing(darken, { toValue: 0, duration: NUDGE_FLASH_MS, useNativeDriver: true }).start();
    // The nudge's haptic doubles as the step-change haptic.
    lightHaptic();
    move(1);
  };

  const repeat = () => {
    lightHaptic();
    speak(stepSpeech(current));
  };

  useNudge(settings.nudge && !finished, nudge, touch);

  const onTouchEnd = (touchesLeft: number) => {
    if (touchesLeft > 0) return;
    touch.current.active = false;
    touch.current.lastEnd = Date.now();
  };

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + space.l }]}
      onTouchStart={() => {
        touch.current.active = true;
      }}
      onTouchEnd={(event) => onTouchEnd(event.nativeEvent.touches.length)}
      onTouchCancel={(event) => onTouchEnd(event.nativeEvent.touches.length)}>
      <View style={styles.topBar}>
        <Text style={styles.counter} accessibilityRole="header">
          {finished ? total : stepIndex + 1} of {total}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exit cook mode"
          onPress={goToRecipes}
          style={styles.iconButton}>
          <Ionicons name="close" size={36} color={colors.sharpie} />
        </Pressable>
        <View style={styles.toggles}>
          <IconToggle
            icon="hand-left"
            label="Nudge to advance"
            on={settings.nudge}
            onPress={() => updateSettings({ nudge: !settings.nudge })}
          />
          <IconToggle
            icon={settings.readAloud ? 'volume-high' : 'volume-mute'}
            label="Read aloud"
            on={settings.readAloud}
            onPress={() => updateSettings({ readAloud: !settings.readAloud })}
          />
        </View>
      </View>

      <View style={styles.progress}>
        <ProgressSegments total={total} filled={finished ? total : stepIndex + 1} />
      </View>

      {finished ? (
        <Animated.View style={[styles.stepContent, { transform: [{ translateX: slide }] }]}>
          <Text style={[styles.stepText, displayFont]}>{FINISH_TEXT}</Text>
          <Button label="Back to recipes" size="cook" onPress={goToRecipes} style={styles.finishButton} />
        </Animated.View>
      ) : (
        <>
          <Pressable
            style={styles.stepArea}
            onPress={next}
            onLongPress={repeat}
            delayLongPress={LONG_PRESS_MS}
            accessibilityHint="Tap for the next step. Long press to hear it again.">
            <Animated.View style={[styles.stepContent, { transform: [{ translateX: slide }] }]}>
              <Text
                style={[styles.stepText, displayFont]}
                numberOfLines={6}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {current.text}
              </Text>
              {current.timerMinutes !== null && (
                <View style={styles.timer}>
                  <TimerChip key={`${stepIndex}-${visit}`} minutes={current.timerMinutes} />
                </View>
              )}
            </Animated.View>
          </Pressable>

          <View style={styles.bottomRow}>
            {stepIndex > 0 ? (
              <Button label="Back" variant="outline" size="cook" onPress={back} />
            ) : (
              <View style={styles.backPlaceholder} />
            )}
            <Text style={styles.hint}>{settings.nudge ? 'Nudge or tap for next' : 'Tap for next'}</Text>
          </View>
        </>
      )}

      <Animated.View pointerEvents="none" style={[styles.darken, { opacity: darken }]} />
    </View>
  );
}

function RecipeNotFound() {
  const insets = useSafeAreaInsets();
  const displayFont = useDisplayFont();
  return (
    <View style={[styles.screen, styles.notFound, { paddingTop: insets.top + space.l }]}>
      <Text style={[styles.notFoundText, displayFont]}>Recipe not found</Text>
      <Button label="Back to recipes" size="cook" onPress={goToRecipes} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.tape,
    overflow: 'hidden',
  },
  topBar: {
    height: touchTarget.cook,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.s,
  },
  counter: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.sharpie,
  },
  iconButton: {
    width: touchTarget.cook,
    height: touchTarget.cook,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggles: {
    flexDirection: 'row',
    gap: space.s,
  },
  progress: {
    paddingHorizontal: space.l,
    paddingTop: space.s,
  },
  stepArea: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: space.l,
    paddingTop: space.xxl,
  },
  stepText: {
    fontSize: fontSize.cookStep,
    lineHeight: Math.round(fontSize.cookStep * 1.1),
    color: colors.sharpie,
    textAlign: 'left',
  },
  timer: {
    marginTop: space.xl,
    alignItems: 'flex-start',
  },
  finishButton: {
    marginTop: space.xl,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.l,
    gap: space.l,
  },
  backPlaceholder: {
    width: touchTarget.cook,
    height: touchTarget.cook,
  },
  hint: {
    flexShrink: 1,
    fontSize: fontSize.secondary,
    color: colors.cookSecondary,
  },
  darken: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.sharpie,
  },
  notFound: {
    paddingHorizontal: space.l,
    gap: space.xl,
  },
  notFoundText: {
    fontSize: fontSize.screenTitle,
    color: colors.sharpie,
  },
});
