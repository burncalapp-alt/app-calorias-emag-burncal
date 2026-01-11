'use client';

import React, { useState, useEffect } from 'react';
import { useUserContext } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabaseClient';
import { formatDateForDB } from '@/lib/utils';
import { Loader2, Sparkles, ChefHat, RefreshCw, AlertCircle, Flame, Check, ChevronDown } from 'lucide-react';
import { MealOptionsView } from './MealOptionsView';

interface Meal {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    ingredients: string[];
    instructions: string;
    is_eaten?: boolean;
    log_id?: string;
}

interface MealCategories {
    breakfast: Meal[];
    lunch: Meal[];
    snack: Meal[];
    dinner: Meal[];
}

interface NutritionPlan {
    id: string;
    calories_target: number;
    protein_target: number;
    carbs_target: number;
    fats_target: number;
    meal_categories: MealCategories;
}

interface NutritionTabProps {
    date: Date;
}

type CategoryKey = 'breakfast' | 'lunch' | 'snack' | 'dinner';

const categoryInfo: Record<CategoryKey, { label: string; emoji: string; image: string; color: string; borderColor: string }> = {
    breakfast: { label: 'Café da Manhã', emoji: '☕', image: '/assets/nutrition/breakfast.png', color: 'from-orange-500/10 to-orange-600/10', borderColor: 'border-orange-500/20' },
    lunch: { label: 'Almoço', emoji: '🍽️', image: '/assets/nutrition/lunch.png', color: 'from-orange-500/10 to-red-500/10', borderColor: 'border-orange-500/20' },
    snack: { label: 'Lanche', emoji: '🍎', image: '/assets/nutrition/snack.png', color: 'from-orange-400/10 to-amber-500/10', borderColor: 'border-orange-400/20' },
    dinner: { label: 'Jantar', emoji: '🌙', image: '/assets/nutrition/dinner.png', color: 'from-red-500/10 to-orange-600/10', borderColor: 'border-red-500/20' },
};

