'use client';

import React from 'react';
import { X, CheckCircle, Clock, Repeat } from 'lucide-react';

export interface Exercise {
    name: string;
    durationLabel: string;
    durationSeconds?: number;
    type: 'time' | 'reps';
    description: string;
    icon: string;
    instructions?: string[];
}

interface ExerciseDetailModalProps {
    exercise: Exercise;
    isOpen: boolean;
    onClose: () => void;
    onToggleStatus: () => void;
    isCompleted: boolean;
    mode: 'pre-run' | 'post-run';
}

export function ExerciseDetailModal({ exercise, isOpen, onClose, onToggleStatus, isCompleted, mode }: ExerciseDetailModalProps) {
    if (!isOpen) return null;

    const themeColor = mode === 'pre-run' ? 'orange' : 'blue';
    const bgGradient = mode === 'pre-run'
        ? 'from-orange-600 to-red-600'
        : 'from-blue-600 to-cyan-600';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#1e293b] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                {/* Header Image/Icon Area */}
                <div className={`h-48 bg-gradient-to-br ${bgGradient} flex items-center justify-center relative flex-shrink-0`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="text-7xl shadow-xl rounded-full bg-white/10 p-4 backdrop-blur-sm">
                        {exercise.icon}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-white">{exercise.name}</h2>
                        <p className="text-gray-400">{exercise.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-4">
                        <div className="bg-[#0f172a] px-4 py-2 rounded-xl flex items-center gap-2 text-gray-300 border border-gray-800">
                            {exercise.type === 'time' ? <Clock size={16} /> : <Repeat size={16} />}
                            <span className="font-semibold">{exercise.durationLabel}</span>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-[#0f172a] p-4 rounded-xl border border-gray-800 space-y-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="text-purple-400">⚡</span> Como fazer:
                        </h3>
                        {exercise.instructions && exercise.instructions.length > 0 ? (
                            <ul className="space-y-3">
                                {exercise.instructions.map((step, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center text-xs font-bold border border-gray-700">
                                            {idx + 1}
                                        </span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Siga as instruções do seu treinador ou execute o movimento com foco e controle.
                            </p>
                        )}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => {
                            onToggleStatus();
                            onClose();
                        }}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isCompleted
                            ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20'
                            : `bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white shadow-lg shadow-${themeColor}-500/20`
                            }`}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle size={20} />
                                Concluído
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                Marcar como Feito
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
