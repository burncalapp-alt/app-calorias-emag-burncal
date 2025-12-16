'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Flame, Check, TrendingUp, Loader2, Sparkles, Trophy, Target } from 'lucide-react';

interface QuizData {
    gender: 'male' | 'female' | null;
    workoutType: string[];
    workoutFrequency: string | null;
    height: number;
    weight: number;
    birthDate: string;
    goal: string | null;
    targetWeight: number;
    speed: string | null;
    motivation: string[];
}

interface OnboardingQuizProps {
    onComplete: (data: QuizData) => void;
}

export function OnboardingQuiz({ onComplete }: OnboardingQuizProps) {
    const [step, setStep] = useState(0);
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationStep, setCalculationStep] = useState(0); // 0: Metabolism, 1: Plan, 2: Ready
    const [data, setData] = useState<QuizData>({
        gender: null,
        workoutType: [],
        workoutFrequency: null,
        height: 170,
        weight: 70,
        birthDate: '',
        goal: null,
        targetWeight: 65,
        speed: null,
        motivation: []
    });

    const totalSteps = 11;

    const nextStep = () => {
        if (step < totalSteps - 1) {
            setStep(step + 1);
        } else {
            // Start calculation simulation
            startCalculation();
        }
    };

    const startCalculation = () => {
        setIsCalculating(true);
        // Simulate steps
        setTimeout(() => setCalculationStep(1), 1500);
        setTimeout(() => setCalculationStep(2), 3000);
        setTimeout(() => onComplete(data), 4500);
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    const canProceed = () => {
        switch (step) {
            case 0: return true; // Welcome
            case 1: return data.gender !== null;
            case 2: return data.workoutType.length > 0;
            case 3: return data.workoutFrequency !== null;
            case 4: return true; // Motivation page
            case 5: return data.height > 0 && data.weight > 0;
            case 6: return data.birthDate !== '';
            case 7: return data.goal !== null;
            case 8: return data.targetWeight > 0;
            case 9: return data.speed !== null;
            case 10: return data.motivation.length > 0;
            default: return true;
        }
    };

    const toggleWorkoutType = (type: string) => {
        setData(prev => ({
            ...prev,
            workoutType: prev.workoutType.includes(type)
                ? prev.workoutType.filter(t => t !== type)
                : [...prev.workoutType, type]
        }));
    };

    const toggleMotivation = (item: string) => {
        setData(prev => ({
            ...prev,
            motivation: prev.motivation.includes(item)
                ? prev.motivation.filter(m => m !== item)
                : [...prev.motivation, item]
        }));
    };

    const getPersonalizedMessage = () => {
        if (data.workoutFrequency === '6+') {
            return {
                title: 'Incrível dedicação!',
                subtitle: 'Sua disciplina é inspiradora',
                message: 'Um atleta ' + (data.gender === 'female' ? 'dedicada' : 'dedicado') + ' como você sabe que o treino é só 50% do processo. Com a dieta ajustada no BurnCal, vamos desbloquear seu potencial máximo!'
            };
        } else if (data.workoutFrequency === '3-5') {
            return {
                title: 'Ótimo ritmo!',
                subtitle: 'Consistência é a chave',
                message: 'Você já tem o hábito, agora vamos otimizar os resultados. Com a nutrição correta, seus ' + data.workoutFrequency + ' treinos semanais valerão por 7!'
            };
        }
        return {
            title: 'O primeiro passo é o mais importante',
            subtitle: 'Estamos juntos nessa',
            message: 'Não se preocupe com a intensidade agora. O segredo é comer melhor, não menos. O BurnCal vai guiar cada passo da sua transformação.'
        };
    };

    const renderCalculationScreen = () => {
        const steps = [
            { text: "Calculando Taxa Metabólica Basal...", icon: Flame },
            { text: "Criando estratégia de macros...", icon: Target },
            { text: "Personalizando plano de hidratação...", icon: Sparkles },
        ];

        const currentMsg = steps[Math.min(calculationStep, 2)];
        const Icon = currentMsg.icon;

        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 animate-in fade-in zoom-in duration-700">
                <div className="relative mb-12">
                    <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 animate-pulse rounded-full" />
                    <div className="relative p-8 rounded-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-orange-500/30 shadow-2xl">
                        <Icon className="w-16 h-16 text-orange-500 animate-bounce-slow" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                    Criando seu plano perfeito
                </h2>
                <p className="text-orange-400 text-lg mb-8 animate-pulse text-center">
                    {currentMsg.text}
                </p>

                <div className="w-full max-w-xs bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-shimmer"
                        style={{ width: `${((calculationStep + 1) / 3) * 100}%`, transition: 'width 1s ease-in-out' }}
                    />
                </div>
            </div>
        );
    };

    const renderStep = () => {
        if (isCalculating) return renderCalculationScreen();

        switch (step) {
            // Step 0: Welcome
            case 0:
                return (
                    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="mb-8 relative">
                            <div className="absolute inset-0 bg-orange-600 blur-[60px] opacity-30 rounded-full animate-pulse-slow" />
                            <div className="relative p-8 rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 backdrop-blur-xl">
                                <Flame className="w-20 h-20 text-orange-500 fill-orange-500 animate-float" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                            Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">BurnCal</span>
                        </h1>
                        <p className="text-gray-400 text-xl leading-relaxed max-w-sm mx-auto">
                            Vamos criar um plano 100% personalizado para o seu metabolismo e rotina.
                        </p>
                    </div>
                );

            // Step 1: Gender
            case 1:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-white mb-3">Qual o seu gênero?</h2>
                            <p className="text-gray-400">Essencial para calcular seu metabolismo basal</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { id: 'male', label: 'Masculino', emoji: '👨' },
                                { id: 'female', label: 'Feminino', emoji: '👩' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setData({ ...data, gender: opt.id as any })}
                                    className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 ${data.gender === opt.id
                                        ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.2)]'
                                        : 'border-gray-800 bg-gray-900/40 hover:border-gray-600'
                                        }`}
                                >
                                    <span className="text-6xl mb-6 block transform group-hover:scale-110 transition-transform duration-300">{opt.emoji}</span>
                                    <span className={`font-bold text-lg ${data.gender === opt.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{opt.label}</span>

                                    {data.gender === opt.id && (
                                        <div className="absolute top-4 right-4 bg-orange-500 rounded-full p-1 animate-in zoom-in">
                                            <Check size={16} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            // Step 2: Workout Type
            case 2:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Seu estilo de treino</h2>
                            <p className="text-gray-400">O que você mais gosta de fazer?</p>
                        </div>
                        <div className="space-y-3">
                            {[
                                { id: 'running', label: 'Cardio / Corrida', emoji: '🏃', desc: 'Foco em resistência' },
                                { id: 'gym', label: 'Musculação', emoji: '🏋️', desc: 'Foco em força' },
                                { id: 'both', label: 'Híbrido', emoji: '⚡', desc: 'Cardio + Força' },
                                { id: 'mixed', label: 'Funcional / Outros', emoji: '🤸', desc: 'Movimento variado' }
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => toggleWorkoutType(option.id)}
                                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${data.workoutType.includes(option.id)
                                        ? 'border-orange-500 bg-gradient-to-r from-orange-500/10 to-transparent'
                                        : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${data.workoutType.includes(option.id) ? 'bg-orange-500/20' : 'bg-gray-800'}`}>
                                        {option.emoji}
                                    </div>
                                    <div className="text-left flex-1">
                                        <span className={`block font-bold text-lg ${data.workoutType.includes(option.id) ? 'text-white' : 'text-gray-300'}`}>{option.label}</span>
                                        <span className="text-xs text-gray-500">{option.desc}</span>
                                    </div>
                                    {data.workoutType.includes(option.id) && (
                                        <div className="bg-orange-500 rounded-full p-1 animate-in zoom-in">
                                            <Check className="text-white" size={16} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            // Step 3: Frequency
            case 3:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Frequência Semanal</h2>
                            <p className="text-gray-400">Seja sincero(a), vamos ajustar o plano a isso</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { id: '0-2', label: 'Iniciante', sub: '0-2 treinos/sem', emoji: '🌱', color: 'from-green-500/20 to-green-600/5' },
                                { id: '3-5', label: 'Intermediário', sub: '3-5 treinos/sem', emoji: '🔥', color: 'from-orange-500/20 to-orange-600/5' },
                                { id: '6+', label: 'Avançado', sub: '6+ treinos/sem', emoji: '🚀', color: 'from-red-500/20 to-red-600/5' }
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setData({ ...data, workoutFrequency: option.id })}
                                    className={`w-full p-6 rounded-2xl border-2 flex items-center gap-6 transition-all duration-300 hover:scale-[1.02] ${data.workoutFrequency === option.id
                                        ? `border-${option.id === '0-2' ? 'green' : option.id === '3-5' ? 'orange' : 'red'}-500 bg-gradient-to-r ${option.color}`
                                        : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
                                        }`}
                                >
                                    <span className="text-4xl drop-shadow-lg">{option.emoji}</span>
                                    <div className="text-left">
                                        <span className="text-white font-bold text-xl block mb-1">{option.label}</span>
                                        <span className="text-gray-400 font-medium">{option.sub}</span>
                                    </div>
                                    {data.workoutFrequency === option.id && (
                                        <Check className={`ml-auto text-${option.id === '0-2' ? 'green' : option.id === '3-5' ? 'orange' : 'red'}-500`} size={28} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            // Step 4: Motivation Message
            case 4:
                const msg = getPersonalizedMessage();
                return (
                    <div className="space-y-6 animate-in zoom-in duration-500">
                        <div className="text-center">
                            <div className="inline-block p-3 rounded-full bg-orange-500/10 mb-4">
                                <Trophy className="text-orange-500 w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{msg.title}</h2>
                            <p className="text-orange-500 font-bold text-lg">{msg.subtitle}</p>
                        </div>

                        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 backdrop-blur-md shadow-xl">
                            <div className="absolute -top-4 -left-4 text-6xl opacity-10">❝</div>
                            <p className="text-gray-200 text-center text-lg leading-relaxed relative z-10">
                                {msg.message}
                            </p>
                            <div className="absolute -bottom-4 -right-4 text-6xl opacity-10">❞</div>
                        </div>

                        <div className="bg-black/30 rounded-3xl p-6 border border-gray-800/50">
                            <div className="flex justify-between h-32 px-2 gap-3">
                                {[30, 45, 55, 65, 80, 100].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col justify-end group h-full">
                                        <div
                                            className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-md relative hover:from-orange-500 hover:to-orange-300 transition-colors"
                                            style={{ height: `${h}%` }}
                                        >
                                            {i === 5 && (
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-orange-600 text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                                                    +40%
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 text-xs font-medium text-gray-400 px-2">
                                <span>Sem plano</span>
                                <span className="text-orange-500 flex items-center gap-1">
                                    <Sparkles size={12} /> Com BurnCal
                                </span>
                            </div>
                        </div>
                    </div>
                );

            // Step 5: Height/Weight
            case 5:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Medidas Corporais</h2>
                            <p className="text-gray-400">Precisão para seu cálculo calórico</p>
                        </div>

                        {/* Height */}
                        <div className="bg-gray-900/50 rounded-3xl p-6 border border-gray-800 backdrop-blur-sm">
                            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-6 text-center">Altura (cm)</label>
                            <div className="flex items-center justify-between gap-4">
                                <button
                                    onClick={() => setData({ ...data, height: Math.max(100, data.height - 1) })}
                                    className="w-14 h-14 rounded-2xl bg-gray-800 text-white text-2xl hover:bg-gray-700 active:scale-95 transition-all"
                                >−</button>
                                <div className="text-center flex-1">
                                    <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">{data.height}</span>
                                </div>
                                <button
                                    onClick={() => setData({ ...data, height: Math.min(250, data.height + 1) })}
                                    className="w-14 h-14 rounded-2xl bg-gray-800 text-white text-2xl hover:bg-gray-700 active:scale-95 transition-all"
                                >+</button>
                            </div>

                            <input
                                type="range"
                                min="100" max="230"
                                value={data.height}
                                onChange={(e) => setData({ ...data, height: Number(e.target.value) })}
                                className="w-full mt-6 accent-orange-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                            />

                        </div>

                        {/* Weight */}
                        <div className="bg-gray-900/50 rounded-3xl p-6 border border-gray-800 backdrop-blur-sm">
                            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-6 text-center">Peso (kg)</label>
                            <div className="flex items-center justify-between gap-4">
                                <button
                                    onClick={() => setData({ ...data, weight: Math.max(30, data.weight - 1) })}
                                    className="w-14 h-14 rounded-2xl bg-gray-800 text-white text-2xl hover:bg-gray-700 active:scale-95 transition-all"
                                >−</button>
                                <div className="text-center flex-1">
                                    <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">{data.weight}</span>
                                </div>
                                <button
                                    onClick={() => setData({ ...data, weight: Math.min(300, data.weight + 1) })}
                                    className="w-14 h-14 rounded-2xl bg-gray-800 text-white text-2xl hover:bg-gray-700 active:scale-95 transition-all"
                                >+</button>
                            </div>
                            <input
                                type="range"
                                min="30" max="180"
                                value={data.weight}
                                onChange={(e) => setData({ ...data, weight: Number(e.target.value) })}
                                className="w-full mt-6 accent-orange-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                );

            // Step 6: Birth Date
            case 6:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Data de Nascimento</h2>
                            <p className="text-gray-400">A idade influencia diretamente no metabolismo</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-3xl p-8 border border-gray-800 flex justify-center">
                            <input
                                type="date"
                                value={data.birthDate}
                                onChange={(e) => setData({ ...data, birthDate: e.target.value })}
                                className="bg-transparent text-white text-3xl text-center font-bold focus:outline-none w-full cursor-pointer p-4 border-b-2 border-orange-500/50 focus:border-orange-500 transition-colors"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                    </div>
                );

            // Step 7: Goal
            case 7:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Qual seu foco principal?</h2>
                            <p className="text-gray-400">Vamos personalizar suas macro-nutrientes</p>
                        </div>
                        <div className="space-y-3">
                            {[
                                { id: 'lose_weight', label: 'Perder Peso', emoji: '🔥', desc: 'Queimar gordura' },
                                { id: 'gain_definition', label: 'Definição', emoji: '💎', desc: 'Manter músculo, perder gordura' },
                                { id: 'maintain', label: 'Manutenção', emoji: '⚖️', desc: 'Manter peso atual' },
                                { id: 'gain_muscle', label: 'Ganhar Massa', emoji: '💪', desc: 'Hipertrofia' }
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setData({ ...data, goal: option.id })}
                                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] ${data.goal === option.id
                                        ? 'border-orange-500 bg-orange-500/10 shadow-lg'
                                        : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
                                        }`}
                                >
                                    <span className="text-4xl">{option.emoji}</span>
                                    <div className="text-left flex-1">
                                        <span className="text-white font-bold text-lg block">{option.label}</span>
                                        <span className="text-gray-500 text-sm">{option.desc}</span>
                                    </div>
                                    {data.goal === option.id && (
                                        <Check className="text-orange-500" size={24} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            // Step 8: Target Weight
            case 8:
                const goalLabel = data.goal === 'lose_weight' ? 'Qual sua meta de peso?' :
                    data.goal === 'gain_muscle' ? 'Quanto quer pesar?' : 'Peso de manutenção';
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">{goalLabel}</h2>
                            <p className="text-gray-400">Vamos definir onde você quer chegar</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-3xl p-8 border border-gray-800 backdrop-blur-sm relative overflow-hidden">
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

                            <div className="flex items-center justify-between gap-6">
                                <button
                                    onClick={() => setData({ ...data, targetWeight: Math.max(30, data.targetWeight - 1) })}
                                    className="w-14 h-14 rounded-full bg-gray-800 text-white font-bold text-2xl hover:bg-gray-700 active:scale-95 transition-all shadow-lg"
                                >−</button>
                                <div className="text-center relative z-10">
                                    <span className="text-7xl font-bold text-white tracking-tighter">{data.targetWeight}</span>
                                    <span className="text-gray-500 text-xl font-medium ml-2 block mt-1">kg</span>
                                </div>
                                <button
                                    onClick={() => setData({ ...data, targetWeight: Math.min(200, data.targetWeight + 1) })}
                                    className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold text-2xl hover:shadow-orange-500/20 hover:shadow-lg active:scale-95 transition-all"
                                >+</button>
                            </div>

                            <input
                                type="range"
                                min="40" max="150"
                                value={data.targetWeight}
                                onChange={(e) => setData({ ...data, targetWeight: Number(e.target.value) })}
                                className="w-full mt-8 accent-orange-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                            />

                            {data.goal === 'lose_weight' && data.targetWeight < data.weight && (
                                <div className="mt-8 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center animate-in zoom-in">
                                    <p className="text-green-400 font-medium">
                                        📉 Você quer eliminar <span className="font-bold">{data.weight - data.targetWeight}kg</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            // Step 9: Speed
            case 9:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Em quanto tempo?</h2>
                            <p className="text-gray-400">Isso definirá o quão restrita será sua dieta</p>
                        </div>
                        <div className="space-y-3">
                            {[
                                { id: 'slow', label: 'Relaxado', subtitle: 'Sem pressa, comendo mais', emoji: '☕' },
                                { id: 'moderate', label: 'Equilibrado', subtitle: 'O ideal para consistência', emoji: '⚖️' },
                                { id: 'fast', label: 'Acelerado', subtitle: 'Foco total em resultados', emoji: '⚡' }
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setData({ ...data, speed: option.id })}
                                    className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300 hover:translate-y-[-2px] ${data.speed === option.id
                                        ? 'border-orange-500 bg-orange-500/10 shadow-lg'
                                        : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
                                        }`}
                                >
                                    <span className="text-3xl">{option.emoji}</span>
                                    <div className="text-left">
                                        <span className="text-white font-bold text-lg block">{option.label}</span>
                                        <span className="text-gray-400 text-sm">{option.subtitle}</span>
                                    </div>
                                    {data.speed === option.id && <Check className="ml-auto text-orange-500" />}
                                </button>
                            ))}
                        </div>
                        <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-2xl p-4 border border-orange-500/20 flex gap-3 items-center">
                            <div className="bg-orange-500/20 p-2 rounded-lg">
                                <TrendingUp className="text-orange-500" size={20} />
                            </div>
                            <p className="text-gray-300 text-sm flex-1">
                                Usuários que escolhem <span className="text-white font-bold">Equilibrado</span> tendem a manter o peso por 3x mais tempo.
                            </p>
                        </div>
                    </div>
                );

            // Step 10: Motivation (Final Selection)
            case 10:
                const nameLabel = data.gender === 'female' ? 'Campegã' : 'Campeão';
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Última coisa, {nameLabel}!</h2>
                            <p className="text-gray-400">O que vai te fazer levantar da cama?</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'healthy', label: 'Saúde & Longevidade', emoji: '❤️' },
                                { id: 'energy', label: 'Energia & Disposição', emoji: '⚡' },
                                { id: 'confidence', label: 'Autoestima & Confiança', emoji: '✨' },
                                { id: 'clothes', label: 'Entrar nas roupas antigas', emoji: '👖' }
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => toggleMotivation(option.id)}
                                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-200 ${data.motivation.includes(option.id)
                                        ? 'border-orange-500 bg-orange-500/10 translate-x-2'
                                        : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
                                        }`}
                                >
                                    <span className="text-2xl">{option.emoji}</span>
                                    <span className={`font-medium text-lg ${data.motivation.includes(option.id) ? 'text-white' : 'text-gray-300'}`}>{option.label}</span>
                                    {data.motivation.includes(option.id) && (
                                        <Check className="ml-auto text-orange-500" size={20} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="h-[100dvh] w-full bg-[#0d0f14] flex flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[50%] bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[50%] bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Progress Header */}
            {!isCalculating && step > 0 && (
                <div className="px-6 pt-8 pb-2 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={prevStep}
                            className="p-2 rounded-full hover:bg-gray-800/80 transition-colors backdrop-blur-sm"
                        >
                            <ChevronLeft className="text-gray-400" size={24} />
                        </button>
                        <div className="flex-1">
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-600 shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-500 ease-out"
                                    style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-8 text-right">{step + 1}/{totalSteps}</span>
                    </div>
                </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 px-6 py-4 overflow-y-auto overflow-x-hidden z-10 scrollbar-hide">
                <div className="max-w-md mx-auto h-full flex flex-col justify-center">
                    {renderStep()}
                </div>
            </div>

            {/* Footer Actions */}
            {!isCalculating && (
                <div className="p-6 pb-8 z-10 bg-gradient-to-t from-[#0d0f14] via-[#0d0f14] to-transparent">
                    <button
                        onClick={nextStep}
                        disabled={!canProceed()}
                        className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${canProceed()
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-gray-800/50 text-gray-500 cursor-not-allowed grayscale'
                            }`}
                    >
                        {step === totalSteps - 1 ? 'Finalizar e Ver Plano' : 'Continuar'}
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
