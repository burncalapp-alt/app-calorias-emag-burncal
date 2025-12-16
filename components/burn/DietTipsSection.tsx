'use client';

import React from 'react';
import { Lightbulb, ArrowRight, Salad, GlassWater, Ban } from 'lucide-react';

export function DietTipsSection() {
    const tips = [
        {
            icon: Salad,
            color: "text-green-500",
            bg: "bg-green-500/10",
            title: "Adicione mais fibras",
            desc: "Você consumiu poucas fibras ontem. Tente adicionar aveia ou chia no café da manhã.",
            action: "Ver alimentos ricos em fibra"
        },
        {
            icon: GlassWater,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            title: "Hidratação matinal",
            desc: "Beber 500ml de água logo ao acordar acelera seu metabolismo em até 24%.",
            action: "Registrar água agora"
        },
        {
            icon: Ban,
            color: "text-red-500",
            bg: "bg-red-500/10",
            title: "Cuidado com o sódio",
            desc: "A sopa de ontem tinha alto teor de sódio. Evite temperos prontos hoje.",
            action: "Ver opções de temperos"
        }
    ];

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">

            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md">
                        <Lightbulb size={24} className="text-yellow-300" fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold mb-1">Análise da IA</h2>
                        <p className="text-indigo-100 text-sm leading-relaxed">
                            Analisei seus registros de ontem e preparei 3 sugestões para otimizar sua queima de gordura hoje.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {tips.map((tip, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-[#1e293b] border border-gray-800 hover:border-gray-700 transition-colors group cursor-pointer">
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-full ${tip.bg} flex items-center justify-center shrink-0`}>
                                <tip.icon size={24} className={tip.color} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold mb-1">{tip.title}</h3>
                                <p className="text-gray-400 text-sm mb-3">{tip.desc}</p>
                                <span className="text-xs font-bold text-green-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                                    {tip.action} <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
