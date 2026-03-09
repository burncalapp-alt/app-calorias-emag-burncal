'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Target, TrendingDown, Flag, Sparkles } from 'lucide-react';

interface WeightGoalChartProps {
    currentWeight: number;
    startWeight: number;
    goalWeight: number;
}

export function WeightGoalChart({ currentWeight, startWeight, goalWeight }: WeightGoalChartProps) {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const totalToLose = startWeight - goalWeight;
    const lostSoFar = startWeight - currentWeight;

    // O progresso vai de 0% (início) a 100% (meta)
    const targetProgress = Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
    const remaining = currentWeight - goalWeight;

    // A meta já foi batida?
    const isGoalReached = remaining <= 0;

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedProgress(targetProgress);
        }, 300);
        return () => clearTimeout(timer);
    }, [targetProgress]);

    // Caminho Orgânico de Montanha Descendo em SVG
    // Vai de (0, 10) no canto superior esquerdo para (100, 60) no inferior direito
    const pathD = "M 0 10 C 30 10, 40 60, 100 60";

    // Evita que o tooltip "Você" vase vazando fora da tela limitando o % visual entre 5% e 95% 
    // apenas para a UI do balão. A pontinha preenchida continua real.
    const tooltipLeftPercent = Math.min(Math.max(animatedProgress, 10), 90);

    return (
        <div
            className="rounded-3xl p-6 relative overflow-hidden group bg-(--card) shadow-xl border border-(--border)"
        >
            {/* Efeito Glow Condicional */}
            <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-[60px] opacity-20 transition-all duration-1000 ${isGoalReached ? 'bg-yellow-500' : 'bg-blue-500'}`} />

            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <Target size={18} className="text-blue-500" />
                    <h3 className="text-sm font-bold text-(--foreground) uppercase tracking-wider">Jornada de Peso</h3>
                </div>

                {/* Badge Dinâmico de Progresso */}
                <div className={`px-3 py-1 rounded-full border text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${isGoalReached ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                    {isGoalReached ? <><Sparkles size={14} /> Batida!</> : <><TrendingDown size={14} /> Faltam {remaining.toFixed(1)}kg</>}
                </div>
            </div>

            {/* Texto Motivacional */}
            <p className="text-xs font-medium text-(--muted) mb-8">
                {isGoalReached
                    ? "Incrível! Você conquistou o corpo que sonhava. Agora o foco é manter!"
                    : `Você já eliminou ${lostSoFar.toFixed(1)}kg desde o seu início. Continue focado!`
                }
            </p>

            {/* Container do Gráfico SVG de Montanha - Aumentado a altura para os assets caberem */}
            <div className="relative h-[150px] w-full mt-4 flex items-center pt-8" ref={containerRef}>

                {/* O traçado da ladeira */}
                <svg viewBox="0 0 100 80" preserveAspectRatio="none" className="absolute top-8 left-0 w-full h-[80px]" style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Preenchimento abaixo da linha (sutil) */}
                    <path
                        d={`${pathD} L 100 80 L 0 80 Z`}
                        fill="url(#area-grad)"
                    />

                    {/* Linha da Jornada Transparente Inteira */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="currentColor"
                        className="text-(--border) opacity-40"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    {/* Linha da Jornada Preenchida Colorida */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="url(#line-grad)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray="150"
                        strokeDashoffset={150 - (animatedProgress / 100) * 150}
                        className="transition-all duration-[2000ms] ease-out drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                    />
                </svg>

                {/* Marcadores em Cima da Linha Baseados em Posição Absoluta */}

                {/* Marco Zero: Início */}
                <div className="absolute top-[32px] left-0 -translate-x-1 text-center animate-fade-in w-12">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)] mx-auto mb-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    </div>
                    <span className="text-[10px] font-bold text-(--muted) uppercase tracking-wider block">Início</span>
                    <span className="text-xs font-black text-(--foreground)">{startWeight}</span>
                </div>

                {/* Marcador Dinâmico: Hoje/Você (Avançando pela Tela) */}
                <div
                    className="absolute z-20 transition-all duration-[2000ms] ease-out flex flex-col items-center"
                    style={{
                        left: `calc(${tooltipLeftPercent}% - 32px)`, // Largura ajustada pra alinhar no visual
                        // Top descendo conforme o Y do path: ~40px no inicio ate ~90px no final
                        top: `${40 + (animatedProgress / 100) * 50}px`
                    }}
                >
                    <div className="bg-blue-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg relative -top-7 whitespace-nowrap border border-blue-400">
                        Você: {currentWeight}
                        {/* Seta pra baixo suavizada */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rotate-45 border-r border-b border-blue-400" />
                    </div>
                    {/* Ponto Que Anda na mesma posição real (independente do tooltipeft limit) */}
                    <div
                        className="w-5 h-5 rounded-full bg-white border-[5px] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] absolute -top-2"
                        style={{
                            left: `calc(50% + ${(animatedProgress - tooltipLeftPercent) * (containerRef.current?.offsetWidth || 300) / 100}px - 10px)`
                        }}
                    />
                </div>

                {/* Marco Final: A Meta */}
                <div className="absolute top-[82px] right-0 translate-x-1 text-center animate-fade-in w-12" style={{ animationDelay: '500ms' }}>
                    <div className={`w-8 h-8 rounded-full ${isGoalReached ? 'bg-yellow-500/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 'bg-[#1a1d24] border-gray-600'} border-dashed border-2 flex items-center justify-center mx-auto mb-1 transition-all duration-1000`}>
                        <Flag size={14} className={isGoalReached ? 'text-yellow-500' : 'text-gray-500'} />
                    </div>
                    <span className="text-xs font-black text-(--foreground) block">{goalWeight}</span>
                    <span className="text-[10px] font-bold text-(--muted) uppercase tracking-wider">Meta</span>
                </div>

            </div>
        </div>
    );
}
