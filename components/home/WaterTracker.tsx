'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface WaterTrackerProps {
    current: number;
    goal: number;
    onAdd: (amount: number) => void;
}

export function WaterTracker({ current, goal, onAdd }: WaterTrackerProps) {
    return (
        <div
            className="water-card relative overflow-hidden rounded-2xl p-5 my-4 card-hover"
        >
            {/* Animated water waves using CSS */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="water-wave water-wave-1" />
                <div className="water-wave water-wave-2" />
                <div className="water-wave water-wave-3" />

                {/* Bubbles */}
                <div className="water-bubble bubble-1" />
                <div className="water-bubble bubble-2" />
                <div className="water-bubble bubble-3" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <p className="text-4xl font-bold text-white drop-shadow-lg">
                        {current} <span className="text-lg font-normal opacity-90">ml</span>
                    </p>
                    <p className="text-sm text-white/80">de <span suppressHydrationWarning>{goal.toLocaleString('pt-BR')}</span> ml</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={() => onAdd(100)}
                        className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center 
              transition-all duration-200 ease-out
              hover:bg-white/40 hover:scale-110 hover:shadow-lg
              active:scale-95 active:bg-white/50
              border border-white/30"
                    >
                        <Plus size={24} className="text-white drop-shadow" />
                    </button>
                    <span className="text-xs text-white/80 font-medium">+100 ml</span>
                </div>
            </div>
        </div>
    );
}
