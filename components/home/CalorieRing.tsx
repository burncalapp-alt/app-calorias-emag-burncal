'use client';

import React from 'react';
import { Flame } from 'lucide-react';

interface CalorieRingProps {
    remaining: number;
    consumed: number;
    burned: number;
    goal: number;
    streak: number;
}

export function CalorieRing({ remaining, consumed, burned, goal, streak }: CalorieRingProps) {
    const percentage = Math.min(100, (consumed / goal) * 100);
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex items-center justify-between gap-4">
            {/* Left side - Calorie Display */}
            <div className="flex-1">
                {/* Streak Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-2">
                    <span className="text-base">🔥</span>
                    <span className="text-sm font-bold text-orange-400" suppressHydrationWarning>{streak} dias</span>
                </div>

                {/* Main Calorie Number */}
                <div className="mb-0.5">
                    <span className="text-4xl font-black text-[var(--foreground)] tracking-tight" suppressHydrationWarning>
                        {remaining.toLocaleString('pt-BR')}
                    </span>
                </div>
                <p className="text-sm text-[var(--muted)]">Calorias restantes</p>

                {/* Consumed stat - compact */}
                <div className="flex items-center gap-2 mt-3">
                    <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center">
                        <span className="text-xs">🍽️</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xs text-[var(--muted)]">Consumido</span>
                        <span className="text-sm font-bold text-[var(--foreground)]" suppressHydrationWarning>{consumed.toLocaleString('pt-BR')} kcal</span>
                    </div>
                </div>
            </div>

            {/* Right side - Circular Progress */}
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
                    {/* Background circle */}
                    <circle
                        cx="45"
                        cy="45"
                        r="40"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="7"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="45"
                        cy="45"
                        r="40"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-700 ease-out"
                    />
                </svg>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Flame className="w-7 h-7 text-orange-500 fill-orange-500/20" />
                </div>
            </div>
        </div>
    );
}

