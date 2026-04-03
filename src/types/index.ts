export interface User {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  bio: string | null;
  avatarUrl: string | null;
  preferenceAlcoholic: boolean;
}

export interface Ingredient {
  id: number;
  name: string;
  normalized_name: string;
  type: string;
  is_alcoholic: boolean;
  aliases?: string[];
  is_base_spirit?: boolean;
}

export interface DrinkIngredient {
  ingredient_id: number;
  quantity: string;
  is_optional: boolean;
  ingredients: {
    id: number;
    name: string;
    type?: string;
    is_alcoholic?: boolean;
  };
}

export interface DrinkStep {
  step_number: number;
  instruction: string;
}

export interface DrinkTag {
  drink_tags: {
    name: string;
  };
}

export interface Drink {
  id: number;
  name: string;
  description: string;
  // Support both snake_case (from raw SQL) and camelCase (from Drizzle)
  image_url?: string | null;
  imageUrl?: string | null;
  thumbnail_url?: string | null;
  thumbnailUrl?: string | null;
  is_alcoholic?: boolean;
  isAlcoholic?: boolean;
  prep_time_minutes?: number;
  prepTimeMinutes?: number;
  difficulty: string;
  ingredient_count?: number;
  ingredientCount?: number;
  popularity_score?: number;
  popularityScore?: number;
  images?: string[];
  drink_ingredients?: DrinkIngredient[];
  drinkIngredients?: DrinkIngredient[];
  drink_steps?: DrinkStep[];
  drinkSteps?: DrinkStep[];
  drink_tag_map?: DrinkTag[];
  drinkTagMap?: DrinkTag[];
  // Match result fields
  match_percentage?: number;
  missing_count?: number;
  total_required?: number;
  is_one_ingredient_away?: boolean;
  missing_ingredients?: string[];
}
