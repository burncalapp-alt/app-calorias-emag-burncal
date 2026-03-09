'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Clock, Droplets, Trophy, Activity, AlertCircle, Sparkles, Award, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserContext } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabaseClient';

// Fases Metabólicas do Jejum Expandidas
const FASTING_STAGES = [
    { hours: 0, title: 'Início', description: 'Glicemia estabilizando', color: 'text-gray-400' },
    { hours: 2, title: 'Fim da Digestão', description: 'Insulina começa a cair', color: 'text-blue-300' },
    { hours: 4, title: 'Queda Glicêmica', description: 'O corpo se prepara para usar reservas', color: 'text-blue-400' },
    { hours: 8, title: 'Transição Energética', description: 'Fígado esgota glicogênio e foca na gordura', color: 'text-orange-300' },
    { hours: 12, title: 'Pico de HGH', description: 'Reparo celular iniciado', color: 'text-orange-400' },
    { hours: 14, title: 'Cetose Inicial', description: 'Queimando gordura como fonte de energia', color: 'text-orange-500' },
    { hours: 16, title: 'Modo Queima Turbo', description: 'Gordura corporal sendo ativamente consumida', color: 'text-red-500' },
    { hours: 18, title: 'Autofagia', description: 'Renovação celular e anti-envelhecimento', color: 'text-purple-500' },
    { hours: 24, title: 'Renovação Profunda', description: 'Esvaziamento do glicogênio completo', color: 'text-purple-600' },
];

interface FastingTabProps {
    currentWater?: number;
    goalWater?: number;
    onWaterAdd?: (amount: number) => void;
}

