'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BMICardProps {
    weight: number;
    height: number;
}

export function BMICard({ weight, height }: BMICardProps) {
    const [animatedBmi, setAnimatedBmi] = useState(0);

    // Cálculo seguro
    const h = height > 0 ? height / 100 : 1;
    const bmi = weight > 0 ? weight / (h * h) : 0;

    // Categorias de IMC
    const getStatus = (value: number) => {
        if (value < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-500', bg: 'bg-blue-500', lightBg: 'bg-blue-500/10', border: 'border-blue-500/20' };
        if (value >= 18.5 && value < 25) return { label: 'Peso Saudável', color: 'text-green-500', bg: 'bg-green-500', lightBg: 'bg-green-500/10', border: 'border-green-500/20' };
        if (value >= 25 && value < 30) return { label: 'Sobrepeso', color: 'text-yellow-500', bg: 'bg-yellow-500', lightBg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
        if (value >= 30 && value < 35) return { label: 'Obesidade Grau I', color: 'text-orange-500', bg: 'bg-orange-500', lightBg: 'bg-orange-500/10', border: 'border-orange-500/20' };
        return { label: 'Obesidade Severa', color: 'text-red-500', bg: 'bg-red-500', lightBg: 'bg-red-500/10', border: 'border-red-500/20' };
    };

    const status = getStatus(bmi);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedBmi(bmi);
        }, 100);
        return () => clearTimeout(timer);
    }, [bmi]);

    // Lógica do Gráfico de Velocímetro (Semi-Circle SVG)
    // Range visual de 15 a 45
    const minMBI = 15;
    const maxBMI = 45;

    const radius = 40;
    // O comprimento da circunferência é 2 * PI * R
    // A meia circunferência (o arco) = PI * R = ~125.66
    const halfCircumference = Math.PI * radius;

    // Limita o valor para não quebrar a UI
    const clampedBmi = Math.min(Math.max(animatedBmi, minMBI), maxBMI);
    const percentFill = (clampedBmi - minMBI) / (maxBMI - minMBI);

    // O offset inverte quanto preenche
    const strokeDashoffset = halfCircumference - (percentFill * halfCircumference);

    return (
        <div className="rounded-3xl p-6 bg-(--card) shadow-xl border border-(--border) relative overflow-hidden group mb-4">
            {/* Ambient Background Glow */}
            <div className={cn("absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-20 transition-all duration-1000", status.bg)} />

            {/* Header */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={18} className={status.color} />
                        <h3 className="text-sm font-bold text-(--foreground) uppercase tracking-wider">Massa Corporal</h3>
                    </div>
                    <p className="text-xs font-medium text-(--muted)">{weight} kg • {height} cm</p>
                </div>

                <div className={cn("px-3 py-1 rounded-full border text-xs font-bold transition-all shadow-sm flex items-center gap-1", status.lightBg, status.color, status.border)}>
                    {status.label}
                </div>
            </div>

            {/* Gauge Chart Area */}
            <div className="relative flex flex-col items-center justify-center pt-6 pb-2">
                {/* SVG Gauge */}
                <svg
                    viewBox="0 0 100 65"
                    className="w-full max-w-[260px] drop-shadow-[0_0_15px_rgba(0,0,0,0.15)]"
                    style={{ overflow: 'visible' }}
                >
                    {/* Fundo do Trilho (Cinza/Transparente) */}
                    <path
                        d="M 10 60 A 40 40 0 0 1 90 60"
                        fill="none"
                        stroke="currentColor"
                        className="text-(--border) opacity-40"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* Gradient Defs para a pontuação dinâmica */}
                    <defs>
                        <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" /> {/* Blue */}
                            <stop offset="30%" stopColor="#22c55e" /> {/* Green */}
                            <stop offset="60%" stopColor="#eab308" /> {/* Yellow */}
                            <stop offset="100%" stopColor="#ef4444" /> {/* Red */}
                        </linearGradient>
                    </defs>

                    {/* Barra de Progresso Colorida Dinâmica com bordas arredondadas */}
                    <path
                        d="M 10 60 A 40 40 0 0 1 90 60"
                        fill="none"
                        stroke="url(#score-gradient)"
                        className={cn("transition-all duration-1500 ease-out drop-shadow-lg")}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${halfCircumference} ${halfCircumference}`}
                        strokeDashoffset={strokeDashoffset}
                    />
                </svg>

                {/* Score Number in Center */}
                <div className="absolute bottom-2 flex flex-col items-center animate-fade-in translate-y-2" style={{ animationDelay: '500ms' }}>
                    <span className={cn("text-5xl font-black tabular-nums tracking-tighter drop-shadow-sm transition-colors duration-1000", status.color)}>
                        {bmi.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-bold text-(--muted) uppercase tracking-widest mt-1">Pontuação IMC</span>
                </div>
            </div>

            {/* Legenda Inferior Fina (Espaçada) */}
            <div className="mt-12 flex justify-between text-[10px] font-bold text-(--muted) uppercase tracking-wider relative pt-4">
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-(--border) to-transparent opacity-50"></div>
                <span>Curva 15</span>
                <span>Alerta Crítico 40+</span>
            </div>
        </div>
    );
}
