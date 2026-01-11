'use client';

import React from 'react';
import { Beef, Wheat, Flame } from 'lucide-react';

interface MacroBarsProps {
    protein: { current: number; goal: number };
    carbs: { current: number; goal: number };
    fat: { current: number; goal: number };
}

// Reusable circular progress component for macros
function MacroRing({
    current,
    goal,
    color,
    icon: Icon,
    label
}: {
    current: number;
    goal: number;
    color: string;
    icon: React.ElementType;
    label: string;
}) {
    const percentage = Math.min(100, (current / goal) * 100);
    const circumference = 2 * Math.PI * 35;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const remaining = Math.max(0, goal - current);

    return (
        <div className="flex flex-col items-center p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            {/* Value Display */}
            <div className="text-center mb-2">
                <p className="text-2xl font-black text-[var(--foreground)]" suppressHydrationWarning>{remaining}g</p>
                <p className="text-xs text-[var(--muted)] leading-tight">{label}<br />restante</p>
            </div>

            {/* Circular Progress */}
            <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                    {/* Background circle */}
                    <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="6"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                    />
                </svg>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-6 h-6" style={{ color }} />
                </div>
            </div>
        </div>
    );
}

export function MacroBars({ protein, carbs, fat }: MacroBarsProps) {
    return (
        <div className="grid grid-cols-3 gap-3 mt-4">
            <MacroRing
                current={protein.current}
                goal={protein.goal}
                color="#ef4444"
                icon={Beef}
                label="Proteína"
            />
            <MacroRing
                current={carbs.current}
                goal={carbs.goal}
                color="#f97316"
                icon={Wheat}
                label="Carboidrato"
            />
            <MacroRing
                current={fat.current}
                goal={fat.goal}
                color="#3b82f6"
                icon={Flame}
                label="Gordura"
            />
        </div>
    );
}
