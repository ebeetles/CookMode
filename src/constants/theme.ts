// The only colors allowed in the app (SPEC §4).
export const colors = {
  tile: '#F3F5F2',
  steel: '#DFE4E1',
  sharpie: '#1C1F24',
  tape: '#EAD9A6',
  basil: '#2F6B4F',
  flame: '#2F6FDB',
  alarm: '#C8371F',
  white: '#FFFFFF',
  secondary: '#4A4F57',
  cookSecondary: '#5C5232',
  segmentRemaining: '#C9B985',
} as const;

// Spacing uses only these values.
export const space = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  card: 10,
  tape: 2,
} as const;

export const touchTarget = {
  browse: 48,
  cook: 64,
} as const;

export const fontSize = {
  cookStep: 42,
  cookTimer: 36,
  screenTitle: 30,
  cardTitle: 19,
  body: 16,
  secondary: 14,
  helper: 13,
} as const;

export const displayFonts = {
  semibold: 'BarlowCondensed_600SemiBold',
  medium: 'BarlowCondensed_500Medium',
} as const;

// Render with the fallback font if Barlow hasn't loaded or failed by then.
export const FONT_TIMEOUT_MS = 3000;

export const SLIDE_DURATION_MS = 200;
export const NUDGE_FLASH_MS = 120;
export const NUDGE_FLASH_OPACITY = 0.2;
export const LONG_PRESS_MS = 500;
export const TIMER_TICK_MS = 250;
export const TIMER_PULSE_MS = 1000;
