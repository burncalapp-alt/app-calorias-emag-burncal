'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password
                });
                if (error) throw error;
                // For simplified flow, we might auto-login or show message
                alert('Conta criada! Verifique seu email ou faça login.');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao autenticar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0d0f14] items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-full bg-orange-500/10 mb-4 animate-bounce-slow">
                    <span className="text-5xl">🔥</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">BurnCal</h1>
                <p className="text-gray-400">Transforme calorias em resultados.</p>
            </div>

            <div className="w-full max-w-sm bg-[#1e293b] rounded-3xl p-8 border border-gray-800 shadow-2xl">
                <div className="flex gap-4 mb-8 bg-[#0f172a] p-1 rounded-xl">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Criar Conta
                    </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#0f172a] border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#0f172a] border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                {isLogin ? 'Entrar' : 'Começar Agora'}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
                        Esqueceu sua senha?
                    </button>
                </div>
            </div>
        </div>
    );
}
