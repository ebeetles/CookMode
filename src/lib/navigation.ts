import { router } from 'expo-router';

/** Returns to the Recipe List, even if the current screen was opened without history. */
export function goToRecipes() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
