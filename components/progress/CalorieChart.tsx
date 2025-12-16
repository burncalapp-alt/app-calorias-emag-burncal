'use client';

import React, { useEffect, useState } from 'react';

interface CalorieChartProps {
    data: { day: number; value: number }[];
    goal: number;
}

export function CalorieChart({ data, goal }: CalorieChartProps) {
    const [animate, setAnimate] = useState(false);
    const maxValue = Math.max(goal * 1.2, ...data.map(d => d.value));

    useEffect(() => {
        // Trigger animation after mount
        setTimeout(() => setAnimate(true), 300);
    }, []);

    return (
        <div
            className="card-hover rounded-2xl p-6 mb-24 animate-fade-in bg-[var(--card)] shadow-sm"
            style={{
                animationDelay: '300ms'
            }}
        >
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Calorias da Semana</h3>
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                    <span className="text-[var(--muted)]">Consumido</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400/20 border border-orange-400 ml-2" />
                    <span className="text-[var(--muted)]">Meta</span>
                </div>
            </div>

            <div className="relative h-48 w-full">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between text-xs text-[var(--muted)]">
                    {[1, 0.75, 0.5, 0.25, 0].map((ratio, i) => (
                        <div key={i} className="flex items-center w-full">
                            <span className="w-8 text-right pr-2">{Math.round(maxValue * ratio)}</span>
                            <div className="flex-1 h-px bg-[var(--border)] border-t border-dashed border-[var(--border)]" />
                        </div>
                    ))}
                </div>

                {/* Goal Line - Animated */}
                <div
                    className="absolute left-8 right-0 border-t border-orange-400/50 z-0 transition-all duration-[1500ms] ease-out"
                    style={{
                        top: `${100 - (goal / maxValue) * 100}%`,
                        borderTopStyle: 'dashed',
                        width: animate ? 'auto' : '0%',
                        right: animate ? '0' : '100%',
                        opacity: animate ? 1 : 0
                    }}
                />

                {/* Bars Container */}
                <div className="absolute inset-0 left-8 flex items-end justify-between pl-2 pr-2">
                    {data.map((item, idx) => {
                        const height = (item.value / maxValue) * 100;
                        const isOverGoal = item.value > goal;

                        return (
                            <div key={idx} className="flex flex-col items-center flex-1 group" style={{ perspective: '1000px' }}>
                                <div className="relative w-full max-w-[14px] h-full flex items-end">
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--card-hover)] border border-[var(--border)] text-[var(--foreground)] text-[10px] py-1.5 px-2.5 rounded shadow-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 whitespace-nowrap z-20 pointer-events-none transform origin-bottom">
                                        <span className="font-bold">{item.value}</span> <span className="text-[var(--muted)]">kcal</span>
                                        {/* Arrow */}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[var(--card-hover)] border-r border-b border-[var(--border)]"></div>
                                    </div>

                                    {/* Bar with Grow Animation */}
                                    <div
                                        className={`w-full rounded-t-sm transition-all duration-300 ease-out hover:brightness-110 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] relative overflow-hidden`}
                                        style={{
                                            height: animate ? `${height}%` : '0%',
                                            backgroundColor: isOverGoal ? '#ef4444' : '#22c55e',
                                            transition: `height 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 100}ms, background-color 0.2s, box-shadow 0.2s`
                                        }}
                                    >
                                        {/* Inner shine effect */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10 opacity-50" />
                                    </div>
                                </div>
                                {/* X-axis Label */}
                                <span className="text-[10px] text-[var(--muted)] mt-3 transition-colors group-hover:text-[var(--foreground)]">{item.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
