'use client';

import React from 'react';

interface MacroBarsProps {
    protein: { current: number; goal: number };
    carbs: { current: number; goal: number };
    fat: { current: number; goal: number };
}

export function MacroBars({ protein, carbs, fat }: MacroBarsProps) {
    const macros = [
        {
            label: 'Proteínas',
            icon: '🥩',
            current: protein.current,
            goal: protein.goal,
            color: '#ef4444'
        },
        {
            label: 'Carboidratos',
            icon: '🌾',
            current: carbs.current,
            goal: carbs.goal,
            color: '#22c55e'
        },
        {
            label: 'Gorduras',
            icon: '🥑',
            current: fat.current,
            goal: fat.goal,
            color: '#f59e0b'
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-[var(--border)] mt-2">
            {macros.map((macro) => {
                const percentage = Math.min(100, (macro.current / macro.goal) * 100);
                return (
                    <div key={macro.label} className="flex flex-col items-center gap-2">
                        {/* Label with icon */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm">{macro.icon}</span>
                            <span className="text-xs text-[var(--muted)] font-medium">{macro.label}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: macro.color
                                }}
                            />
                        </div>

                        {/* Values */}
                        <span className="text-sm text-[var(--foreground)] font-semibold">
                            <span suppressHydrationWarning>{macro.current} / {macro.goal} g</span>
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
