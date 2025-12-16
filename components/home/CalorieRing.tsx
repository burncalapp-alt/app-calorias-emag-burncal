'use client';

import React from 'react';

interface CalorieRingProps {
    remaining: number;
    consumed: number;
    burned: number;
    goal: number;
    streak: number;
}

export function CalorieRing({ remaining, consumed, burned, goal, streak }: CalorieRingProps) {
    const percentage = Math.min(100, (consumed / goal) * 100);
    const circumference = 2 * Math.PI * 70;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex items-start gap-6 py-4">
            {/* Left side stats */}
            <div className="flex-1 space-y-4">
                {/* Streak */}
                <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <span className="text-lg font-bold text-orange-400" suppressHydrationWarning>{streak} dias</span>
                </div>

                {/* Consumed */}
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-base">🍽️</span>
                        <span className="text-sm text-[var(--muted)]">Consumido</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-[var(--foreground)]" suppressHydrationWarning>{consumed.toLocaleString('pt-BR')}</span>
                        <span className="text-sm text-[var(--muted)]">kcal</span>
                    </div>
                </div>

                {/* Burned */}
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-base">🏃</span>
                        <span className="text-sm text-[var(--muted)]">Queimado</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[var(--foreground)]" suppressHydrationWarning>{burned.toLocaleString('pt-BR')}</span>
                        <span className="text-sm text-[var(--muted)]">kcal</span>
                    </div>
                </div>
            </div>

            {/* Right side - Circular Progress */}
            <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                    {/* Background circle */}
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="12"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                    />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[var(--foreground)]" suppressHydrationWarning>{remaining.toLocaleString('pt-BR')}</span>
                    <span className="text-xs text-[var(--muted)]">Restante</span>
                </div>
            </div>
        </div>
    );
}
