import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { colors, fontSize, radius, space } from '@/constants/theme';
import { recipeMeta, type Recipe } from '@/lib/recipes';
import { useDisplayFont } from '@/state/display-font';

type Props = {
  recipe: Recipe;
  /** Clamped 0-based saved step, or undefined when there's no saved progress. */
  savedStep: number | undefined;
  expanded: boolean;
  onToggle: () => void;
  onStart: (stepIndex: number) => void;
  onStartOver: () => void;
  onDelete: () => void;
};

export function RecipeCard({ recipe, savedStep, expanded, onToggle, onStart, onStartOver, onDelete }: Props) {
  const displayFont = useDisplayFont();
  const stepCount = recipe.steps.length;

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={styles.header}>
        <View style={styles.tape}>
          <Text numberOfLines={2} style={[styles.title, displayFont]}>
            {recipe.title}
          </Text>
        </View>
        <Text style={styles.meta}>{recipeMeta(recipe)}</Text>
        {savedStep !== undefined && (
          <Text style={styles.meta}>
            Paused at step {savedStep + 1} of {stepCount}
          </Text>
        )}
      </Pressable>

      {expanded && (
        <View style={styles.details}>
          <View style={styles.ingredients}>
            <Text style={styles.sectionLabel}>Ingredients</Text>
            {recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ingredient, index) => (
                <Text key={index} style={styles.ingredient}>
                  • {ingredient}
                </Text>
              ))
            ) : (
              <Text style={styles.meta}>No ingredients listed</Text>
            )}
          </View>

          <View style={styles.buttons}>
            {savedStep === undefined ? (
              <Button label="Start cooking" onPress={() => onStart(0)} />
            ) : (
              <>
                <Button label={`Resume step ${savedStep + 1}`} onPress={() => onStart(savedStep)} />
                <Button label="Start over" variant="outline" onPress={onStartOver} />
              </>
            )}
          </View>

          <Button label="Delete recipe" variant="text" onPress={onDelete} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.steel,
    borderRadius: radius.card,
    padding: space.l,
  },
  header: {
    gap: space.s,
  },
  tape: {
    alignSelf: 'flex-start',
    backgroundColor: colors.tape,
    borderRadius: radius.tape,
    paddingVertical: space.xs,
    paddingHorizontal: space.s,
  },
  title: {
    fontSize: fontSize.cardTitle,
    lineHeight: 24,
    color: colors.sharpie,
  },
  meta: {
    fontSize: fontSize.secondary,
    color: colors.secondary,
  },
  details: {
    marginTop: space.l,
    gap: space.l,
  },
  ingredients: {
    gap: space.xs,
  },
  sectionLabel: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.sharpie,
    marginBottom: space.xs,
  },
  ingredient: {
    fontSize: fontSize.body,
    color: colors.sharpie,
  },
  buttons: {
    gap: space.s,
  },
});
