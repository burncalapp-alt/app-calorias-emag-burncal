'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Activity, CheckCircle2, Flame, Upload, X, ArrowLeft, Image as ImageIcon, History, Calendar } from 'lucide-react';
import { useUserContext } from '@/contexts/UserContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface WorkoutAnalysisData {
    stats: {
        distance: string;
        duration: string;
        pace: string;
        calories: string;
    };
    summary: string;
    feedback: string[];
    preRunAdvice: {
        fuel: string;
        mobility: string;
    };
    score: number;
}

export function AIAnalysisSection() {
    const { profile, user } = useUserContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [workoutAnalysis, setWorkoutAnalysis] = useState<WorkoutAnalysisData | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Load History
    useEffect(() => {
        if (user?.id) {
            supabase.from('workout_analyses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .then(({ data }) => {
                    if (data) setHistory(data);
                });
        }
    }, [user?.id]);

    // --- Image Handling Helpers ---
    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max dimension 1024px
                const maxDim = 1024;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = (height * maxDim) / width;
                        width = maxDim;
                    } else {
                        width = (width * maxDim) / height;
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Compress to JPEG 0.7
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(dataUrl); // Keep full data URL for display
            };
        });
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Resize and preview
                const resizedDataUrl = await resizeImage(file);
                setPreviewUrl(resizedDataUrl);

                // Start analysis automatically
                analyzeWorkoutImage(resizedDataUrl);
            } catch (err) {
                setError('Erro ao processar imagem. Tente novamente.');
            }
        }
    };

    const analyzeWorkoutImage = async (base64Image: string) => {
        setIsAnalyzing(true);
        setError(null);
        try {
            const response = await fetch('/api/ai/analyze-workout-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: base64Image, // Pass full data URL
                    profile: { ...profile }
                })
            });
            const data = await response.json();
            if (data.error) setError(data.error);
            else {
                setWorkoutAnalysis(data);
                // Save to DB
                if (user?.id) {
                    await supabase.from('workout_analyses').insert({
                        user_id: user.id,
                        stats: data.stats,
                        summary: data.summary,
                        feedback: data.feedback,
                        pre_run_advice: data.preRunAdvice,
                        score: data.score
                    });
                    // Refresh history
                    const { data: historyData } = await supabase
                        .from('workout_analyses')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });
                    if (historyData) setHistory(historyData);
                }
            }
        } catch (err) {
            setError('Falha ao analisar o print do treino.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetAnalysis = () => {
        setWorkoutAnalysis(null);
        setPreviewUrl(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- Loading State ---
    if (isAnalyzing) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping blur-xl"></div>
                    <div className="relative w-24 h-24 rounded-full bg-[#1e293b] border border-purple-500/30 flex items-center justify-center shadow-2xl shadow-purple-900/20">
                        <Loader2 size={40} className="text-purple-400 animate-spin" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">Analisando seu progresso...</h3>
                    <p className="text-gray-400">Extraindo dados e gerando dicas</p>
                </div>
            </div>
        );
    }

    // --- Result View ---
    if (workoutAnalysis) {
        return (
            <div className="animate-in slide-in-from-bottom duration-500 pb-20">
                {/* Header with Back */}
                <button
                    onClick={resetAnalysis}
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Nova Análise</span>
                </button>

                <div className="space-y-6">
                    {/* Header Card */}
                    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Activity size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={18} className="text-purple-400" />
                                <span className="text-purple-400 font-medium text-sm">Análise Concluída</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-6">Resumo do Treino</h2>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">Distância</p>
                                    <p className="text-xl font-bold text-white">{workoutAnalysis.stats.distance}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">Ritmo Médio</p>
                                    <p className="text-xl font-bold text-white">{workoutAnalysis.stats.pace}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">Tempo</p>
                                    <p className="text-xl font-bold text-white">{workoutAnalysis.stats.duration}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">Calorias</p>
                                    <p className="text-xl font-bold text-white">{workoutAnalysis.stats.calories}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pre-Run Advice (Highlighted) */}
                    <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/10 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <h3 className="text-blue-200 font-bold mb-6 flex items-center gap-2 text-lg">
                            <Sparkles size={20} className="text-blue-400" />
                            Para o Próximo Treino
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-[#0f172a]/50 rounded-2xl p-4 border border-blue-500/10">
                                <h4 className="flex items-center gap-2 text-white font-semibold mb-2">
                                    <Flame size={18} className="text-orange-400" />
                                    Combustível Recomendado
                                </h4>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {workoutAnalysis.preRunAdvice?.fuel}
                                </p>
                            </div>

                            <div className="bg-[#0f172a]/50 rounded-2xl p-4 border border-blue-500/10">
                                <h4 className="flex items-center gap-2 text-white font-semibold mb-2">
                                    <Activity size={18} className="text-green-400" />
                                    Mobilidade & Ativação
                                </h4>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {workoutAnalysis.preRunAdvice?.mobility}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* General Feedback */}
                    <div className="space-y-3">
                        <h3 className="text-white font-bold ml-1 text-lg">Insights do Treinador</h3>
                        {workoutAnalysis.feedback.map((item, i) => (
                            <div key={i} className="flex gap-4 bg-[#1e293b] p-5 rounded-2xl border border-gray-800 shadow-sm">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 size={14} className="text-green-400" />
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- Empty / Upload State ---
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 pb-20">
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-8 mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#581c87]/20 border border-[#581c87]/30 text-purple-300 text-sm font-semibold shadow-lg shadow-purple-900/10">
                    <Sparkles size={16} className="text-purple-400" />
                    Análise com Inteligência Artificial
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Otimize sua Corrida</h2>
                    <p className="text-gray-400 text-sm mx-auto max-w-[280px]">
                        Envie um print do Strava ou Nike Run e receba dicas personalizadas
                    </p>
                </div>
            </div>

            {/* Upload Area */}
            <div
                className="mx-2 mb-8 min-h-[280px] border-2 border-dashed border-gray-700/50 rounded-[2.5rem] bg-[#13161c] transition-all hover:border-purple-500/30 hover:bg-[#161b24] group cursor-pointer flex flex-col items-center justify-center p-6 text-center space-y-6"
                onClick={() => fileInputRef.current?.click()}
            >
                {/* Icon Circle */}
                <div className="w-24 h-24 rounded-full bg-[#1e2330] shadow-[0_0_40px_-10px_rgba(168,85,247,0.15)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-gray-800 group-hover:border-purple-500/30">
                    <Upload size={32} className="text-purple-400" strokeWidth={2.5} />
                </div>

                <div className="space-y-3">
                    <h3 className="text-white font-bold text-xl tracking-wide">Envie seu Print</h3>
                    <p className="text-gray-500 text-sm max-w-[240px] mx-auto leading-relaxed">
                        Screenshot do Strava, Nike Run ou qualquer app de corrida
                    </p>
                </div>

                <div className="flex gap-3 pt-2">
                    <span className="px-4 py-2 rounded-xl bg-[#1e2330] text-[10px] uppercase font-bold text-gray-400 border border-gray-800 tracking-wider">
                        PNG, JPG
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-[#1e2330] text-[10px] uppercase font-bold text-gray-400 border border-gray-800 flex items-center gap-1.5 tracking-wider">
                        <ImageIcon size={12} />
                        Screenshot
                    </span>
                </div>

                {/* Hidden Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-4 mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 animate-in slide-in-from-bottom">
                    <X size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* History Section */}
            {history.length > 0 && (
                <div className="mx-2 space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <History size={18} className="text-gray-400" />
                        <h3 className="text-gray-300 font-semibold">Histórico de Análises</h3>
                    </div>

                    <div className="space-y-3">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setWorkoutAnalysis({
                                    stats: item.stats,
                                    summary: item.summary,
                                    feedback: item.feedback,
                                    preRunAdvice: item.pre_run_advice,
                                    score: item.score
                                })}
                                className="bg-[#1e293b] p-4 rounded-2xl border border-gray-800 flex items-center justify-between cursor-pointer hover:bg-[#253248] transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-xs">
                                        {item.score || '?'}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{item.stats.distance || 'Treino'}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar size={12} />
                                            {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold text-sm">{item.stats.date}</p>
                                    <ChevronRight size={16} className="text-gray-600 ml-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ChevronRight({ size, className }: { size?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
    )
}
