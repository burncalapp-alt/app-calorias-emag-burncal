'use client';

import React from 'react';
import { Droplets } from 'lucide-react';

interface HistoryEntry {
    id: string;
    type: 'water' | 'meal';
    title: string;
    subtitle?: string;
    time: string;
    imageUrl?: string;
    macros?: { protein: number; carbs: number; fat: number };
}

interface HistoryFeedProps {
    entries: HistoryEntry[];
}

export function HistoryFeed({ entries }: HistoryFeedProps) {
    if (entries.length === 0) {
        return (
            <div className="py-10 flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[var(--card)] flex items-center justify-center mb-4 animate-bounce-soft">
                    <Droplets size={28} className="text-[var(--muted)]" />
                </div>
                <h4 className="text-base font-semibold text-[var(--foreground)] mb-1">Nenhuma entrada ainda</h4>
                <p className="text-sm text-[var(--muted)] max-w-xs leading-relaxed">
                    Comece a acompanhar suas refeições e atividades para ver seu histórico aqui.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-32">
            <h3 className="text-base font-semibold text-[var(--foreground)] animate-fade-in">Histórico</h3>

            {entries.map((entry, index) => (
                <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-xl card-hover animate-fade-in cursor-pointer bg-[var(--card)] shadow-sm"
                    style={{
                        animationDelay: `${index * 100}ms`
                    }}
                >
                    {/* Icon / Image */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0
            transition-transform duration-200 hover:scale-105">
                        {entry.type === 'water' ? (
                            <div className="w-full h-full bg-sky-500/20 flex items-center justify-center">
                                <span className="text-2xl animate-bounce-soft">💧</span>
                            </div>
                        ) : entry.imageUrl ? (
                            <img
                                src={entry.imageUrl}
                                alt={entry.title}
                                className="w-full h-full object-cover rounded-xl transition-transform duration-200 hover:scale-110"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.classList.add('bg-[var(--card-hover)]');
                                    // Insert placeholder
                                    const placeholder = document.createElement('div');
                                    placeholder.className = "w-full h-full flex items-center justify-center";
                                    placeholder.innerHTML = '<span class="text-2xl">🍽️</span>';
                                    e.currentTarget.parentElement?.appendChild(placeholder);
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-[var(--card-hover)] flex items-center justify-center">
                                <span className="text-2xl">🍽️</span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[var(--foreground)] truncate">{entry.title}</h4>
                        {entry.subtitle && (
                            <p className="text-xs text-[var(--muted)] mt-0.5">{entry.subtitle}</p>
                        )}
                        {entry.macros && (
                            <div className="flex gap-3 mt-1.5">
                                <span className="text-xs flex items-center gap-1 transition-transform hover:scale-105">
                                    <span className="text-red-400">🥩</span>
                                    <span className="text-[var(--muted)]">{entry.macros.protein} g</span>
                                </span>
                                <span className="text-xs flex items-center gap-1 transition-transform hover:scale-105">
                                    <span className="text-green-400">🌾</span>
                                    <span className="text-[var(--muted)]">{entry.macros.carbs} g</span>
                                </span>
                                <span className="text-xs flex items-center gap-1 transition-transform hover:scale-105">
                                    <span className="text-orange-400">🥑</span>
                                    <span className="text-[var(--muted)]">{entry.macros.fat} g</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Time */}
                    <span className="text-xs text-[var(--muted)] whitespace-nowrap self-start mt-1">{entry.time}</span>
                </div>
            ))}
        </div>
    );
}
