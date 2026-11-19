import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

function ignore(error: unknown) {
  console.warn('Feedback failed', error);
}

export function lightHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(ignore);
}

export function heavyHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(ignore);
}

/** Speaks text, stopping anything in progress first so speech never overlaps. */
export function speak(text: string) {
  Speech.stop().catch(ignore);
  Speech.speak(text);
}

export function stopSpeaking() {
  Speech.stop().catch(ignore);
}
