'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Timer, ChevronRight, Activity, Check, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { ExerciseDetailModal, Exercise } from './ExerciseDetailModal';
import { useUserContext } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabaseClient';

type WorkoutMode = 'pre-run' | 'post-run';





export function DailyWorkoutSection() {
    const { profile, user } = useUserContext();
    const [mode, setMode] = useState<WorkoutMode>('pre-run');

    // AI Generated exercises
    const [aiPreRunExercises, setAiPreRunExercises] = useState<Exercise[] | null>(null);
    const [aiPostRunExercises, setAiPostRunExercises] = useState<Exercise[] | null>(null);
    const [preRunNutrition, setPreRunNutrition] = useState<string | null>(null);
    const [postRunNutrition, setPostRunNutrition] = useState<string | null>(null);
    const [preRunStats, setPreRunStats] = useState<{ time: string; calories: string } | null>(null);
    const [postRunStats, setPostRunStats] = useState<{ time: string; calories: string } | null>(null);
    const [preRunActions, setPreRunActions] = useState<{ task: string; category: string; icon: string }[]>([]);
    const [postRunActions, setPostRunActions] = useState<{ task: string; category: string; icon: string }[]>([]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isAiGenerated, setIsAiGenerated] = useState(false);

    // Load persisted workout on mount
    useEffect(() => {
        const loadPersistedWorkout = async () => {
            if (!user?.id) return;

            try {
                const { data, error } = await supabase
                    .from('generated_workouts')
                    .select('data')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .limit(1)
                    .maybeSingle();

                if (data?.data) {
                    const { preRun, postRun } = data.data;

                    if (preRun) {
                        setAiPreRunExercises(preRun.exercises);
                        setPreRunNutrition(preRun.nutritionTips);
                        setPreRunStats({
                            time: preRun.totalTime,
                            calories: preRun.calories
                        });
                        setPreRunActions(preRun.actions || []);
                    }

                    if (postRun) {
                        setAiPostRunExercises(postRun.exercises);
                        setPostRunNutrition(postRun.nutritionTips);
                        setPostRunStats({
                            time: postRun.totalTime,
                            calories: postRun.calories
                        });
                        setPostRunActions(postRun.actions || []);
                    }

                    setIsAiGenerated(true);
                }
            } catch (error) {
                console.error('Error loading persisted workout:', error);
            }
        };

        loadPersistedWorkout();
    }, [user?.id]);

    // Track completion separately for each mode
    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
    const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number | null>(null);

    const exercises = mode === 'pre-run'
        ? (aiPreRunExercises || [])
        : (aiPostRunExercises || []);

    const currentStats = mode === 'pre-run' ? preRunStats : postRunStats;
    const totalTime = currentStats?.time || '--';
    const calories = currentStats?.calories || '--';

    const themeColor = mode === 'pre-run' ? 'orange' : 'blue';

    const generateAIWorkout = async () => {
        setIsGenerating(true);
        try {
            // Generate Pre-Run
            const preRunResponse = await fetch('/api/ai/generate-workout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile: {
                        age: profile.age,
                        weight: profile.weight,
                        height: profile.height,
                        gender: profile.gender,
                        activityLevel: profile.activityLevel,
                        goal: profile.goal
                    },
                    workoutType: 'pre-run'
                })
            });
            const preRunData = await preRunResponse.json();
            if (preRunData.exercises) {
                setAiPreRunExercises(preRunData.exercises);
                setPreRunNutrition(preRunData.nutritionTips || "Banana com aveia e mel para energia rápida.");
                setPreRunStats({
                    time: preRunData.totalTime || '6 min',
                    calories: preRunData.calories || '45 kcal'
                });
                setPreRunActions(preRunData.actions || []);
            }

            // Generate Post-Run
            const postRunResponse = await fetch('/api/ai/generate-workout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile: {
                        age: profile.age,
                        weight: profile.weight,
                        height: profile.height,
                        gender: profile.gender,
                        activityLevel: profile.activityLevel,
                        goal: profile.goal
                    },
                    workoutType: 'post-run'
                })
            });
            const postRunData = await postRunResponse.json();
            if (postRunData.exercises) {
                setAiPostRunExercises(postRunData.exercises);
                setPostRunNutrition(postRunData.nutritionTips || "Iogurte com frutas ou whey protein para recuperação.");
                setPostRunStats({
                    time: postRunData.totalTime || '8 min',
                    calories: postRunData.calories || '15 kcal'
                });
                setPostRunActions(postRunData.actions || []);
            }

            // Save to Supabase
            if (preRunData.exercises && postRunData.exercises && user?.id) {
                await supabase.from('generated_workouts').insert({
                    user_id: user.id,
                    data: {
                        preRun: preRunData,
                        postRun: postRunData,
                        timestamp: new Date().toISOString()
                    }
                });
            }

            setIsAiGenerated(true);
            setCompletedItems(new Set()); // Reset completion
        } catch (error) {
            console.error('Error generating workout:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleCompletion = (index: number) => {
        const key = `${mode}-${index}`;
        setCompletedItems(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const isCompleted = (index: number) => completedItems.has(`${mode}-${index}`);


    const completedCount = exercises.filter((_, i) => isCompleted(i)).length;
    const progress = exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0;

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">

            {/* AI Generation Button */}
            <button
                onClick={generateAIWorkout}
                disabled={isGenerating}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 ${isGenerating
                    ? 'bg-purple-500/20 text-purple-300 cursor-wait'
                    : isAiGenerated
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40'
                    }`}
            >
                {isGenerating ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Gerando treino personalizado...
                    </>
                ) : isAiGenerated ? (
                    <>
                        <Sparkles size={20} />
                        Treino IA Ativo
                        <RefreshCw size={16} className="ml-2 opacity-60" />
                    </>
                ) : (
                    <>
                        <Sparkles size={20} />
                        Gerar Treino com IA
                    </>
                )}
            </button>

            {/* Mode Toggle */}
            <div className="flex bg-[var(--card)] border border-[var(--border)] p-1 rounded-2xl shadow-sm">
                <button
                    onClick={() => setMode('pre-run')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${mode === 'pre-run'
                        ? 'bg-orange-500/10 text-orange-500 shadow-sm ring-1 ring-orange-500/20'
                        : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                >
                    <Flame size={16} />
                    Pré-Corrida
                </button>
                <button
                    onClick={() => setMode('post-run')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${mode === 'post-run'
                        ? 'bg-blue-500/10 text-blue-500 shadow-sm ring-1 ring-blue-500/20'
                        : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                >
                    <Activity size={16} />
                    Pós-Corrida
                </button>
            </div>

            {/* Banner with Progress */}
            <div className={`relative h-40 rounded-3xl overflow-hidden ${mode === 'pre-run'
                ? 'bg-gradient-to-r from-orange-600 to-red-700'
                : 'bg-gradient-to-r from-blue-600 to-cyan-700'
                }`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-0 left-0 p-5 w-full">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-2 inline-block">
                                {mode === 'pre-run' ? '🔥 AQUECIMENTO' : '🧘 RECUPERAÇÃO'}
                                {isAiGenerated && <span className="ml-1">✨</span>}
                            </span>
                            <h2 className="text-xl font-bold text-white">
                                {mode === 'pre-run' ? 'Prepare-se para Correr' : 'Alongue e Recupere'}
                            </h2>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <span className="flex items-center gap-1"><Flame size={14} /> {calories}</span>
                </div>
            </div>
            {/* Nutrition Tip Card */}
            {
                (isAiGenerated && (mode === 'pre-run' ? aiPreRunExercises : aiPostRunExercises)) && (
                    <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] flex items-start gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                            <span className="text-xl">🍏</span>
                        </div>
                        <div>
                            <h4 className="text-[var(--foreground)] font-bold text-sm mb-1">Dica de Nutrição</h4>
                            <p className="text-[var(--muted)] text-xs leading-relaxed">
                                {/* We need to store and access the specific tip from the API response. 
                                Since potential re-renders might lose it if not stored, we should update the state structure.
                                For now, I will assume we might need to refactor state to hold 'nutritionTip' string.
                                Let's quickly double check if I updated state handling in the component. 
                                Wait, I haven't updated the component state to store the tip yet! 
                                I should do that first or in this same tool call if possible.
                                Actually, let me use a specialized hook or just update the state logic below in a separate edit or this one.
                                I'll add the UI here but I need the data.
                            */}
                                {mode === 'pre-run' ? preRunNutrition : postRunNutrition}
                            </p>
                        </div>
                    </div>
                )
            }

            {/* Exercises List */}
            <div>
                {/* Protocol Checklist (New) */}
                {(mode === 'pre-run' ? preRunActions : postRunActions).length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-[var(--foreground)] font-bold mb-4 flex items-center gap-2 text-lg">
                            <span className="text-xl">{mode === 'pre-run' ? '⚡' : '🧊'}</span>
                            Protocolo do Atleta
                        </h3>
                        <div className="space-y-3">
                            {(mode === 'pre-run' ? preRunActions : postRunActions).map((action, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                                    <div className="w-8 h-8 rounded-full bg-gray-800/10 flex items-center justify-center text-lg shrink-0">
                                        {action.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-[var(--foreground)] font-medium text-sm">{action.task}</h4>
                                        <p className="text-[var(--muted)] text-xs mt-0.5">{action.category}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <h3 className="text-[var(--foreground)] font-bold mb-4 flex justify-between items-center text-lg">
                    <span>Lista de Exercícios</span>
                    <span className="text-sm font-normal text-[var(--muted)]">{completedCount}/{exercises.length} Concluídos</span>
                </h3>

                {exercises.length === 0 && !isGenerating && (
                    <div className="text-center py-10 bg-[var(--card)] rounded-2xl border border-dashed border-[var(--border)]">
                        <div className="w-16 h-16 rounded-full bg-[var(--background)] flex items-center justify-center mx-auto mb-4 border border-[var(--border)]">
                            <Sparkles size={24} className="text-[var(--muted)]" />
                        </div>
                        <h4 className="text-[var(--foreground)] font-medium mb-2">Sua rotina personalizada</h4>
                        <p className="text-[var(--muted)] text-sm max-w-[250px] mx-auto">
                            Toque em "Gerar Treino com IA" para criar uma sequência ideal para sua maratona.
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    {exercises.map((ex, i) => {
                        const done = isCompleted(i);
                        return (
                            <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${done
                                ? 'bg-[var(--card)] border-[var(--border)] opacity-60 grayscale'
                                : 'bg-[var(--card)] border-[var(--border)] hover:bg-[var(--card-hover)]'
                                }`}>
                                {/* Checkbox Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCompletion(i);
                                    }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${done
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 scale-110'
                                        : 'bg-[var(--background)] text-[var(--muted)] border border-[var(--border)] hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {done ? <Check size={16} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-gray-400/50" />}
                                </button>

                                {/* Content Area - Opens Modal */}
                                <div
                                    className="flex-1 cursor-pointer flex items-center gap-4"
                                    onClick={() => setSelectedExerciseIndex(i)}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[var(--background)] flex items-center justify-center text-2xl border border-[var(--border)]">
                                        {ex.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-bold transition-colors ${done ? 'text-[var(--muted)] line-through' : 'text-[var(--foreground)]'}`}>
                                            {ex.name}
                                        </h4>
                                        <p className="text-xs text-[var(--muted)]">{ex.description}</p>
                                        <p className={`text-xs font-semibold mt-0.5 ${done ? 'text-[var(--muted)]' : `text-${themeColor}-500`}`}>
                                            {ex.durationLabel}
                                        </p>
                                    </div>
                                    <ChevronRight size={20} className="text-[var(--muted)]" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            {
                selectedExerciseIndex !== null && (
                    <ExerciseDetailModal
                        exercise={exercises[selectedExerciseIndex]}
                        isOpen={true}
                        onClose={() => setSelectedExerciseIndex(null)}
                        isCompleted={isCompleted(selectedExerciseIndex)}
                        onToggleStatus={() => {
                            toggleCompletion(selectedExerciseIndex);
                        }}
                        mode={mode}
                    />
                )
            }
        </div >
    );
}
