import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { RecipeCard } from '@/components/recipe-card';
import { colors, fontSize, space, touchTarget } from '@/constants/theme';
import { clampStep, type Recipe } from '@/lib/recipes';
import { useDisplayFont } from '@/state/display-font';
import { useRecipes } from '@/state/recipes-store';

function openCookMode(id: string, stepIndex: number) {
  router.push({ pathname: '/cook/[id]', params: { id, step: String(stepIndex) } });
}

function openAddRecipe() {
  router.push('/add');
}

export default function RecipeListScreen() {
  const insets = useSafeAreaInsets();
  const displayFont = useDisplayFont();
  const { loaded, recipes, progress, deleteRecipe, setProgress } = useRecipes();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Until storage has been read, show only the background (don't flash the empty state).
  if (!loaded) return <View style={styles.screen} />;

  const confirmDelete = (recipe: Recipe) => {
    Alert.alert(`Delete "${recipe.title}"?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRecipe(recipe.id) },
    ]);
  };

  const pinnedButtonBottom = insets.bottom + space.l;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Text style={[styles.screenTitle, displayFont]}>Recipes</Text>

      {recipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.screenTitle, styles.emptyHeading, displayFont]}>Add your first recipe</Text>
          <Button label="Add recipe" onPress={openAddRecipe} />
        </View>
      ) : (
        <>
          <FlatList
            data={recipes}
            keyExtractor={(recipe) => recipe.id}
            extraData={{ expandedId, progress }}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: pinnedButtonBottom + touchTarget.browse + space.l },
            ]}
            ItemSeparatorComponent={Separator}
            renderItem={({ item }) => {
              const saved = progress[item.id];
              return (
                <RecipeCard
                  recipe={item}
                  savedStep={saved === undefined ? undefined : clampStep(saved, item)}
                  expanded={expandedId === item.id}
                  onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                  onStart={(stepIndex) => openCookMode(item.id, stepIndex)}
                  onStartOver={() => {
                    setProgress(item.id, 0);
                    openCookMode(item.id, 0);
                  }}
                  onDelete={() => confirmDelete(item)}
                />
              );
            }}
          />
          <Button
            label="Add recipe"
            onPress={openAddRecipe}
            style={[styles.pinnedButton, { bottom: pinnedButtonBottom }]}
          />
        </>
      )}
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.tile,
  },
  screenTitle: {
    fontSize: fontSize.screenTitle,
    color: colors.sharpie,
    paddingHorizontal: space.l,
    paddingTop: space.l,
    paddingBottom: space.l,
  },
  list: {
    paddingHorizontal: space.l,
  },
  separator: {
    height: space.m,
  },
  empty: {
    paddingHorizontal: space.l,
  },
  emptyHeading: {
    paddingHorizontal: 0,
    paddingTop: space.s,
  },
  pinnedButton: {
    position: 'absolute',
    left: space.l,
    right: space.l,
  },
});
