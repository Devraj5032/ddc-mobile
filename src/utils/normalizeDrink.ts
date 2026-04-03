import { Drink } from "../types";

/** Normalize drink object to handle both camelCase (Drizzle) and snake_case field names */
export function normalizeDrink(d: any): Drink {
  return {
    ...d,
    image_url: d.image_url ?? d.imageUrl ?? null,
    thumbnail_url: d.thumbnail_url ?? d.thumbnailUrl ?? null,
    is_alcoholic: d.is_alcoholic ?? d.isAlcoholic ?? false,
    prep_time_minutes: d.prep_time_minutes ?? d.prepTimeMinutes ?? 5,
    ingredient_count: d.ingredient_count ?? d.ingredientCount ?? 0,
    popularity_score: d.popularity_score ?? d.popularityScore ?? 0,
    images: d.images || [],
    drink_ingredients: d.drink_ingredients || d.drinkIngredients || [],
    drink_steps: d.drink_steps || d.drinkSteps || [],
    drink_tag_map: d.drink_tag_map || d.drinkTagMap || [],
  };
}

export function normalizeDrinks(drinks: any[]): Drink[] {
  return drinks.map(normalizeDrink);
}
