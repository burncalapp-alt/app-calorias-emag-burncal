'use client';

import React, { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, TrendingUp, Clock, MapPin, Zap, ChevronRight, X, Image as ImageIcon } from 'lucide-react';

interface AnalysisResult {
    pace: string;
    distance: string;
    time: string;
    calories: string;
    suggestions: string[];
    exercises: { name: string; reason: string; icon: string }[];
}

export function RunAnalysisSection() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                setAnalysis(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeRun = () => {
        setIsAnalyzing(true);

        // Simulated AI analysis (in production, this would call an AI API)
        setTimeout(() => {
            setAnalysis({
                pace: "5:42 min/km",
                distance: "5.2 km",
                time: "29:38",
                calories: "320 kcal",
                suggestions: [
                    "Seu pace caiu nos últimos 2km. Considere treinos intervalados para melhorar resistência.",
                    "Para quebrar a barreira dos 5:30/km, inclua corridas em subida 1x por semana.",
                    "Seu ritmo inicial foi muito forte. Tente começar 10% mais devagar para manter energia."
                ],
                exercises: [
                    { name: "Corrida Intervalada", reason: "Melhora o pace em até 15%", icon: "⚡" },
                    { name: "Fortalecimento de Core", reason: "Mantém postura nos km finais", icon: "💪" },
                    { name: "Treino de Subida", reason: "Aumenta potência das pernas", icon: "⛰️" },
                    { name: "Alongamento de Flexores", reason: "Melhora amplitude da passada", icon: "🧘" },
                ]
            });
            setIsAnalyzing(false);
        }, 2500);
    };

    const clearImage = () => {
        setUploadedImage(null);
        setAnalysis(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium mb-3">
                    <Sparkles size={16} />
                    Análise com Inteligência Artificial
                </div>
                <h2 className="text-xl font-bold text-white">Otimize sua Corrida</h2>
                <p className="text-sm text-gray-400 mt-1">
                    Envie um print do Strava ou Nike Run e receba dicas personalizadas
                </p>
            </div>

            {/* Upload Area */}
            {!uploadedImage ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-700 rounded-3xl p-8 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
                >
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                        <Upload size={28} className="text-purple-400" />
                    </div>
                    <h3 className="text-white font-bold mb-2">Envie seu Print</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Screenshot do Strava, Nike Run ou qualquer app de corrida
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="px-3 py-1.5 rounded-full bg-gray-800 text-xs text-gray-400 flex items-center gap-1">
                            <ImageIcon size={12} /> PNG, JPG
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-gray-800 text-xs text-gray-400 flex items-center gap-1">
                            <Camera size={12} /> Screenshot
                        </span>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="relative">
                    <img
                        src={uploadedImage}
                        alt="Run screenshot"
                        className="w-full rounded-3xl border border-gray-700"
                    />
                    <button
                        onClick={clearImage}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Analyze Button */}
            {uploadedImage && !analysis && (
                <button
                    onClick={analyzeRun}
                    disabled={isAnalyzing}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg transition-all active:scale-95 shadow-lg shadow-purple-500/20 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {isAnalyzing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analisando com IA...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            Analisar Corrida
                        </>
                    )}
                </button>
            )}

            {/* Analysis Results */}
            {analysis && (
                <div className="space-y-5 animate-in fade-in duration-500">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-[#1e293b] border border-gray-800">
                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                <TrendingUp size={14} /> Pace Médio
                            </div>
                            <p className="text-xl font-bold text-white">{analysis.pace}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#1e293b] border border-gray-800">
                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                <MapPin size={14} /> Distância
                            </div>
                            <p className="text-xl font-bold text-white">{analysis.distance}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#1e293b] border border-gray-800">
                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                <Clock size={14} /> Tempo
                            </div>
                            <p className="text-xl font-bold text-white">{analysis.time}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#1e293b] border border-gray-800">
                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                <Zap size={14} /> Calorias
                            </div>
                            <p className="text-xl font-bold text-white">{analysis.calories}</p>
                        </div>
                    </div>

                    {/* AI Suggestions */}
                    <div>
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-400" />
                            Sugestões da IA
                        </h3>
                        <div className="space-y-2">
                            {analysis.suggestions.map((suggestion, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                                    <p className="text-sm text-gray-300">{suggestion}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommended Exercises */}
                    <div>
                        <h3 className="text-white font-bold mb-3">Treinos Recomendados</h3>
                        <div className="space-y-3">
                            {analysis.exercises.map((ex, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#1e293b] border border-gray-800 hover:bg-[#253248] transition-colors cursor-pointer">
                                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl">
                                        {ex.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-bold">{ex.name}</h4>
                                        <p className="text-sm text-gray-400">{ex.reason}</p>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-600" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* New Analysis Button */}
                    <button
                        onClick={clearImage}
                        className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 font-medium hover:bg-gray-800 transition-colors"
                    >
                        Nova Análise
                    </button>
                </div>
            )}
        </div>
    );
}
