'use client';

import React, { useState } from 'react';
import { FastingSection } from './FastingSection';
import { DailyWorkoutSection } from './DailyWorkoutSection';
import { AIAnalysisSection } from './AIAnalysisSection';
import { Flame, Footprints, Sparkles } from 'lucide-react';

type BurnTabOption = 'fasting' | 'workout' | 'analysis';

export function BurnTab() {
    const [activeSubTab, setActiveSubTab] = useState<BurnTabOption>('fasting');

    return (
        <div className="flex flex-col h-full bg-[var(--background)] animate-in fade-in duration-300">
            {/* Header */}
            <div className="pt-12 pb-6 px-6 text-center">
                <h1 className="text-xl font-bold text-[var(--foreground)] flex items-center justify-center gap-2">
                    <Flame className="text-orange-500 fill-orange-500" size={24} />
                    Queimar
                </h1>
            </div>

            {/* Internal Navigation */}
            <div className="px-4 mb-6">
                <div className="flex bg-[var(--card)] p-1 rounded-2xl shadow-sm">
                    <TabButton
                        active={activeSubTab === 'fasting'}
                        onClick={() => setActiveSubTab('fasting')}
                        label="Jejum"
                        icon={Flame}
                        activeColor="text-orange-500"
                    />
                    <TabButton
                        active={activeSubTab === 'workout'}
                        onClick={() => setActiveSubTab('workout')}
                        label="Treino"
                        icon={Footprints}
                        activeColor="text-orange-500"
                    />
                    <TabButton
                        active={activeSubTab === 'analysis'}
                        onClick={() => setActiveSubTab('analysis')}
                        label="Análise IA"
                        icon={Sparkles}
                        activeColor="text-purple-500"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-6">
                {activeSubTab === 'fasting' && <FastingSection />}
                {activeSubTab === 'workout' && <DailyWorkoutSection />}
                {activeSubTab === 'analysis' && <AIAnalysisSection />}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, icon: Icon, activeColor }: { active: boolean, onClick: () => void, label: string, icon: any, activeColor: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${active
                ? `bg-[var(--card-hover)] text-[var(--foreground)] shadow-sm`
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
        >
            <Icon size={16} className={active ? activeColor : ''} />
            {label}
        </button>
    );
}
