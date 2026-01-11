'use client';

import React from 'react';
import { BookOpen, BarChart2, Plus, Flame, Utensils } from 'lucide-react';

type Tab = 'diary' | 'progress' | 'scan' | 'burn' | 'nutrition' | 'profile';

export function BottomNav({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) {
  const navItems = [
    { id: 'diary', icon: BookOpen, label: 'Diário' },
    { id: 'progress', icon: BarChart2, label: 'Progresso' },
    { id: 'nutrition', icon: Utensils, label: 'Nutrição' },
    { id: 'burn', icon: Flame, label: 'Queimar' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-6 bg-[var(--background)] border-t border-[var(--border)]">
      <div className="flex items-center justify-around h-20 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl
                transition-all duration-200 ease-out
                hover:bg-[var(--card-hover)] active:scale-95
                ${isActive ? '' : ''}`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'hover:scale-110'}`}>
                <Icon
                  size={22}
                  className={`transition-colors duration-200 ${isActive ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-300'}`}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-orange-500' : 'text-gray-500'}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
