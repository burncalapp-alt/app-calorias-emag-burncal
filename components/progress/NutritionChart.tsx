'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Droplet, Beef } from 'lucide-react';

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
        const timer = setTimeout(() => {
            setAnimatedValues({
                protein: targetProtein,
                carbs: targetCarbs,
                fat: targetFat
            });
        }, 200);
        return () => clearTimeout(timer);
    }, [targetCarbs, targetProtein, targetFat]);

    // Helpers SVG para os anéis do Activity Chart
    const ringConfig = {
        protein: { color: 'text-red-500', bg: 'text-red-500/10', r: 70, stroke: 12 },
        carbs: { color: 'text-orange-500', bg: 'text-orange-500/10', r: 54, stroke: 12 },
        fat: { color: 'text-yellow-400', bg: 'text-yellow-400/10', r: 38, stroke: 12 },
    };

    const getCircumference = (r: number) => 2 * Math.PI * r;

    return (
        <div className="rounded-3xl p-6 relative overflow-hidden bg-(--card) shadow-xl border border-(--border)">
            {/* Soft Ambient Spark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex justify-between items-center mb-6 z-10 relative">
                <h3 className="text-lg font-bold text-(--foreground) tracking-tight">Energia & Macros</h3>
                <span className="text-xs font-bold bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full border border-orange-500/20 shadow-sm">
                    Hoje
                </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-4 justify-between relative z-10 w-full">

                {/* 1. Área do Gráfico de Anéis Circulares (Concentric Rings) */}
                <div className="relative w-[180px] h-[180px] flex-shrink-0 animate-scale-in" style={{ animationDelay: '100ms' }}>
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]" viewBox="0 0 160 160">
                        {/* Fundos dos Anéis */}
                        <circle cx="80" cy="80" r={ringConfig.protein.r} fill="none" stroke="currentColor" strokeWidth={ringConfig.protein.stroke} className={ringConfig.protein.bg} />
                        <circle cx="80" cy="80" r={ringConfig.carbs.r} fill="none" stroke="currentColor" strokeWidth={ringConfig.carbs.stroke} className={ringConfig.carbs.bg} />
                        <circle cx="80" cy="80" r={ringConfig.fat.r} fill="none" stroke="currentColor" strokeWidth={ringConfig.fat.stroke} className={ringConfig.fat.bg} />

                        {/* Anel Proteína */}
                        <circle
                            cx="80" cy="80" r={ringConfig.protein.r}
                            fill="none" stroke="currentColor" strokeWidth={ringConfig.protein.stroke} strokeLinecap="round"
                            className={ringConfig.protein.color + " transition-all duration-[1500ms] ease-out drop-shadow-lg"}
                            strokeDasharray={`${getCircumference(ringConfig.protein.r)}`}
                            strokeDashoffset={`${getCircumference(ringConfig.protein.r) - (animatedValues.protein / 100) * getCircumference(ringConfig.protein.r)}`}
                        />
                        {/* Anel Carbo */}
                        <circle
                            cx="80" cy="80" r={ringConfig.carbs.r}
                            fill="none" stroke="currentColor" strokeWidth={ringConfig.carbs.stroke} strokeLinecap="round"
                            className={ringConfig.carbs.color + " transition-all duration-[1500ms] ease-out drop-shadow-lg"}
                            strokeDasharray={`${getCircumference(ringConfig.carbs.r)}`}
                            strokeDashoffset={`${getCircumference(ringConfig.carbs.r) - (animatedValues.carbs / 100) * getCircumference(ringConfig.carbs.r)}`}
                            style={{ transitionDelay: '100ms' }}
                        />
                        {/* Anel Gordura */}
                        <circle
                            cx="80" cy="80" r={ringConfig.fat.r}
                            fill="none" stroke="currentColor" strokeWidth={ringConfig.fat.stroke} strokeLinecap="round"
                            className={ringConfig.fat.color + " transition-all duration-[1500ms] ease-out drop-shadow-lg"}
                            strokeDasharray={`${getCircumference(ringConfig.fat.r)}`}
                            strokeDashoffset={`${getCircumference(ringConfig.fat.r) - (animatedValues.fat / 100) * getCircumference(ringConfig.fat.r)}`}
                            style={{ transitionDelay: '200ms' }}
                        />
                    </svg>

                    {/* Fogo Central */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-pulse-slow">
                        <Flame size={28} className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
                    </div>
                </div>

                {/* 2. Legenda Animada e Detalhada à Direita */}
                <div className="flex-1 w-full space-y-4 pt-2">

                    {/* Proteína */}
                    <div className="bg-(--background) rounded-xl p-3 border border-(--border) flex items-center justify-between shadow-sm group hover:border-red-500/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                <Beef size={16} className="text-red-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-(--muted) uppercase">Proteína</p>
                                <p className="text-sm font-black text-(--foreground)">{protein}g</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-black text-red-500 drop-shadow-sm">{animatedValues.protein}%</span>
                        </div>
                    </div>

                    {/* Carboidratos */}
                    <div className="bg-(--background) rounded-xl p-3 border border-(--border) flex items-center justify-between shadow-sm group hover:border-orange-500/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                                <Flame size={16} className="text-orange-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-(--muted) uppercase">Carboidratos</p>
                                <p className="text-sm font-black text-(--foreground)">{carbs}g</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-black text-orange-500 drop-shadow-sm">{animatedValues.carbs}%</span>
                        </div>
                    </div>

                    {/* Gorduras */}
                    <div className="bg-(--background) rounded-xl p-3 border border-(--border) flex items-center justify-between shadow-sm group hover:border-yellow-400/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors">
                                <Droplet size={16} className="text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-(--muted) uppercase">Gorduras</p>
                                <p className="text-sm font-black text-(--foreground)">{fat}g</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-black text-yellow-500 drop-shadow-sm">{animatedValues.fat}%</span>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx global>{`
                @keyframes scale-in {
                    0% { transform: scale(0.8) rotate(-10deg); opacity: 0; }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    opacity: 0;
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
