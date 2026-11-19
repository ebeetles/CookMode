import AsyncStorage from '@react-native-async-storage/async-storage';

import { isRecipe, type Recipe } from './recipes';
import { buildSeedRecipes } from './seed';

const KEYS = {
  recipes: 'cookmode:v1:recipes',
  progress: 'cookmode:v1:progress',
  settings: 'cookmode:v1:settings',
  seeded: 'cookmode:v1:seeded',
} as const;

/** 0-based step index per recipe id. */
export type Progress = Record<string, number>;

export type Settings = { readAloud: boolean; nudge: boolean };

export const DEFAULT_SETTINGS: Settings = { readAloud: true, nudge: true };

export type StoredData = { recipes: Recipe[]; progress: Progress; settings: Settings };

type ReadResult = { kind: 'missing' } | { kind: 'unreadable' } | { kind: 'ok'; value: unknown };

async function read(key: string): Promise<ReadResult> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(key);
  } catch (error) {
    console.warn(`Could not read ${key}`, error);
    return { kind: 'unreadable' };
  }
  if (raw === null) return { kind: 'missing' };
  try {
    return { kind: 'ok', value: JSON.parse(raw) };
  } catch (error) {
    console.warn(`Could not parse ${key}`, error);
    return { kind: 'unreadable' };
  }
}

async function write(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not write ${key}`, error);
  }
}

async function readRecipes(): Promise<Recipe[]> {
  const [recipes, seeded] = await Promise.all([read(KEYS.recipes), read(KEYS.seeded)]);
  const isSeeded = seeded.kind === 'ok' && seeded.value === 'true';

  if (recipes.kind === 'ok' && Array.isArray(recipes.value) && recipes.value.every(isRecipe)) {
    if (!isSeeded) await write(KEYS.seeded, 'true');
    return recipes.value;
  }
  if (recipes.kind === 'ok') console.warn(`${KEYS.recipes} has the wrong shape`);

  // First launch only: never reseed once the seed has been written.
  if (recipes.kind === 'missing' && seeded.kind === 'missing') {
    const seeds = buildSeedRecipes();
    await write(KEYS.recipes, seeds);
    await write(KEYS.seeded, 'true');
    return seeds;
  }
  return [];
}

async function readProgress(recipes: Recipe[]): Promise<Progress> {
  const result = await read(KEYS.progress);
  if (result.kind !== 'ok') return {};
  if (typeof result.value !== 'object' || result.value === null || Array.isArray(result.value)) {
    console.warn(`${KEYS.progress} has the wrong shape`);
    return {};
  }
  const ids = new Set(recipes.map((recipe) => recipe.id));
  const progress: Progress = {};
  for (const [id, index] of Object.entries(result.value)) {
    if (ids.has(id) && typeof index === 'number' && Number.isFinite(index)) progress[id] = index;
  }
  return progress;
}

async function readSettings(): Promise<Settings> {
  const result = await read(KEYS.settings);
  if (result.kind !== 'ok' || typeof result.value !== 'object' || result.value === null) {
    return DEFAULT_SETTINGS;
  }
  const value = result.value as Record<string, unknown>;
  return {
    readAloud: typeof value.readAloud === 'boolean' ? value.readAloud : DEFAULT_SETTINGS.readAloud,
    nudge: typeof value.nudge === 'boolean' ? value.nudge : DEFAULT_SETTINGS.nudge,
  };
}

export async function loadStoredData(): Promise<StoredData> {
  const [recipes, settings] = await Promise.all([readRecipes(), readSettings()]);
  const progress = await readProgress(recipes);
  return { recipes, progress, settings };
}

export function saveRecipes(recipes: Recipe[]): Promise<void> {
  return write(KEYS.recipes, recipes);
}

export function saveProgress(progress: Progress): Promise<void> {
  return write(KEYS.progress, progress);
}

export function saveSettings(settings: Settings): Promise<void> {
  return write(KEYS.settings, settings);
}
