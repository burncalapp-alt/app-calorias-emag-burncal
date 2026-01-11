'use client';

import React from 'react';
import { ArrowLeft, Check, Clock, Flame, ChevronDown, ChevronUp } from 'lucide-react';

interface Meal {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    ingredients: string[];
    instructions: string;
    is_eaten?: boolean;
}

interface MealOptionsViewProps {
    category: 'breakfast' | 'lunch' | 'snack' | 'dinner';
    meals: Meal[];
    onBack: () => void;
    onToggleMeal: (index: number) => void;
}

const categoryInfo = {
    breakfast: { label: 'Café da Manhã', emoji: '☕', color: 'from-orange-500 to-amber-500' },
    lunch: { label: 'Almoço', emoji: '🍽️', color: 'from-green-500 to-emerald-500' },
    snack: { label: 'Lanche', emoji: '🍎', color: 'from-pink-500 to-rose-500' },
    dinner: { label: 'Jantar', emoji: '🌙', color: 'from-indigo-500 to-purple-500' },
};

export function MealOptionsView({ category, meals, onBack, onToggleMeal }: MealOptionsViewProps) {
    const [expandedMeal, setExpandedMeal] = React.useState<number | null>(null);
    const info = categoryInfo[category];

    return (
        <div className="min-h-screen bg-[var(--background)] -mx-4 px-4 pt-4 pb-32 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-3 bg-[var(--muted)]/10 hover:bg-[var(--foreground)]/5 rounded-xl transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <span className="text-3xl">{info.emoji}</span>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">{info.label}</h1>
                    <p className="text-[var(--muted)] text-sm">Escolha uma opção para hoje</p>
                </div>
            </div>

            {/* Meal Options */}
            <div className="space-y-4">
                {meals.map((meal, idx) => {
                    const isExpanded = expandedMeal === idx;
                    const isEaten = meal.is_eaten;

                    return (
                        <div
                            key={idx}
                            className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isEaten
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-[var(--card)] border-[var(--border)] hover:border-orange-500/30'
                                }`}
                        >
                            {/* Card Header */}
                            <div
                                onClick={() => setExpandedMeal(isExpanded ? null : idx)}
                                className="p-4 flex items-center gap-4 cursor-pointer"
                            >
                                {/* Check Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleMeal(idx);
                                    }}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 ${isEaten
                                        ? 'bg-green-500 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                                        : 'border-[var(--border)] hover:border-green-500 hover:bg-green-500/10'
                                        }`}
                                >
                                    {isEaten && <Check className="w-6 h-6 text-white" strokeWidth={3} />}
                                </button>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold text-base leading-tight ${isEaten ? 'text-green-500 line-through' : 'text-[var(--foreground)]'}`}>
                                        {meal.name}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className={`font-bold ${isEaten ? 'text-green-600/70' : 'text-orange-500'}`}>
                                            <Flame className="w-4 h-4 inline mr-1" />
                                            {meal.calories} kcal
                                        </span>
                                        <span className="text-[var(--muted)]">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            ~15 min
                                        </span>
                                    </div>
                                </div>

                                {/* Chevron */}
                                {isExpanded ? (
                                    <ChevronUp className="text-[var(--muted)] shrink-0" />
                                ) : (
                                    <ChevronDown className="text-[var(--muted)] shrink-0" />
                                )}
                            </div>

                            {/* Expanded Content */}
                            <div className={`transition-all duration-300 ease-in-out border-t border-[var(--border)] ${isExpanded ? 'max-h-[500px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0 overflow-hidden'}`}>
                                {/* Macros */}
                                <div className="flex gap-2 mb-4">
                                    <MacroChip label="P" value={meal.protein} color="text-blue-500" />
                                    <MacroChip label="C" value={meal.carbs} color="text-green-500" />
                                    <MacroChip label="G" value={meal.fats} color="text-yellow-500" />
                                </div>

                                {/* Ingredients */}
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Ingredientes</p>
                                    <ul className="space-y-1.5">
                                        {meal.ingredients.map((ing, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                {ing}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Instructions */}
                                {meal.instructions && (
                                    <div className="pt-3 border-t border-[var(--border)]">
                                        <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Como Preparar</p>
                                        <p className="text-sm text-[var(--muted)] italic">"{meal.instructions}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="px-3 py-1.5 rounded-lg bg-[var(--muted)]/10 border border-[var(--border)] flex items-center gap-1.5 text-xs">
            <span className={`font-bold ${color}`}>{label}</span>
            <span className="font-bold text-[var(--foreground)]">{value}g</span>
        </div>
    );
}