export function FastingTab({ currentWater = 0, goalWater = 2000, onWaterAdd }: FastingTabProps) {
    const { user } = useUserContext();

    const [isFasting, setIsFasting] = useState(false);
    const [fastingStartTime, setFastingStartTime] = useState<Date | null>(null);
    const [elapsed, setElapsed] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [goalHours, setGoalHours] = useState(16);
    const [currentStage, setCurrentStage] = useState(FASTING_STAGES[0]);
    const [nextStage, setNextStage] = useState(FASTING_STAGES[1]);

    // Gamificação e IA
    const [streak, setStreak] = useState(0);
    const [title, setTitle] = useState("Iniciante da Queima");
    const [maxRecord, setMaxRecord] = useState(0);
    const [historyLogs, setHistoryLogs] = useState<any[]>([]);

    // Buscar Jejum Ativo ao carregar (Local + Supabase)
    useEffect(() => {
        // Primeiro: recupera estado local
        const localStatus = localStorage.getItem('fasting_isFasting') === 'true';
        const localStartTime = localStorage.getItem('fasting_startTime');
        const localGoalHours = localStorage.getItem('fasting_goalHours');
        const localStreak = localStorage.getItem('fasting_streak');
        const localMaxRecord = localStorage.getItem('fasting_maxRecord');
        const localHistory = localStorage.getItem('fasting_history');

        if (localStreak) {
            const streakNum = parseInt(localStreak, 10);
            setStreak(streakNum);
            if (streakNum >= 7) setTitle("Monge da Autofagia");
            else if (streakNum >= 3) setTitle("Mestre Intermitente");
        }
        if (localMaxRecord) setMaxRecord(parseInt(localMaxRecord, 10));
        if (localHistory) {
            try {
                setHistoryLogs(JSON.parse(localHistory));
            } catch (e) {
                console.error("Erro ao dar parse no histórico local", e);
            }
        }

        if (localStatus && localStartTime) {
            setIsFasting(true);
            setFastingStartTime(new Date(localStartTime));
            if (localGoalHours) setGoalHours(parseInt(localGoalHours, 10));
        }

        // Se ainda não tem usuário logado perfeitamente no state, encerra por aqui (fica só no local)
        if (!user) return;

        // Segundo: Tenta sincronizar com o banco de dados oficial
        const checkActiveFasting = async () => {
            try {
                const { data, error } = await supabase
                    .from('fasting_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .maybeSingle();

                // Ignora erros de "tabela não existe" para não quebrar UI 
                if (error || !data) {
                    console.log('Fasting record not found or table missing - keeping local state');
                    return;
                }

                if (data) {
                    // Supabase prevalece se achar registro oficial ativo
                    setIsFasting(true);
                    setFastingStartTime(new Date(data.start_time));
                    setGoalHours(data.goal_hours || 16);
                    localStorage.setItem('fasting_isFasting', 'true');
                    localStorage.setItem('fasting_startTime', data.start_time);
                    localStorage.setItem('fasting_goalHours', (data.goal_hours || 16).toString());
                }
            } catch (error) {
                console.log('Supabase fetch bypassed');
            }
        };

        checkActiveFasting();
    }, [user]);

    // Timer Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isFasting && fastingStartTime) {
            // Conta imediatamente 1 vez pra não ter delay na UI
            updateTimer();
            interval = setInterval(updateTimer, 1000);
        } else {
            // Limpeza visual se pausar
            setElapsed({ hours: 0, minutes: 0, seconds: 0 });
            setCurrentStage(FASTING_STAGES[0]);
            setNextStage(FASTING_STAGES[1]);
        }

        function updateTimer() {
            if (!fastingStartTime) return;
            const now = new Date();
            const diffInMs = now.getTime() - fastingStartTime.getTime();

            // Evitar valores negativos se der erro de fuso
            if (diffInMs < 0) return;

            const hours = Math.floor(diffInMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

            setElapsed({ hours, minutes, seconds });

            // Determinar Fases Metabólicas
            let current = FASTING_STAGES[0];
            let next = FASTING_STAGES[1];

            for (let i = 0; i < FASTING_STAGES.length; i++) {
                if (hours >= FASTING_STAGES[i].hours) {
                    current = FASTING_STAGES[i];
                    next = FASTING_STAGES[i + 1] || FASTING_STAGES[FASTING_STAGES.length - 1];
                }
            }

            setCurrentStage(current);
            setNextStage(next);

            // Explosão de Dopamina Visual na Meta
            if (hours >= goalHours) {
                const celebrated = localStorage.getItem('fasting_celebrated');
                if (!celebrated) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#f97316', '#ef4444', '#eab308'] // Laranja, vermelho, amarelo
                    });
                    localStorage.setItem('fasting_celebrated', 'true');
                }
            }
        }

        return () => clearInterval(interval);
    }, [isFasting, fastingStartTime]);

    const toggleFasting = async () => {
        if (!user) {
            console.log("Usuário não logado, simulando jejum na tela apenas.");
            handleLocalFasting();
            return;
        }

        if (isFasting) {
            // Quebrar Jejum
            handleEndFastingOffline();
            try {
                await supabase
                    .from('fasting_logs')
                    .update({
                        status: 'completed',
                        end_time: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .eq('status', 'active');
            } catch (error) {
                console.log("Supabase db write failed, UI state updated regardless", error);
            }
        } else {
            // Começar Jejum
            const startTime = new Date();
            handleStartFastingOffline(startTime);

            try {
                await supabase
                    .from('fasting_logs')
                    .insert({
                        user_id: user.id,
                        start_time: startTime.toISOString(),
                        goal_hours: goalHours,
                        status: 'active'
                    });
            } catch (error) {
                console.log("Supabase db write failed, UI state updated regardless", error);
            }
        }
    };

    const handleLocalFasting = () => {
        if (isFasting) {
            handleEndFastingOffline();
        } else {
            handleStartFastingOffline(new Date());
        }
    };

    const handleStartFastingOffline = (time: Date) => {
        setIsFasting(true);
        setFastingStartTime(time);

        // Cache no navegador
        localStorage.setItem('fasting_isFasting', 'true');
        localStorage.setItem('fasting_startTime', time.toISOString());
        localStorage.setItem('fasting_goalHours', goalHours.toString());
    };

    const handleEndFastingOffline = () => {
        // Verifica se completou a meta para atualizar Ofensiva e Recordes
        if (fastingStartTime) {
            const now = new Date();
            const diffInMs = now.getTime() - fastingStartTime.getTime();
            const hours = Math.floor(diffInMs / (1000 * 60 * 60));

            if (hours >= goalHours) {
                const newStreak = streak + 1;
                setStreak(newStreak);
                localStorage.setItem('fasting_streak', newStreak.toString());

                if (newStreak >= 7) setTitle("Monge da Autofagia");
                else if (newStreak >= 3) setTitle("Mestre Intermitente");
            }
            if (hours > maxRecord) {
                setMaxRecord(hours);
                localStorage.setItem('fasting_maxRecord', hours.toString());
            }

            // Formatando o tempo gasto para exibição bonitinha (16h 30m, 45m, 5s)
            let formattedDuration = "";
            const h = Math.floor(diffInMs / (1000 * 60 * 60));
            const m = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diffInMs % (1000 * 60)) / 1000);

            if (h > 0) formattedDuration += `${h}h `;
            if (m > 0 || h > 0) formattedDuration += `${m}m`;
            if (h === 0 && m === 0) formattedDuration = `${s}s`; // Para cliques rápidos de teste

            // Salvar no Histórico
            const newRecord = {
                id: Date.now().toString(),
                startTime: fastingStartTime.toISOString(),
                endTime: now.toISOString(),
                goalHours,
                durationFormatted: formattedDuration.trim(),
                durationHours: Number((diffInMs / (1000 * 60 * 60)).toFixed(1))
            };

            const updatedHistory = [newRecord, ...historyLogs].slice(0, 10); // Mantém os últimos 10
            setHistoryLogs(updatedHistory);
            localStorage.setItem('fasting_history', JSON.stringify(updatedHistory));
        }

        setIsFasting(false);
        setFastingStartTime(null);
        setElapsed({ hours: 0, minutes: 0, seconds: 0 });
        setCurrentStage(FASTING_STAGES[0]);
        setNextStage(FASTING_STAGES[1]);

        // Limpar cache no navegador
        localStorage.removeItem('fasting_isFasting');
        localStorage.removeItem('fasting_startTime');
        localStorage.removeItem('fasting_goalHours');
        localStorage.removeItem('fasting_celebrated');
    };

    // Cálculo hiper-granulado do tempo para as barras encherem de forma visualmente fluída
    const fractionalHours = elapsed.hours + (elapsed.minutes / 60) + (elapsed.seconds / 3600);
    const progressPercentage = Math.min(100, (fractionalHours / goalHours) * 100);

    return (
        <div className="space-y-6 pt-2 pb-20 animate-fade-in">
            {/* Header com Gamificação */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1">
                        <Award size={14} /> {title}
                    </span>
                    <h1 className="text-2xl font-bold text-(--foreground) leading-none mt-1">Jejum</h1>
                </div>

                <div className="flex items-center gap-1 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 shadow-sm">
                    <Flame className="text-orange-500 fill-orange-500" size={16} />
                    <span className="font-bold text-orange-500 text-sm whitespace-nowrap">{streak} Ofensiva</span>
                </div>
            </div>

            <div className="flex items-center justify-between bg-(--card) rounded-2xl p-2 border border-(--border)">
                <span className="text-sm font-medium text-(--muted) ml-2">Sua Meta:</span>
                <div className="flex gap-1">
                    {[12, 14, 16, 18, 24].map((h) => (
                        <button
                            key={h}
                            onClick={() => setGoalHours(h)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-bold transition-all",
                                goalHours === h
                                    ? "bg-orange-500 text-white shadow-md transform scale-105"
                                    : "text-(--muted) hover:bg-orange-500/10 hover:text-orange-500"
                            )}
                        >
                            {h}h
                        </button>
                    ))}
                </div>
            </div>

            {/* Timer Circle Gamificado */}
            <div className="relative aspect-square max-w-[300px] mx-auto flex items-center justify-center">
                {/* Ring Background */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        className="stroke-(--border) fill-none"
                        strokeWidth="12"
                    />
                    <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        className="stroke-orange-500 fill-none transition-all duration-1000 ease-in-out"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="283" // Aproximado para r=45% base viewbox 100x100
                        strokeDashoffset={283 - (283 * progressPercentage) / 100}
                        pathLength="100"
                    />
                </svg>

                {/* Informações Internas do Timer */}
                <div className="z-10 text-center flex flex-col items-center justify-center space-y-2">
                    {isFasting ? (
                        <>
                            <p className="text-sm font-medium text-(--muted) uppercase tracking-widest">Jejuando</p>
                            <h2 className="text-5xl font-black text-(--foreground) tabular-nums tracking-tight">
                                {String(elapsed.hours).padStart(2, '0')}:
                                {String(elapsed.minutes).padStart(2, '0')}:
                                {String(elapsed.seconds).padStart(2, '0')}
                            </h2>
                            <p className="text-sm font-medium text-orange-500/80 bg-orange-500/10 px-3 py-1 rounded-full">
                                Meta: {goalHours}h
                            </p>
                        </>
                    ) : (
                        <>
                            <Flame size={48} className="text-(--muted) mb-2 inline-block opacity-20" />
                            <p className="text-lg font-medium text-(--muted)">Pronto para queimar?</p>
                        </>
                    )}
                </div>
            </div>

            {/* Main Action Button */}
            <button
                onClick={toggleFasting}
                className={cn(
                    "w-full py-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all duration-300 transform active:scale-[0.98]",
                    isFasting
                        ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                        : "bg-linear-to-r from-orange-500 to-red-600 shadow-orange-500/30"
                )}
            >
                {isFasting ? "Quebrar Jejum" : "Iniciar Jejum"}
            </button>

            {/* Fase Metabólica Atual (Apenas se estiver jejuando) - Redesign Inteligência */}
            {isFasting && (
                <div className="bg-(--card) rounded-3xl p-5 border border-(--border) relative overflow-hidden shadow-xl animate-fade-in">
                    <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-4">
                        <Activity size={120} className={currentStage.color.replace('text-', '')} />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-purple-500" size={18} />
                        <h3 className="text-xs font-black text-purple-500 uppercase tracking-widest">Inteligência Fisiológica</h3>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                        <div className={cn("p-2 rounded-xl bg-opacity-10 dark:bg-opacity-20", currentStage.color.replace('text-', 'bg-'))}>
                            <Activity className={currentStage.color} size={24} />
                        </div>
                        <p className={cn("text-xl font-black", currentStage.color)}>{currentStage.title}</p>
                    </div>

                    <div className="bg-orange-500/5 dark:bg-white/5 rounded-2xl p-4 border border-orange-500/10 mt-4 relative">
                        <div className="absolute -left-1 top-4 w-2 h-8 bg-orange-500 rounded-r-full"></div>
                        <p className="text-sm font-medium text-(--foreground) leading-relaxed">
                            <span className="font-bold text-orange-500">I.A. Analisa: </span>
                            {currentStage.description}. O seu corpo está respondendo de forma otimizada à ausência de insulina neste momento. Continue firme no caminho da queima! 🔥
                        </p>
                    </div>

                    {/* Timeline Visual (Progresso das Fases) */}
                    <div className="mt-8 mb-6 relative px-4">
                        {/* Linha de fundo */}
                        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1.5 bg-(--border) rounded-full overflow-hidden">
                            {/* Linha de progresso */}
                            <div
                                className="h-full bg-linear-to-r from-orange-500 via-red-500 to-purple-500 transition-all duration-1000 ease-out"
                                style={{
                                    width: `${Math.min(100, (fractionalHours / 24) * 100)}%`
                                }}
                            ></div>
                        </div>

                        {/* Relative container para as bolinhas */}
                        <div className="relative w-full h-8 flex items-center">
                            {[4, 12, 16, 24].map((h) => {
                                const isPast = elapsed.hours >= h;
                                const isCurrent = currentStage.hours === h || (elapsed.hours > h && h === 24);
                                const positionPercent = (h / 24) * 100;

                                return (
                                    <div
                                        key={h}
                                        className="absolute top-1/2 -translate-y-1/2 z-10 flex justify-center"
                                        style={{ left: `calc(${positionPercent}% - 14px)`, width: '28px' }}
                                    >
                                        <div className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 text-[10px] font-black",
                                            isPast
                                                ? "bg-orange-500 border-(--card) text-white shadow-lg shadow-orange-500/50 scale-105"
                                                : "bg-(--card) border-(--border) text-(--muted)",
                                            isCurrent && isPast && "ring-2 ring-orange-500/50 scale-125"
                                        )}>
                                            {h}h
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {currentStage.hours !== nextStage.hours && (
                        <div className="mt-5 pt-4 border-t border-(--border) flex justify-between items-center bg-(--background) -mx-5 -mb-5 px-5 pb-5">
                            <div className="flex flex-col">
                                <p className="text-[10px] font-bold text-(--muted) uppercase tracking-wider mb-1">Evoluirá em</p>
                                <p className="text-sm font-bold text-(--foreground)">{Math.max(0, nextStage.hours - elapsed.hours)}h e {59 - elapsed.minutes}min</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <p className="text-[10px] font-bold text-(--muted) uppercase tracking-wider mb-1">Próximo Nível</p>
                                <p className="text-sm font-black text-(--foreground) opacity-70">{nextStage.title}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Botão de Emergência IA */}
            {isFasting && elapsed.hours >= 10 && (
                <button className="w-full flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl group hover:bg-orange-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-xl">
                            <AlertCircle className="text-orange-500" size={24} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-(--foreground) group-hover:text-orange-500 transition-colors">Está com muita fome?</p>
                            <p className="text-xs text-(--muted)">Fale com a IA para se manter firme.</p>
                        </div>
                    </div>
                    <p className="text-orange-500 font-bold bg-orange-500/10 py-1 px-3 rounded-full">Resgatar 🛟</p>
                </button>
            )}

            {/* Lembretes / Fases Desbloqueadas */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-(--card) rounded-2xl p-4 border border-(--border) relative overflow-hidden flex flex-col justify-between group">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Droplets className="text-blue-500" size={24} />
                            <span className="text-[10px] font-black tracking-wider uppercase text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">
                                {currentWater} / {goalWater}ml
                            </span>
                        </div>
                        <p className="text-sm font-bold text-(--foreground)">Hidratação</p>
                        <p className="text-xs text-(--muted) mt-1 mb-3 leading-tight">Mantenha-se <br />hidratado no jejum!</p>
                    </div>

                    {/* Progress Bar Mini */}
                    <div className="w-full bg-(--background) h-2 rounded-full overflow-hidden mb-3 border border-(--border)">
                        <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${Math.min(100, (currentWater / goalWater) * 100)}%` }}
                        ></div>
                    </div>

                    <button
                        onClick={() => onWaterAdd && onWaterAdd(250)}
                        className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 border border-blue-500/20"
                    >
                        <Droplets size={14} className="fill-blue-500" /> +250ml
                    </button>

                    {/* Alerta de Desidratação */}
                    {isFasting && elapsed.hours >= 4 && currentWater < 500 && (
                        <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                    )}
                </div>
                <div className="bg-(--card) rounded-2xl p-4 border border-(--border) relative overflow-hidden">
                    <Trophy className="text-yellow-500 mb-2" size={24} />
                    <p className="text-sm font-bold text-(--foreground)">Maior Recorde</p>
                    <p className="text-xs text-(--muted) mt-1">{maxRecord > 0 ? `${maxRecord} Horas` : 'Nenhum jejum ainda'}</p>

                    {maxRecord >= 16 && (
                        <div className="absolute top-4 right-4 text-[10px] font-black tracking-widest uppercase bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
                            Elite
                        </div>
                    )}
                </div>
            </div>

            {/* Histórico Visual de Jejuns Recentes */}
            {historyLogs.length > 0 && (
                <div className="bg-(--card) rounded-3xl p-5 border border-(--border) shadow-xl animate-fade-in mt-6">
                    <div className="flex items-center justify-between mb-4 border-b border-(--border) pb-3">
                        <div className="flex items-center gap-2">
                            <History className="text-blue-500" size={20} />
                            <h3 className="text-sm font-bold text-(--foreground) uppercase tracking-wider">Histórico de Queima</h3>
                        </div>
                        <span className="text-xs font-medium bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full">{historyLogs.length}/10 Salvos</span>
                    </div>

                    <div className="space-y-3">
                        {historyLogs.map((record) => (
                            <div key={record.id} className="flex justify-between items-center bg-(--background) p-4 rounded-2xl border border-(--border) hover:border-orange-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                        <Flame className="text-orange-500" size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-bold text-(--foreground)">{new Date(record.startTime).toLocaleDateString()}</p>
                                        <p className="text-[10px] text-(--muted) font-medium uppercase tracking-wider">Meta: {record.goalHours}h</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-orange-500">
                                        {record.durationFormatted ? record.durationFormatted : `${record.durationHours} h`}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-widest text-[#22c55e] font-bold">Concluído</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