export function NutritionTab({ date }: NutritionTabProps) {
    const { user, profile, goals } = useUserContext();
    const [plan, setPlan] = useState<NutritionPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
    const [generatingCategory, setGeneratingCategory] = useState<CategoryKey | null>(null);

    useEffect(() => {
        if (user) {
            fetchPlan();
        }
    }, [user, date]);

    const fetchPlan = async () => {
        setLoading(true);
        setError(null);
        try {
            const dateStr = formatDateForDB(date);
            const { data, error } = await supabase
                .from('nutrition_plans')
                .select('*')
                .eq('user_id', user?.id)
                .eq('date', dateStr)
                .single();

            if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
                console.error('Error fetching plan:', error);
            }

            setPlan(data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const generatePlan = async () => {
        if (!user) return;
        setGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/generate-nutrition-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile }),
            });

            if (!response.ok) throw new Error('Falha na geração do plano');
            const aiData = await response.json();

            const dateStr = formatDateForDB(date);
            try {
                const { data: savedPlan, error: saveError } = await supabase
                    .from('nutrition_plans')
                    .upsert({
                        user_id: user.id,
                        date: dateStr,
                        calories_target: aiData.calories_target,
                        protein_target: aiData.protein_target,
                        carbs_target: aiData.carbs_target,
                        fats_target: aiData.fats_target,
                        meal_categories: aiData.meal_categories
                    }, { onConflict: 'user_id, date' })
                    .select()
                    .single();

                if (saveError) {
                    console.error("Error saving plan:", saveError);
                    setPlan(aiData);
                } else {
                    setPlan(savedPlan);
                }
            } catch (dbError: any) {
                console.error("Database save failed:", dbError);
                setPlan(aiData);
            }

        } catch (err: any) {
            console.error('Gen Error:', err);
            setError(err.message || 'Erro ao gerar plano');
        } finally {
            setGenerating(false);
        }
    };

    const generateCategoryOptions = async (category: CategoryKey) => {
        if (!user) return;
        setGeneratingCategory(category);
        setError(null);

        try {
            // Optimistic plan creation if it doesn't exist
            let currentPlan = plan;
            if (!currentPlan) {
                // Initialize a skeleton plan if completely new
                const dateStr = formatDateForDB(date);
                currentPlan = {
                    id: 'temp',
                    calories_target: 0,
                    protein_target: 0,
                    carbs_target: 0,
                    fats_target: 0,
                    meal_categories: { breakfast: [], lunch: [], snack: [], dinner: [] }
                };
                setPlan(currentPlan);
            }

            const response = await fetch('/api/ai/generate-nutrition-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile, category }),
            });

            if (!response.ok) throw new Error('Falha ao gerar opções');
            const data = await response.json();

            // Merge new options into plan
            const updatedCategories = {
                ...currentPlan.meal_categories,
                [category]: data.meals // API returns { meals: [...] } for single category
            };

            const updatedPlan = {
                ...currentPlan,
                meal_categories: updatedCategories,
                // Update targets if provided (legacy or new full generation)
                ...(data.calories_target ? {
                    calories_target: data.calories_target,
                    protein_target: data.protein_target,
                    carbs_target: data.carbs_target,
                    fats_target: data.fats_target
                } : {})
            };

            setPlan(updatedPlan);

            // Save to DB
            const dateStr = formatDateForDB(date);
            await supabase
                .from('nutrition_plans')
                .upsert({
                    user_id: user.id,
                    date: dateStr,
                    meal_categories: updatedCategories,
                    // Persist targets if we have them
                    calories_target: updatedPlan.calories_target || 2000,
                    protein_target: updatedPlan.protein_target || 150,
                    carbs_target: updatedPlan.carbs_target || 200,
                    fats_target: updatedPlan.fats_target || 60
                }, { onConflict: 'user_id, date' });

            // Auto-open the category after generation
            setSelectedCategory(category);

        } catch (err: any) {
            console.error('Gen Error:', err);
            setError(err.message || 'Erro ao gerar');
        } finally {
            setGeneratingCategory(null);
        }
    };

    const toggleMealInCategory = async (category: CategoryKey, mealIndex: number) => {
        if (!plan || !user) return;

        const currentMeal = plan.meal_categories[category][mealIndex];
        const isNowEaten = !currentMeal.is_eaten;
        const dateStr = formatDateForDB(date);

        // Optimistic Update
        const updatedCategories = { ...plan.meal_categories };
        updatedCategories[category] = [...updatedCategories[category]];
        updatedCategories[category][mealIndex] = {
            ...currentMeal,
            is_eaten: isNowEaten
        };

        const updatedPlan = { ...plan, meal_categories: updatedCategories };
        setPlan(updatedPlan);

        try {
            let logId = currentMeal.log_id;

            if (isNowEaten) {
                // Add to meals table
                const { data: newMeal, error: insertError } = await supabase
                    .from('meals')
                    .insert({
                        user_id: user.id,
                        title: currentMeal.name,
                        calories: currentMeal.calories,
                        protein: currentMeal.protein,
                        carbs: currentMeal.carbs,
                        fat: currentMeal.fats,
                        image_url: categoryInfo[category].image, // Use category image as fallback
                        date: dateStr
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;
                logId = newMeal.id;

                // Update local intent
                updatedCategories[category][mealIndex].log_id = logId;
            } else if (logId) {
                // Remove from meals table
                const { error: deleteError } = await supabase
                    .from('meals')
                    .delete()
                    .eq('id', logId);

                if (deleteError) {
                    console.error("Error removing meal log:", deleteError);
                    // Continue anyway to maintain UI consistency, or handle revert
                }
                updatedCategories[category][mealIndex].log_id = undefined;
            }

            // Sync plan to DB with new logId state
            const { error } = await supabase
                .from('nutrition_plans')
                .update({ meal_categories: updatedCategories })
                .eq('user_id', user.id)
                .eq('date', dateStr);

            if (error) throw error;

            // Final consistency check (optional, but good)
            setPlan({ ...plan, meal_categories: updatedCategories });

        } catch (err) {
            console.error("Error updating meal status:", err);
            // Revert optimistic update
            setPlan(plan);
            setError("Erro ao sincronizar refeição. Tente novamente.");
        }
    };

    const getCategoryProgress = (category: CategoryKey): { eaten: number; total: number } => {
        if (!plan?.meal_categories?.[category]) return { eaten: 0, total: 0 };
        const meals = plan.meal_categories[category];
        const eaten = meals.filter(m => m.is_eaten).length;
        return { eaten, total: meals.length };
    };

    // If a category is selected, show the meal options view
    if (selectedCategory && plan?.meal_categories?.[selectedCategory]) {
        return (
            <MealOptionsView
                category={selectedCategory}
                meals={plan.meal_categories[selectedCategory]}
                onBack={() => setSelectedCategory(null)}
                onToggleMeal={(idx) => toggleMealInCategory(selectedCategory, idx)}
            />
        );
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (generating) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-8">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-gray-800 rounded-full" />
                    <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin" />
                    <Flame className="absolute inset-0 m-auto text-orange-500 w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-2 animate-pulse">
                    <h3 className="text-xl font-bold text-white">Criando seu Cardápio...</h3>
                    <p className="text-gray-400">Gerando 20 opções de refeições personalizadas</p>
                </div>
            </div>
        );
    }

    // MAIN VIEW - Category Cards
    return (
        <div className="space-y-6 pb-32 animate-in fade-in duration-700 min-h-screen bg-[var(--background)] -mx-4 px-4 pt-4">
            {/* Header */}
            <div className="relative overflow-hidden rounded-[2rem] bg-[var(--card)] border border-[var(--border)] p-6 shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full pointer-events-none" />

                <div className="flex justify-between items-start mb-4">
                    <div className="relative z-10">
                        <span className="text-orange-500 font-bold tracking-wider text-xs uppercase mb-1 block">Meta Diária</span>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-bold text-[var(--foreground)]">{Math.round(goals.dailyCalories)}</h2>
                            <span className="text-[var(--muted)] font-medium">kcal</span>
                        </div>
                    </div>
                    <button onClick={generatePlan} className="p-3 bg-[var(--muted)]/10 hover:bg-[var(--foreground)]/5 rounded-xl transition-colors text-[var(--muted)] hover:text-[var(--foreground)] relative z-10">
                        <RefreshCw size={20} />
                    </button>
                </div>

                {/* Macro Summary */}
                <div className="flex gap-4 text-sm font-medium">
                    <span className="text-blue-500"><strong>{goals.macros.protein}g</strong> Proteína</span>
                    <span className="text-green-500"><strong>{goals.macros.carbs}g</strong> Carbo</span>
                    <span className="text-yellow-500"><strong>{goals.macros.fat}g</strong> Gordura</span>
                </div>
            </div>

            {/* Category Cards */}
            <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">Escolha sua Refeição</h3>
                </div>

                {(['breakfast', 'lunch', 'snack', 'dinner'] as CategoryKey[]).map((category, idx) => {
                    const info = categoryInfo[category];
                    const progress = getCategoryProgress(category);
                    const hasEaten = progress.eaten > 0;
                    const hasOptions = progress.total > 0;
                    const isGenerating = generatingCategory === category;

                    return (
                        <button
                            key={category}
                            disabled={isGenerating}
                            onClick={() => {
                                if (hasOptions) {
                                    setSelectedCategory(category);
                                } else {
                                    generateCategoryOptions(category);
                                }
                            }}
                            className={`w-full rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-in slide-in-from-bottom-4 fill-mode-both ${hasEaten
                                ? 'bg-green-500/10 border-green-500/30'
                                : `bg-[var(--card)] ${info.borderColor} hover:border-orange-500/40`
                                }`}
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className={`p-4 flex items-center gap-4 bg-gradient-to-r ${info.color}`}>
                                {/* Image */}
                                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/20 shrink-0 relative bg-black/5 flex items-center justify-center shadow-sm">
                                    {isGenerating ? (
                                        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                                    ) : (
                                        <img
                                            src={info.image}
                                            alt={info.label}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).parentElement!.innerText = info.emoji;
                                                (e.target as HTMLImageElement).parentElement!.className = "w-16 h-16 rounded-xl border-2 border-white/20 shrink-0 flex items-center justify-center text-3xl bg-white/30";
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-left">
                                    <h4 className="font-bold text-lg text-[var(--foreground)] flex items-center gap-2">
                                        {info.label}
                                        {hasEaten && <Check className="w-5 h-5 text-green-500" />}
                                    </h4>
                                    <p className="text-[var(--muted)] text-sm font-medium">
                                        {isGenerating ? 'Gerando opções...' : hasOptions ? `${progress.total} opções` : 'Toque para gerar opções'}
                                        {progress.eaten > 0 && ` • ${progress.eaten} feita`}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <div className="text-[var(--muted)]">
                                    {isGenerating ? null : <ChevronDown className="-rotate-90" />}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 animate-fade-in mx-4">
                    <AlertCircle size={20} />
                    <span className="text-sm">{error}</span>
                </div>
            )}
        </div>
    );
}
