import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { colors, fontSize, radius, space, touchTarget } from '@/constants/theme';
import { goToRecipes } from '@/lib/navigation';
import { parseSteps, splitLines, TITLE_MAX_LENGTH } from '@/lib/recipes';
import { useDisplayFont } from '@/state/display-font';
import { useRecipes } from '@/state/recipes-store';

const INPUT_LINE_HEIGHT = 22;
const INPUT_PADDING = space.m;

function linesTall(lines: number) {
  return lines * INPUT_LINE_HEIGHT + INPUT_PADDING * 2;
}

type Errors = { title: boolean; steps: boolean };

export default function AddRecipeScreen() {
  const insets = useSafeAreaInsets();
  const displayFont = useDisplayFont();
  const { addRecipe } = useRecipes();
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [errors, setErrors] = useState<Errors>({ title: false, steps: false });

  const save = () => {
    const trimmedTitle = title.trim();
    const parsedSteps = parseSteps(steps);
    const nextErrors = { title: trimmedTitle.length === 0, steps: parsedSteps.length === 0 };
    if (nextErrors.title || nextErrors.steps) {
      setErrors(nextErrors);
      return;
    }
    addRecipe({ title: trimmedTitle, ingredients: splitLines(ingredients), steps: parsedSteps });
    goToRecipes();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'android' ? 'height' : undefined}>
      <View style={styles.topBar}>
        <Button label="Cancel" variant="text" onPress={goToRecipes} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxl }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets>
        <Text style={[styles.screenTitle, displayFont]}>New recipe</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            accessibilityLabel="Title"
            value={title}
            onChangeText={(value) => {
              setTitle(value);
              setErrors((current) => ({ ...current, title: false }));
            }}
            maxLength={TITLE_MAX_LENGTH}
            returnKeyType="next"
            autoCapitalize="sentences"
            cursorColor={colors.sharpie}
            selectionColor={colors.sharpie}
            style={styles.input}
          />
          {errors.title && <Text style={styles.error}>Add a title</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Ingredients</Text>
          <TextInput
            accessibilityLabel="Ingredients"
            value={ingredients}
            onChangeText={setIngredients}
            multiline
            scrollEnabled={false}
            textAlignVertical="top"
            cursorColor={colors.sharpie}
            selectionColor={colors.sharpie}
            style={[styles.input, styles.multiline, { minHeight: linesTall(4) }]}
          />
          <Text style={styles.helper}>One per line.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Steps</Text>
          <TextInput
            accessibilityLabel="Steps"
            value={steps}
            onChangeText={(value) => {
              setSteps(value);
              setErrors((current) => ({ ...current, steps: false }));
            }}
            multiline
            scrollEnabled={false}
            textAlignVertical="top"
            cursorColor={colors.sharpie}
            selectionColor={colors.sharpie}
            style={[styles.input, styles.multiline, { minHeight: linesTall(6) }]}
          />
          <Text style={styles.helper}>One step per line. Add a timer at the end, like (10 min).</Text>
          {errors.steps && <Text style={styles.error}>Add at least one step</Text>}
        </View>

        <Button label="Save recipe" onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.tile,
  },
  topBar: {
    paddingHorizontal: space.l,
  },
  content: {
    paddingHorizontal: space.l,
    gap: space.xl,
  },
  screenTitle: {
    fontSize: fontSize.screenTitle,
    color: colors.sharpie,
  },
  field: {
    gap: space.xs,
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.sharpie,
    marginBottom: space.xs,
  },
  input: {
    minHeight: touchTarget.browse,
    backgroundColor: colors.steel,
    borderRadius: radius.card,
    padding: INPUT_PADDING,
    fontSize: fontSize.body,
    color: colors.sharpie,
  },
  multiline: {
    lineHeight: INPUT_LINE_HEIGHT,
    paddingTop: INPUT_PADDING,
  },
  helper: {
    fontSize: fontSize.helper,
    color: colors.secondary,
  },
  error: {
    fontSize: fontSize.secondary,
    color: colors.alarm,
  },
});
