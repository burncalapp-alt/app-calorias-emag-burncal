'use client';

import React from 'react';
import { BookOpen, BarChart2, Plus, Flame, User } from 'lucide-react';

type Tab = 'diary' | 'progress' | 'scan' | 'burn' | 'profile';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onScanClick: () => void;
}

export function BottomNav({ activeTab, setActiveTab, onScanClick }: BottomNavProps) {
  const navItems = [
    { id: 'diary', icon: BookOpen, label: 'Diário' },
    { id: 'progress', icon: BarChart2, label: 'Progresso' },
    { id: 'scan', icon: Plus, label: '', isSpecial: true },
    { id: 'burn', icon: Flame, label: 'Queimar' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-6 bg-[var(--background)] border-t border-[var(--border)]">
      <div className="flex items-center justify-around h-20 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          if (item.id === 'scan') {
            return (
              <button
                key={item.id}
                onClick={onScanClick}
                className="relative -top-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg 
                  transition-all duration-200 ease-out
                  hover:scale-110 hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]
                  active:scale-95 active:shadow-[0_0_10px_rgba(249,115,22,0.3)]
                  pulse-glow"
                style={{ backgroundColor: '#f97316' }}
              >
                <Icon size={28} className="text-white transition-transform duration-200" strokeWidth={2.5} />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl
                transition-all duration-200 ease-out
                hover:bg-gray-800/50 active:scale-95
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
