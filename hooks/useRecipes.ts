import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Recipe } from '../lib/types';

const uid = () => Math.random().toString(36).slice(2, 9);

export function useRecipes(userId: string | undefined) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    if (!userId) return;
    const { data: recipeRows } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!recipeRows) { setLoading(false); return; }

    const ids = recipeRows.map((r) => r.id);
    const [{ data: ingRows }, { data: stepRows }] = await Promise.all([
      supabase.from('ingredients').select('*').in('recipe_id', ids).order('sort_order'),
      supabase.from('steps').select('*').in('recipe_id', ids).order('sort_order'),
    ]);

    const full: Recipe[] = recipeRows.map((r) => ({
      ...r,
      ingredients: (ingRows ?? []).filter((i) => i.recipe_id === r.id),
      steps: (stepRows ?? []).filter((s) => s.recipe_id === r.id),
    }));

    setRecipes(full);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const saveVersion = async (recipe: Recipe) => {
    await supabase.from('recipe_versions').insert({
      recipe_id: recipe.id,
      version: recipe.version,
      snapshot: recipe,
    });
  };

  const addRecipe = async (data: Omit<Recipe, 'id' | 'user_id'>) => {
    if (!userId) return;
    const id = uid();
    const { error } = await supabase.from('recipes').insert({
      id, user_id: userId,
      title: data.title, category: data.category, description: data.description,
      base_servings: data.base_servings, total_minutes: data.total_minutes,
      difficulty: data.difficulty, tags: data.tags, note: data.note,
      favorite: false, in_cart: false, cook_count: 0, last_cooked_at: null, version: 1,
    });
    if (error) throw error;

    if (data.ingredients.length) {
      await supabase.from('ingredients').insert(
        data.ingredients.map((ing, idx) => ({ ...ing, id: uid(), recipe_id: id, sort_order: idx }))
      );
    }
    if (data.steps.length) {
      await supabase.from('steps').insert(
        data.steps.map((s, idx) => ({ ...s, id: uid(), recipe_id: id, sort_order: idx }))
      );
    }
    await fetchRecipes();
  };

  const updateRecipe = async (id: string, patch: Partial<Recipe>) => {
    const current = recipes.find((r) => r.id === id);
    if (!current) return;

    if (patch.ingredients !== undefined || patch.steps !== undefined) {
      await saveVersion(current);
      const newVersion = current.version + 1;

      await supabase.from('recipes').update({
        ...patch,
        version: newVersion,
        updated_at: new Date().toISOString(),
      }).eq('id', id);

      if (patch.ingredients) {
        await supabase.from('ingredients').delete().eq('recipe_id', id);
        await supabase.from('ingredients').insert(
          patch.ingredients.map((ing, idx) => ({ ...ing, recipe_id: id, sort_order: idx }))
        );
      }
      if (patch.steps) {
        await supabase.from('steps').delete().eq('recipe_id', id);
        await supabase.from('steps').insert(
          patch.steps.map((s, idx) => ({ ...s, recipe_id: id, sort_order: idx }))
        );
      }
    } else {
      await supabase.from('recipes').update({
        ...patch,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
    }

    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const deleteRecipe = async (id: string) => {
    await supabase.from('recipes').delete().eq('id', id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const markCooked = async (id: string) => {
    const r = recipes.find((x) => x.id === id);
    if (!r) return;
    const count = (r.cook_count || 0) + 1;
    await updateRecipe(id, {
      tried: true,
      cook_count: count,
      last_cooked_at: new Date().toISOString(),
    } as unknown as Partial<Recipe>);
  };

  return { recipes, loading, addRecipe, updateRecipe, deleteRecipe, markCooked, refresh: fetchRecipes };
}
