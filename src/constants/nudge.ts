// Nudge-to-advance thresholds (SPEC §5.3). Tune these after testing on the phone.

/** Accelerometer update interval while listening, in ms. */
export const SAMPLE_INTERVAL_MS = 50;

/** Flat check: averaged |z| must be at least this many g. */
export const FLAT_MIN_Z_G = 0.9;

/** Flat check: averaged |x| and |y| must be at most this many g. */
export const FLAT_MAX_XY_G = 0.25;

/** Window the flat check averages over, in ms. */
export const FLAT_WINDOW_MS = 500;

/** The phone must have been flat continuously for this long before a nudge can fire, in ms. */
export const FLAT_HOLD_MS = 1000;

/** A bump is a sample whose magnitude differs from 1 g by more than this. */
export const BUMP_THRESHOLD_G = 0.3;

/** After a nudge, ignore further bumps for this long, in ms. */
export const COOLDOWN_MS = 1500;

/** Ignore bumps while a finger is down and for this long after the last finger lifts, in ms. */
export const TOUCH_SUPPRESS_MS = 500;
