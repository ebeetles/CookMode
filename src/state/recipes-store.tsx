import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { makeRecipeId, type NewRecipe, type Recipe } from '@/lib/recipes';
import {
  DEFAULT_SETTINGS,
  loadStoredData,
  saveProgress,
  saveRecipes,
  saveSettings,
  type Progress,
  type Settings,
} from '@/lib/storage';

type RecipesStore = {
  loaded: boolean;
  /** Newest first. */
  recipes: Recipe[];
  progress: Progress;
  settings: Settings;
  addRecipe: (recipe: NewRecipe) => void;
  deleteRecipe: (id: string) => void;
  setProgress: (id: string, stepIndex: number) => void;
  clearProgress: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
};

const RecipesContext = createContext<RecipesStore | null>(null);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [progress, setProgressState] = useState<Progress>({});
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Latest values, so actions can compute the next value and persist it outside a state updater.
  const latest = useRef({ recipes, progress, settings });

  useEffect(() => {
    let cancelled = false;
    loadStoredData()
      .then((data) => {
        if (cancelled) return;
        latest.current = data;
        setRecipes(data.recipes);
        setProgressState(data.progress);
        setSettings(data.settings);
      })
      .catch((error) => console.warn('Could not load stored data', error))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const commitRecipes = useCallback((next: Recipe[]) => {
    latest.current.recipes = next;
    setRecipes(next);
    saveRecipes(next);
  }, []);

  const commitProgress = useCallback((next: Progress) => {
    latest.current.progress = next;
    setProgressState(next);
    saveProgress(next);
  }, []);

  const addRecipe = useCallback(
    (recipe: NewRecipe) => {
      commitRecipes([...latest.current.recipes, { ...recipe, id: makeRecipeId(), createdAt: Date.now() }]);
    },
    [commitRecipes],
  );

  const deleteRecipe = useCallback(
    (id: string) => {
      commitRecipes(latest.current.recipes.filter((recipe) => recipe.id !== id));
      if (id in latest.current.progress) {
        const { [id]: _removed, ...rest } = latest.current.progress;
        commitProgress(rest);
      }
    },
    [commitRecipes, commitProgress],
  );

  const setProgress = useCallback(
    (id: string, stepIndex: number) => {
      if (latest.current.progress[id] === stepIndex) return;
      commitProgress({ ...latest.current.progress, [id]: stepIndex });
    },
    [commitProgress],
  );

  const clearProgress = useCallback(
    (id: string) => {
      if (!(id in latest.current.progress)) return;
      const { [id]: _removed, ...rest } = latest.current.progress;
      commitProgress(rest);
    },
    [commitProgress],
  );

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    const next = { ...latest.current.settings, ...patch };
    latest.current.settings = next;
    setSettings(next);
    saveSettings(next);
  }, []);

  const sortedRecipes = useMemo(() => [...recipes].sort((a, b) => b.createdAt - a.createdAt), [recipes]);

  const value = useMemo<RecipesStore>(
    () => ({
      loaded,
      recipes: sortedRecipes,
      progress,
      settings,
      addRecipe,
      deleteRecipe,
      setProgress,
      clearProgress,
      updateSettings,
    }),
    [loaded, sortedRecipes, progress, settings, addRecipe, deleteRecipe, setProgress, clearProgress, updateSettings],
  );

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes(): RecipesStore {
  const store = useContext(RecipesContext);
  if (!store) throw new Error('useRecipes must be used inside RecipesProvider');
  return store;
}
