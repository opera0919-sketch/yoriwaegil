import { Category, IngGroup } from '../constants/Colors';

export interface Ingredient {
  id: string;
  recipe_id?: string;
  name: string;
  amount: number;
  unit: string;
  grp: IngGroup;
  sort_order?: number;
}

export interface Step {
  id: string;
  recipe_id?: string;
  title: string;
  content: string;
  timer_seconds: number | null;
  sort_order?: number;
}

export interface Recipe {
  id: string;
  user_id?: string;
  title: string;
  category: Category;
  description: string;
  base_servings: number;
  total_minutes: number;
  difficulty: '쉬움' | '보통' | '어려움';
  tags: string[];
  favorite: boolean;
  in_cart: boolean;
  note: string;
  cook_count: number;
  last_cooked_at: string | null;
  version: number;
  created_at?: string;
  updated_at?: string;
  ingredients: Ingredient[];
  steps: Step[];
}

export interface RecipeVersion {
  id: string;
  recipe_id: string;
  version: number;
  snapshot: Recipe;
  changed_at: string;
}

export interface CookLog {
  id: string;
  recipe_id: string;
  user_id: string;
  cooked_at: string;
  servings: number;
  home_rating: number | null;
  memo: string;
  recipe?: { title: string; category: string };
}
