'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'week' | 'month';

interface FullScreenCalendarProps {
    isOpen: boolean;
    onClose: () => void;
    onRangeSelect: (range: string) => void;
}

export function FullScreenCalendar({ isOpen, onClose, onRangeSelect }: FullScreenCalendarProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentYear, setCurrentYear] = useState(2025);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(11); // December (0-indexed)

    if (!isOpen) return null;

    const months = [
        'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.',
        'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'
    ];

    const weekDays = ['SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.', 'DOM.'];

    // Helper to generate days for a specific month
    const getDaysInMonth = (month: number, year: number) => {
        const date = new Date(year, month, 1);
        const days = [];

        // Get first day of month (0 = Sunday, 1 = Monday, etc.)
        // Adjust for Monday start (Monday = 0, Sunday = 6)
        let firstDay = date.getDay() - 1;
        if (firstDay < 0) firstDay = 6; // Sunday is now 6

        // Add empty slots for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add actual days
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    const renderMonthGrid = (monthIndex: number) => {
        const days = getDaysInMonth(monthIndex, currentYear);
        const monthName = Object.values(months)[monthIndex]; // Simplify getting name
        // Actually months array is strings, so just index it
        const fullMonthName = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][monthIndex];

        return (
            <div key={monthIndex} className="mb-8">
                <h3 className="text-white font-bold text-lg mb-4 capitalize">{fullMonthName} {currentYear}</h3>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-[10px] text-gray-500 font-medium">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-2">
                    {days.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} />;

                        const day = date.getDate();
                        // Simulate selection for the specific week (Dec 8-14)
                        const isSelected = monthIndex === 11 && day >= 8 && day <= 14;
                        const isStart = monthIndex === 11 && day === 8;
                        const isEnd = monthIndex === 11 && day === 14;

                        return (
                            <div key={day} className="relative flex items-center justify-center h-10">
                                {/* Selection Background Strip */}
                                {isSelected && (
                                    <div className={cn(
                                        "absolute inset-y-0 bg-orange-500/20 w-full",
                                        isStart && "rounded-l-full left-1",
                                        isEnd && "rounded-r-full right-1"
                                    )} />
                                )}

                                {/* Day Circle */}
                                <button
                                    onClick={() => onRangeSelect(`${day} ${monthName}`)} // Simplified
                                    className={cn(
                                        "relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all",
                                        isSelected ? "text-orange-500 font-bold" : "text-gray-300 hover:bg-gray-800",
                                        (isStart || isEnd) && "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                    )}
                                >
                                    {day}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-[#0d0f14] z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="px-4 py-4 flex items-center gap-4">
                <button onClick={onClose} className="p-2 rounded-full bg-[#1a1d24] text-white hover:bg-gray-800 transition-colors">
                    <ChevronLeft size={24} />
                </button>
            </div>

            <div className="flex-1 px-4 overflow-y-auto">
                {/* Toggle */}
                <div className="flex p-1 bg-[#1a1d24] rounded-xl mb-6">
                    <button
                        className={cn(
                            "flex-1 py-3 rounded-lg text-sm font-medium transition-all",
                            viewMode === 'week' ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                        onClick={() => setViewMode('week')}
                    >
                        Semana
                    </button>
                    <button
                        className={cn(
                            "flex-1 py-3 rounded-lg text-sm font-medium transition-all",
                            viewMode === 'month' ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                        onClick={() => setViewMode('month')}
                    >
                        Mês
                    </button>
                </div>

                {/* Year Selector */}
                <div className="flex items-center justify-between px-4 mb-8">
                    <button
                        onClick={() => setCurrentYear(prev => prev - 1)}
                        className="p-1 text-orange-500 hover:bg-orange-500/10 rounded-full"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <span className="text-xl font-bold text-white">{currentYear}</span>
                    <button
                        onClick={() => setCurrentYear(prev => prev + 1)}
                        className="p-1 text-gray-600 cursor-not-allowed" // Disabled look from image
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* WEEK VIEW (Scrollable Months) */}
                {viewMode === 'week' && (
                    <div className="space-y-4 pb-10 animate-fade-in">
                        {/* Showing Nov and Dec as in reference */}
                        {renderMonthGrid(10)} {/* November */}
                        {renderMonthGrid(11)} {/* December */}
                    </div>
                )}

                {/* MONTH VIEW (Grid) */}
                {viewMode === 'month' && (
                    <div className="grid grid-cols-3 gap-3 pb-10 animate-fade-in">
                        {months.map((m, idx) => {
                            const isSelected = selectedMonth === idx;
                            const isCurrent = idx === 11; // Simulating Dec is current/selected

                            return (
                                <button
                                    key={m}
                                    onClick={() => setSelectedMonth(idx)}
                                    className={cn(
                                        "h-14 rounded-xl text-sm font-medium capitalize transition-all border",
                                        isSelected
                                            ? "bg-[#1a1d24] border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.1)] relative overflow-hidden"
                                            : "bg-[#1a1d24] border-transparent text-gray-300 hover:border-gray-700"
                                    )}
                                >
                                    {m}
                                    {isSelected && (
                                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
