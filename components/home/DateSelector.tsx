'use client';

import React from 'react';

interface DateSelectorProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = -3; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push(date);
    }

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();

    const isToday = (date: Date) => isSameDay(date, today);

    return (
        <div className="flex justify-between items-center py-3 px-2 animate-fade-in">
            {days.map((date, idx) => {
                const isSelected = isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);

                return (
                    <button
                        key={idx}
                        onClick={() => onDateChange(date)}
                        className="flex flex-col items-center gap-1 transition-all duration-200 ease-out
              hover:scale-110 active:scale-95"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        <span className={`text-xs font-medium transition-colors duration-200 ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`}>
                            {dayNames[date.getDay()]}
                        </span>
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold 
                transition-all duration-200 ease-out
                ${isSelected
                                    ? 'bg-[var(--primary)] text-white shadow-lg shadow-orange-500/20 scale-110'
                                    : isTodayDate
                                        ? 'border-2 border-[var(--muted)] text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]'
                                        : 'text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]'
                                }`}
                        >
                            {date.getDate()}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
