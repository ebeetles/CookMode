import { makeRecipeId, parseStep, type Recipe } from './recipes';

type SeedRecipe = { title: string; ingredients: string[]; steps: string[] };

// SPEC §7. Step lines are stored the same way as if typed into Add Recipe.
const SEED_RECIPES: SeedRecipe[] = [
  {
    title: 'Egg fried rice',
    ingredients: [
      '2 cups cooked rice, cold (day-old is best)',
      '3 eggs',
      '2 green onions, sliced, whites and greens separated',
      '2 cloves garlic, minced',
      '1 cup frozen peas and carrots',
      '2 tbsp soy sauce',
      '1 tsp sesame oil',
      '2 tbsp neutral oil',
      'Salt and white pepper',
    ],
    steps: [
      'Break up the cold rice with your hands so there are no clumps.',
      'Beat the eggs with a pinch of salt.',
      'Heat 1 tbsp oil in a wok or large pan over high heat until it shimmers.',
      'Scramble the eggs until just set, then move them to a plate.',
      'Add the rest of the oil, the garlic and the green onion whites. Stir for 30 seconds.',
      'Add the peas and carrots and stir until hot (2 min)',
      'Add the rice, press it flat against the pan, let it sit, then toss. Keep repeating (4 min)',
      'Add the soy sauce, sesame oil, eggs and green onion greens. Toss to combine.',
      'Taste, add salt or white pepper if needed, and serve.',
    ],
  },
  {
    title: 'Jammy soy eggs',
    ingredients: [
      '4 large eggs, straight from the fridge',
      '1/2 cup soy sauce',
      '1/2 cup water',
      '2 tbsp sugar or honey',
      '1 clove garlic, smashed',
      'Ice',
    ],
    steps: [
      'Bring a medium pot of water to a rolling boil.',
      'Mix the soy sauce, water, sugar and garlic in a container until the sugar dissolves.',
      'Fill a bowl with ice and cold water.',
      'Gently lower the eggs into the boiling water with a spoon (7 min)',
      'Move the eggs into the ice bath (5 min)',
      'Tap each egg all over and peel it under running water.',
      'Put the eggs in the marinade, cover, and refrigerate for at least 2 hours.',
    ],
  },
];

/** Seed recipes, with createdAt descending so recipe 1 sorts above recipe 2. */
export function buildSeedRecipes(now = Date.now()): Recipe[] {
  return SEED_RECIPES.map((seed, index) => ({
    id: makeRecipeId() + index,
    title: seed.title,
    ingredients: seed.ingredients,
    steps: seed.steps.map(parseStep),
    createdAt: now - index,
  }));
}
