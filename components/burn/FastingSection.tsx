'use client';

import React, { useState, useEffect } from 'react';
import { Play, Square, Timer, Loader2 } from 'lucide-react';
import { useUserContext } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabaseClient';

export function FastingSection() {
    const { user } = useUserContext();
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(16 * 60 * 60);
    const [protocol, setProtocol] = useState('16:8');
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch Active Session on Mount
    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const checkActiveFasting = async () => {
            try {
                const { data, error } = await supabase
                    .from('fasting_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .eq('status', 'active')
                    .maybeSingle();

                if (data) {
                    // Resuming existing fast
                    const end = new Date(data.end_time);
                    setEndTime(end);
                    setProtocol(data.protocol);
                    setSessionId(data.id);
                    setIsActive(true);

                    // Calculate remaining
                    const now = new Date();
                    const diffSeconds = Math.floor((end.getTime() - now.getTime()) / 1000);
                    setTimeLeft(Math.max(0, diffSeconds));
                }
            } catch (error) {
                console.error('Error checking fasting:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkActiveFasting();
    }, [user]);

    // 2. Timer Loop (only if active)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && endTime) {
            interval = setInterval(() => {
                const now = new Date();
                const diff = Math.floor((endTime.getTime() - now.getTime()) / 1000);
                if (diff <= 0) {
                    setTimeLeft(0);
                    // Optionally mark as completed automatically? 
                    // For now let user click stop to "Finish"
                } else {
                    setTimeLeft(diff);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, endTime]);

    const handleStart = async () => {
        if (!user) return;

        // Calculate End Time
        const [hours] = protocol.split(':').map(Number); // '16:8' -> 16
        const now = new Date();
        const end = new Date(now.getTime() + hours * 60 * 60 * 1000);

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('fasting_sessions')
                .insert({
                    user_id: user.id,
                    start_time: now.toISOString(),
                    end_time: end.toISOString(),
                    protocol: protocol,
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setSessionId(data.id);
                setEndTime(end);
                setIsActive(true);
                setTimeLeft(hours * 60 * 60);
            }
        } catch (error) {
            console.error('Error starting fast:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStop = async () => {
        if (!sessionId) return;

        try {
            setIsLoading(true);
            const { error } = await supabase
                .from('fasting_sessions')
                .update({ status: 'completed' }) // or 'cancelled' if timeLeft > 0? Let's simplify to completed/stopped
                .eq('id', sessionId);

            if (error) throw error;

            // Reset state
            setIsActive(false);
            setEndTime(null);
            setSessionId(null);
            // Time left resets to protocol default
            const [hours] = protocol.split(':').map(Number);
            setTimeLeft(hours * 60 * 60);

        } catch (error) {
            console.error('Error stopping fast:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">

            {/* Timer Card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
                {/* Progress Circle Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="w-64 h-64 rounded-full border-[20px] border-green-500" />
                </div>

                {isLoading && (
                    <div className="absolute inset-0 bg-[#1e293b]/80 z-20 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="animate-spin text-green-500" size={32} />
                    </div>
                )}

                <div className="relative z-10 text-center space-y-2">
                    <span className="text-[var(--muted)] text-sm font-medium tracking-wider uppercase">
                        {isActive ? 'Tempo Restante' : 'Pronto para começar?'}
                    </span>
                    <div className="text-5xl font-bold text-[var(--foreground)] font-mono tracking-wider">
                        {formatTime(timeLeft)}
                    </div>
                    <p className="text-green-500 font-medium">Protocolo {protocol}</p>

                    {isActive && endTime && (
                        <p className="text-xs text-gray-500 mt-2">
                            Termina às {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </div>

                <div className="mt-8 flex gap-4">
                    <button
                        onClick={isActive ? handleStop : handleStart}
                        disabled={isLoading}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isActive
                            ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                            : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20'
                            }`}
                    >
                        {isActive ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>
                </div>
            </div>

            {/* Protocols */}
            {!isActive && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-[var(--foreground)] font-bold mb-4 flex items-center gap-2">
                        <Timer size={20} className="text-green-500" />
                        Escolha seu Protocolo
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {['16:8', '18:6', '20:4', '24h'].map(p => (
                            <button
                                key={p}
                                onClick={() => {
                                    setProtocol(p);
                                    // Reset display time
                                    const h = p === '24h' ? 24 : parseInt(p);
                                    setTimeLeft(h * 60 * 60);
                                }}
                                className={`p-4 rounded-2xl border transition-all text-left ${protocol === p
                                    ? 'bg-green-500/10 border-green-500'
                                    : 'bg-[var(--card)] border-[var(--border)] hover:border-gray-500'
                                    }`}
                            >
                                <span className={`block font-bold text-lg ${protocol === p ? 'text-green-500' : 'text-[var(--foreground)]'}`}>{p}</span>
                                <span className="text-xs text-[var(--muted)]">Jejum / Janela</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isActive && (
                <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-center animate-in fade-in">
                    <p className="text-green-400 text-sm">
                        Você está em jejum! Lembre-se de beber água. 💧
                    </p>
                </div>
            )}

        </div>
    );
}
