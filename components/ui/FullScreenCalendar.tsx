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
    const [viewMode, setViewMode] = useState<ViewMode>('month');

    // Inicializando com a data de HOJE real
    const today = new Date();
    const currentSystemYear = today.getFullYear();
    const currentSystemMonth = today.getMonth();
    const currentSystemDay = today.getDate();

    const [currentYear, setCurrentYear] = useState(currentSystemYear);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(currentSystemMonth);

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
        const monthName = Object.values(months)[monthIndex];
        const fullMonthName = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][monthIndex];

        return (
            <div key={`${currentYear}-${monthIndex}`} className="mb-8 p-4 bg-[#1a1d24] rounded-2xl border border-gray-800">
                <h3 className="text-white font-bold text-lg mb-4 capitalize">{fullMonthName} {currentYear}</h3>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-[10px] text-gray-500 font-bold tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-2">
                    {days.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} />;

                        const day = date.getDate();
                        const isToday = currentYear === currentSystemYear && monthIndex === currentSystemMonth && day === currentSystemDay;

                        return (
                            <div key={day} className="relative flex items-center justify-center h-10 w-full">
                                {/* Day Circle */}
                                <button
                                    onClick={() => onRangeSelect(`${day} ${monthName}`)}
                                    className={cn(
                                        "relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all outline-hidden cursor-pointer",
                                        isToday ? "bg-orange-500 text-white font-bold shadow-[0_0_12px_rgba(249,115,22,0.5)] scale-110" : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
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
        <div className="fixed inset-0 bg-[#0d0f14] z-50 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
            {/* Header Area Isolada */}
            <div className="bg-[#0d0f14]/80 backdrop-blur-lg sticky top-0 z-20 px-4 pt-6 pb-2">
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#1a1d24] text-white flex items-center justify-center hover:bg-gray-800 transition-colors border border-gray-800">
                    <ChevronLeft size={20} />
                </button>

                {/* Year Selector */}
                <div className="flex items-center justify-between mt-4 mb-2">
                    <button
                        onClick={() => setCurrentYear(prev => prev - 1)}
                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-full transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-xl font-black text-white">{currentYear}</span>
                    <button
                        onClick={() => setCurrentYear(prev => prev + 1)}
                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-full transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Views Toggle */}
                <div className="flex p-1 bg-[#1a1d24] rounded-xl mb-2 mt-4 border border-gray-800">
                    <button
                        className={cn(
                            "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all",
                            viewMode === 'week' ? "bg-orange-500 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                        )}
                        onClick={() => setViewMode('week')}
                    >
                        Lista de Meses
                    </button>
                    <button
                        className={cn(
                            "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all",
                            viewMode === 'month' ? "bg-orange-500 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                        )}
                        onClick={() => setViewMode('month')}
                    >
                        Mês Detalhado
                    </button>
                </div>
            </div>

            <div className="flex-1 px-4 overflow-y-auto pt-4 pb-24 style-scrollbar">

                {/* VISÃO: LISTA DE MESES EXPANDIDOS (Antiga WeekView) */}
                {viewMode === 'week' && (
                    <div className="space-y-4 pb-10 animate-fade-in">
                        {/* Renderiza todos os meses do ano em lista pra baixo */}
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(index => renderMonthGrid(index))}
                    </div>
                )}

                {/* VISÃO: SELETOR DE MÊS (MÊS DETALHADO) */}
                {viewMode === 'month' && (
                    <div className="animate-fade-in space-y-8">
                        {/* Grid dos Botões de Mês */}
                        <div className="grid grid-cols-3 gap-3">
                            {months.map((m, idx) => {
                                const isSelected = selectedMonth === idx;
                                const isCurrentMonthValue = currentYear === currentSystemYear && idx === currentSystemMonth;

                                return (
                                    <button
                                        key={m}
                                        onClick={() => setSelectedMonth(idx)}
                                        className={cn(
                                            "h-14 rounded-xl text-sm font-bold capitalize transition-all border outline-hidden",
                                            isSelected
                                                ? "bg-[#1a1d24] border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.1)] relative overflow-hidden ring-1 ring-orange-500/20"
                                                : "bg-[#1a1d24] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200"
                                        )}
                                    >
                                        <span className={cn(isCurrentMonthValue && !isSelected && "text-orange-500")}>{m}</span>
                                        {isSelected && (
                                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,1)]"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Se um mês estiver selecionado, exibe a grid dele */}
                        {selectedMonth !== null && renderMonthGrid(selectedMonth)}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .style-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .style-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .style-scrollbar::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
}
