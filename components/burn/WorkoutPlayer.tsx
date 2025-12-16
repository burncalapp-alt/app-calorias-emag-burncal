'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, ChevronRight, ChevronLeft, CheckCircle, Timer, RotateCcw } from 'lucide-react';

export interface Exercise {
    name: string;
    durationLabel: string;
    durationSeconds?: number;
    type: 'time' | 'reps';
    description: string;
    icon: string;
}

interface WorkoutPlayerProps {
    exercises: Exercise[];
    onClose: () => void;
    onComplete: () => void;
    mode: 'pre-run' | 'post-run';
}

export function WorkoutPlayer({ exercises, onClose, onComplete, mode }: WorkoutPlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(exercises[0].durationSeconds || 0);
    const [isFinished, setIsFinished] = useState(false);

    const currentExercise = exercises[currentIndex];
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Reset timer when exercise changes
    useEffect(() => {
        setIsPlaying(false);
        if (currentExercise.type === 'time' && currentExercise.durationSeconds) {
            setTimeLeft(currentExercise.durationSeconds);
        }
    }, [currentIndex, currentExercise]);

    // Timer Logic
    useEffect(() => {
        if (isPlaying && timeLeft > 0 && currentExercise.type === 'time') {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Timer finished
                        handleNext();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, timeLeft, currentExercise.type]);

    const handleNext = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            finishWorkout();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const finishWorkout = () => {
        setIsFinished(true);
        setIsPlaying(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const themeColor = mode === 'pre-run' ? 'orange' : 'blue';
    const bgGradient = mode === 'pre-run'
        ? 'from-orange-600 to-red-600'
        : 'from-blue-600 to-cyan-600';

    if (isFinished) {
        return (
            <div className="fixed inset-0 z-50 bg-[#0d0f14] flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className={`p-6 rounded-full bg-${themeColor}-500/20 mb-6 animate-bounce`}>
                    <CheckCircle size={64} className={`text-${themeColor}-500`} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Treino Concluído!</h2>
                <p className="text-gray-400 mb-8 text-center max-w-xs">
                    {mode === 'pre-run' ? 'Você está pronto para correr! 🔥' : 'Ótima recuperação! 🧘'}
                </p>
                <button
                    onClick={onComplete}
                    className={`px-8 py-4 rounded-xl bg-${themeColor}-500 text-white font-bold text-lg hover:bg-${themeColor}-600 transition-all active:scale-95 shadow-lg shadow-${themeColor}-500/30`}
                >
                    Finalizar
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0f14] animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-6 flex justify-between items-center">
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
                >
                    <X size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {mode === 'pre-run' ? 'Aquecimento' : 'Recuperação'}
                    </span>
                    <span className="text-white font-medium">
                        {currentIndex + 1} / {exercises.length}
                    </span>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-8">

                {/* Icon/Visual */}
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-2xl shadow-${themeColor}-500/20 bg-gradient-to-br ${bgGradient}`}>
                    {currentExercise.icon}
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">{currentExercise.name}</h2>
                    <p className="text-gray-400 text-lg">{currentExercise.description}</p>
                </div>

                {/* Timer / Counter */}
                <div className="flex flex-col items-center justify-center py-6">
                    {currentExercise.type === 'time' ? (
                        <div className="text-7xl font-mono font-bold text-white tracking-tighter">
                            {formatTime(timeLeft)}
                        </div>
                    ) : (
                        <div className="text-5xl font-bold text-white">
                            {currentExercise.durationLabel}
                        </div>
                    )}

                    {currentExercise.type === 'time' && (
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => {
                                    if (timeLeft === 0) {
                                        setTimeLeft(currentExercise.durationSeconds || 0);
                                        setIsPlaying(true);
                                    } else {
                                        setIsPlaying(!isPlaying);
                                    }
                                }}
                                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 ${isPlaying
                                        ? 'bg-gray-800 text-white'
                                        : `bg-${themeColor}-500 text-white shadow-lg shadow-${themeColor}-500/30 hover:scale-105`
                                    }`}
                            >
                                {isPlaying ? <Pause size={32} /> : (timeLeft === 0 ? <RotateCcw size={32} /> : <Play size={32} className="ml-1" />)}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="p-6 pb-12 flex items-center justify-between gap-4">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className={`p-4 rounded-xl border border-gray-800 transition-colors ${currentIndex === 0 ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                >
                    <ChevronLeft size={24} />
                </button>

                <button
                    onClick={handleNext}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${currentExercise.type === 'reps' || timeLeft === 0
                            ? `bg-${themeColor}-500 text-white shadow-lg shadow-${themeColor}-500/20`
                            : 'bg-[#1e293b] text-gray-400 hover:bg-[#253248]'
                        }`}
                >
                    {currentIndex === exercises.length - 1 ? 'Concluir' : 'Próximo'}
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
