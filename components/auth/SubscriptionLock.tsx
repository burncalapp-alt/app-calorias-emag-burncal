'use client';

import React from 'react';
import { useUserContext } from '@/contexts/UserContext';
import { Lock, ArrowRight, Activity } from 'lucide-react';

export function SubscriptionLock({ children }: { children: React.ReactNode }) {
    const { profile, user } = useUserContext();

    // Se a assinatura for ativa, renderiza o App normalmente
    if (profile.subscription_status === 'active') {
        return <>{children}</>;
    }

    // Se não for ativa (cancelada ou inativa), mostra a tela de bloqueio
    return (
        <div className="flex flex-col min-h-screen bg-[#0d0f14] items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="inline-block p-5 rounded-full bg-red-500/10 mb-6 relative">
                <Lock className="text-red-500 w-12 h-12 relative z-10" />
                <Activity className="absolute inset-0 m-auto text-red-500/20 w-20 h-20 animate-pulse" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">Assinatura Inativa</h1>
            
            <p className="text-gray-400 mb-8 max-w-sm">
                Parece que sua assinatura não está ativa no momento. Para continuar acessando o BurnCal e transformar seu corpo, reative sua conta.
            </p>

            <a 
                href="https://cakto.com.br/SEU-LINK-DE-PAGAMENTO-AQUI" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-sm py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                Renovar Assinatura
                <ArrowRight size={20} />
            </a>

            <div className="mt-8 text-sm text-gray-500">
                <p>O e-mail da sua conta Cakto deve ser o mesmo:</p>
                <p className="font-bold text-gray-300 mt-1">{user?.email}</p>
            </div>
        </div>
    );
}
