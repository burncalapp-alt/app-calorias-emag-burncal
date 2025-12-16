'use client';

import React, { useEffect, useState } from 'react';
import { Target, TrendingDown } from 'lucide-react';

interface WeightGoalChartProps {
    currentWeight: number;
    startWeight: number;
    goalWeight: number;
}

export function WeightGoalChart({ currentWeight, startWeight, goalWeight }: WeightGoalChartProps) {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const totalToLose = startWeight - goalWeight;
    const lostSoFar = startWeight - currentWeight;
    const targetProgress = Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
    const remaining = currentWeight - goalWeight;

    useEffect(() => {
        // Small delay before starting animation for visual effect
        const timer = setTimeout(() => {
            setAnimatedProgress(targetProgress);
        }, 300);
        return () => clearTimeout(timer);
    }, [targetProgress]);

    return (
        <div
            className="card-hover rounded-2xl p-6 animate-fade-in relative overflow-hidden group bg-[var(--card)] shadow-sm"
            style={{
                animationDelay: '100ms'
            }}
        >
            {/* Subtle background glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-1000 group-hover:bg-blue-500/10" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                        <Target size={20} className="text-blue-500 animate-pulse-slow" />
                        Meta de Peso
                    </h3>
                    <p className="text-sm text-[var(--muted)] mt-1">Faltam <span className="text-[var(--foreground)] font-bold">{remaining.toFixed(1)} kg</span></p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center transition-transform hover:rotate-12 duration-300">
                    <TrendingDown size={20} className="text-blue-500" />
                </div>
            </div>

            {/* Progress Bar Container */}
            <div className="relative pt-8 pb-4">
                {/* Track */}
                <div className="h-4 bg-[var(--border)] rounded-full overflow-hidden shadow-inner">
                    {/* Fill */}
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300 rounded-full transition-all duration-[1500ms] ease-out relative"
                        style={{ width: `${animatedProgress}%` }}
                    >
                        {/* Shimmer effect on the bar */}
                        <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full animate-shimmer" />
                    </div>
                </div>

                {/* Start Label */}
                <div className="absolute top-0 left-0 -translate-x-0 transform opacity-0 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
                    <span className="text-xs font-medium text-[var(--muted)]">Início</span>
                    <div className="text-xs font-bold text-[var(--foreground)]">{startWeight} kg</div>
                </div>

                {/* Current Label (Floating) */}
                <div
                    className="absolute top-8 transform -translate-x-1/2 flex flex-col items-center transition-all duration-[1500ms] ease-out z-20"
                    style={{ left: `${animatedProgress}%` }}
                >
                    <div className="w-0.5 h-3 bg-blue-500 mb-1 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_4px_12px_rgba(59,130,246,0.4)] hover:scale-110 transition-transform cursor-default">
                        Hoje
                    </div>
                    <div className="text-xs font-bold text-[var(--foreground)] mt-1 drop-shadow-md bg-[var(--background)] px-1 rounded">{currentWeight} kg</div>
                </div>

                {/* Goal Label */}
                <div className="absolute top-0 right-0 translate-x-0 transform text-right opacity-0 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
                    <span className="text-xs font-medium text-[var(--muted)]">Meta</span>
                    <div className="text-xs font-bold text-[var(--foreground)]">{goalWeight} kg</div>
                </div>
            </div>

            <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
