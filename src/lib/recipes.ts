export type Step = { text: string; timerMinutes: number | null };

export type Recipe = {
  id: string;
  title: string;
  ingredients: string[];
  steps: Step[];
  createdAt: number;
};

export type NewRecipe = Pick<Recipe, 'title' | 'ingredients' | 'steps'>;

const TIMER_PATTERN = /\((\d{1,3})\s*(min|mins|minute|minutes)\)\.?$/i;
const MAX_TIMER_MINUTES = 180;

export const TITLE_MAX_LENGTH = 60;

/** Splits a multiline box into trimmed, non-blank lines. */
export function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Parses one trimmed step line, pulling a trailing "(10 min)" into a timer. */
export function parseStep(line: string): Step {
  const match = TIMER_PATTERN.exec(line);
  if (!match) return { text: line, timerMinutes: null };

  const minutes = Number(match[1]);
  if (minutes < 1 || minutes > MAX_TIMER_MINUTES) return { text: line, timerMinutes: null };

  const text = line.slice(0, match.index).trimEnd();
  return { text: text.length > 0 ? text : 'Wait', timerMinutes: minutes };
}

export function parseSteps(value: string): Step[] {
  return splitLines(value).map(parseStep);
}

export function makeRecipeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function totalTimerMinutes(recipe: Recipe): number {
  return recipe.steps.reduce((sum, step) => sum + (step.timerMinutes ?? 0), 0);
}

export function stepCountLabel(count: number): string {
  return count === 1 ? '1 step' : `${count} steps`;
}

/** "7 steps · 25 min of timers", or "7 steps" when there are no timers. */
export function recipeMeta(recipe: Recipe): string {
  const steps = stepCountLabel(recipe.steps.length);
  const minutes = totalTimerMinutes(recipe);
  return minutes > 0 ? `${steps} · ${minutes} min of timers` : steps;
}

export function minutesLabel(minutes: number): string {
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

/** What read-aloud says for a step: the text, then the timer if it has one. */
export function stepSpeech(step: Step): string {
  if (step.timerMinutes === null) return step.text;
  const separator = /[.!?]$/.test(step.text) ? ' ' : '. ';
  return `${step.text}${separator}Timer, ${minutesLabel(step.timerMinutes)}.`;
}

/** m:ss, or h:mm:ss at 60 minutes or more. */
export function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`;
  return `${minutes}:${seconds}`;
}

export function clampStep(index: number, recipe: Recipe): number {
  return Math.min(Math.max(0, Math.floor(index)), recipe.steps.length - 1);
}

function isStep(value: unknown): value is Step {
  if (typeof value !== 'object' || value === null) return false;
  const step = value as Record<string, unknown>;
  return (
    typeof step.text === 'string' &&
    (step.timerMinutes === null || typeof step.timerMinutes === 'number')
  );
}

export function isRecipe(value: unknown): value is Recipe {
  if (typeof value !== 'object' || value === null) return false;
  const recipe = value as Record<string, unknown>;
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.title === 'string' &&
    Array.isArray(recipe.ingredients) &&
    recipe.ingredients.every((item) => typeof item === 'string') &&
    Array.isArray(recipe.steps) &&
    recipe.steps.length > 0 &&
    recipe.steps.every(isStep) &&
    typeof recipe.createdAt === 'number'
  );
}
