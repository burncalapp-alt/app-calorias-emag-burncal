'use client';

import React, { useEffect, useState } from 'react';

interface NutritionChartProps {
    carbs: number;
    protein: number;
    fat: number;
}

export function NutritionChart({ carbs, protein, fat }: NutritionChartProps) {
    const [animatedValues, setAnimatedValues] = useState({ protein: 0, carbs: 0, fat: 0 });

    const total = carbs + protein + fat;
    const safeTotal = total || 1;

    // Target percentages
    const targetCarbs = Math.round((carbs / safeTotal) * 100);
    const targetProtein = Math.round((protein / safeTotal) * 100);
    const targetFat = Math.round((fat / safeTotal) * 100);

    useEffect(() => {
        // Animate values on mount
        const timer = setTimeout(() => {
            setAnimatedValues({
                protein: targetProtein,
                carbs: targetCarbs,
                fat: targetFat
            });
        }, 200);
        return () => clearTimeout(timer);
    }, [targetCarbs, targetProtein, targetFat]);

    return (
        <div
            className="card-hover rounded-2xl p-6 animate-fade-in relative overflow-hidden bg-[var(--card)] shadow-sm"
            style={{
                animationDelay: '200ms'
            }}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Nutrição</h3>
                <span className="text-xs font-medium bg-[var(--background)] text-[var(--muted)] px-2 py-1 rounded-md border border-[var(--border)]">Hoje</span>
            </div>

            <div className="flex items-center gap-8">
                {/* Minimal Stacked Bar Visualization */}
                <div className="flex-1 flex flex-col gap-5">
                    <div className="space-y-4">
                        {/* Protein */}
                        <div className="group">
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="text-[var(--muted)] flex items-center gap-2 group-hover:text-red-400 transition-colors">
                                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                    Proteínas
                                </span>
                                <span className="text-[var(--foreground)] font-bold">{targetProtein}%</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--border)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)] relative overflow-hidden transition-all duration-[1200ms] cubic-bezier(0.34, 1.56, 0.64, 1)"
                                    style={{ width: `${animatedValues.protein}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/10 skew-x-12 -translate-x-full animate-shimmer-fast" />
                                </div>
                            </div>
                        </div>

                        {/* Carbs */}
                        <div className="group">
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="text-[var(--muted)] flex items-center gap-2 group-hover:text-green-400 transition-colors">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span>
                                    Carboidratos
                                </span>
                                <span className="text-[var(--foreground)] font-bold">{targetCarbs}%</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--border)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)] relative overflow-hidden transition-all duration-[1200ms] cubic-bezier(0.34, 1.56, 0.64, 1)"
                                    style={{ width: `${animatedValues.carbs}%`, transitionDelay: '100ms' }}
                                >
                                    <div className="absolute inset-0 bg-white/10 skew-x-12 -translate-x-full animate-shimmer-fast" />
                                </div>
                            </div>
                        </div>

                        {/* Fats */}
                        <div className="group">
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="text-[var(--muted)] flex items-center gap-2 group-hover:text-orange-400 transition-colors">
                                    <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]"></span>
                                    Gorduras
                                </span>
                                <span className="text-[var(--foreground)] font-bold">{targetFat}%</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--border)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-400 rounded-full shadow-[0_0_10px_rgba(251,146,60,0.3)] relative overflow-hidden transition-all duration-[1200ms] cubic-bezier(0.34, 1.56, 0.64, 1)"
                                    style={{ width: `${animatedValues.fat}%`, transitionDelay: '200ms' }}
                                >
                                    <div className="absolute inset-0 bg-white/10 skew-x-12 -translate-x-full animate-shimmer-fast" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Circular Representation with animation */}
                <div className="relative w-28 h-28 flex-shrink-0 animate-scale-in" style={{ animationDelay: '400ms' }}>
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 36 36">
                        <path
                            className="text-[var(--border)]"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                        />
                        {/* Protein Segment */}
                        <circle
                            className="text-red-500 transition-all duration-[1500ms] ease-out"
                            strokeDasharray={`${animatedValues.protein}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                        />
                        {/* Carbs Segment (offset) */}
                        <circle
                            className="text-orange-500 transition-all duration-[1500ms] ease-out"
                            strokeDasharray={`${animatedValues.carbs}, 100`}
                            strokeDashoffset={-animatedValues.protein}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            style={{ transitionDelay: '100ms' }}
                        />
                        {/* Fat Segment (offset) */}
                        <circle
                            className="text-orange-400 transition-all duration-[1500ms] ease-out"
                            strokeDasharray={`${animatedValues.fat}, 100`}
                            strokeDashoffset={-(animatedValues.protein + animatedValues.carbs)}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            style={{ transitionDelay: '200ms' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in" style={{ animationDelay: '800ms' }}>
                        <span className="text-[10px] text-[var(--muted)] font-medium">Macros</span>
                        <span className="text-xs font-bold text-[var(--foreground)]">Hoje</span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @keyframes shimmer-fast {
          0% { transform: translateX(-150%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer-fast {
          animation: shimmer 2s infinite linear;
          animation-duration: 1.5s;
        }
        @keyframes scale-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
        }
      `}</style>
        </div>
    );
}
