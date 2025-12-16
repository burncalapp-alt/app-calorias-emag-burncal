'use client';

import React, { useState, useEffect } from 'react';
import { useUserContext } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
    User, Bell, Moon, Sun, ChevronRight, LogOut,
    Mail, Lock, ShieldCheck, Download, ArrowLeft
} from 'lucide-react';
import { PersonalDataView } from './PersonalDataView';

type ProfileView = 'profile' | 'personal-data' | 'privacy' | 'terms' | 'install-guide';

export function ProfileTab() {
    const { signOut } = useUserContext();
    const { theme, toggleTheme } = useTheme();
    const [currentView, setCurrentView] = useState<ProfileView>('profile');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }
    }, []);

    const toggleNotifications = async () => {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            setNotificationsEnabled(true);
        } else {
            const permission = await Notification.requestPermission();
            setNotificationsEnabled(permission === 'granted');
        }
    };

    const handleSupportClick = () => {
        window.location.href = 'mailto:burncalapp@gmail.com';
    };

    if (currentView === 'personal-data') {
        return <PersonalDataView onBack={() => setCurrentView('profile')} />;
    }

    if (currentView === 'privacy') {
        return (
            <div className="flex flex-col h-full bg-[var(--background)] animate-in fade-in duration-300">
                <div className="pt-12 pb-6 px-6 flex items-center gap-4">
                    <button onClick={() => setCurrentView('profile')} className="p-2 -ml-2 hover:bg-[var(--card-hover)] rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-[var(--foreground)]" />
                    </button>
                    <h1 className="text-xl font-bold text-[var(--foreground)]">Política de Privacidade</h1>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <div className="bg-[var(--card)] rounded-3xl p-6 text-[var(--foreground)] shadow-sm">
                        <p className="leading-relaxed">
                            Seus dados são seguros. Levamos a privacidade a sério e garantimos que suas informações pessoais sejam protegidas e utilizadas apenas para melhorar sua experiência no aplicativo.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (currentView === 'terms') {
        return (
            <div className="flex flex-col h-full bg-[var(--background)] animate-in fade-in duration-300">
                <div className="pt-12 pb-6 px-6 flex items-center gap-4">
                    <button onClick={() => setCurrentView('profile')} className="p-2 -ml-2 hover:bg-[var(--card-hover)] rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-[var(--foreground)]" />
                    </button>
                    <h1 className="text-xl font-bold text-[var(--foreground)]">Termos de Uso</h1>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <div className="bg-[var(--card)] rounded-3xl p-6 text-[var(--foreground)] shadow-sm">
                        <p className="leading-relaxed whitespace-pre-line">
                            Bem-vindo ao BurnCal. Ao usar nosso aplicativo, você concorda com os seguintes termos:

                            1. Uso do Serviço
                            O BurnCal é uma ferramenta de auxílio para monitoramento de saúde e fitness. Os resultados podem variar de pessoa para pessoa.

                            2. Responsabilidade
                            Recomendamos consultar um profissional de saúde antes de iniciar qualquer dieta ou rotina de exercícios. O uso das informações fornecidas é de sua total responsabilidade.

                            3. Conta do Usuário
                            Você é responsável por manter a confidencialidade de sua conta e senha.

                            Estes termos podem ser atualizados periodicamente para refletir mudanças em nossos serviços.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (currentView === 'install-guide') {
        return (
            <div className="flex flex-col h-full bg-[var(--background)] animate-in fade-in duration-300">
                <div className="pt-12 pb-6 px-6 flex items-center gap-4">
                    <button onClick={() => setCurrentView('profile')} className="p-2 -ml-2 hover:bg-[var(--card-hover)] rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-[var(--foreground)]" />
                    </button>
                    <h1 className="text-xl font-bold text-[var(--foreground)]">Adicionar à Tela Inicial</h1>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <div className="bg-[var(--card)] rounded-3xl p-6 space-y-4 shadow-sm">
                        <p className="text-[var(--foreground)] font-medium text-lg">Passo a passo:</p>
                        <ol className="space-y-4 text-[var(--muted)] list-decimal list-inside">
                            <li className="leading-relaxed">
                                No navegador (Google Chrome, Safari, etc.) onde você está acessando o app, clique no ícone de <span className="text-[var(--foreground)] font-medium">Compartilhar</span> ou no menu de opções (três pontinhos).
                            </li>
                            <li className="leading-relaxed">
                                Encontre a opção <span className="text-[var(--foreground)] font-medium">"Adicionar à Tela de Início"</span>.
                            </li>
                            <li className="leading-relaxed">
                                Confirme a ação. Assim o app estará acessível diretamente da sua tela de início como um aplicativo nativo.
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[var(--background)] animate-in fade-in duration-300">
            {/* Header */}
            <div className="pt-12 pb-6 px-6 text-center">
                <h1 className="text-xl font-bold text-[var(--foreground)]">Perfil</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-6">

                {/* Personal Data Card */}
                <button
                    onClick={() => setCurrentView('personal-data')}
                    className="w-full bg-[var(--card)] rounded-3xl p-4 flex items-center gap-4 hover:bg-[var(--card-hover)] transition-colors shadow-sm"
                >
                    <div className="w-12 h-12 rounded-full border-2 border-[var(--border)] flex items-center justify-center">
                        <User size={24} className="text-[var(--foreground)]" />
                    </div>
                    <span className="flex-1 text-left text-lg font-medium text-[var(--foreground)]">Dados pessoais</span>
                    <ChevronRight size={20} className="text-[var(--muted)]" />
                </button>

                {/* Preferences Section */}
                <div>
                    <h2 className="text-[var(--muted)] font-medium mb-3 px-2">Preferências</h2>
                    <div className="bg-[var(--card)] rounded-3xl overflow-hidden shadow-sm">

                        <div className="w-full flex items-center gap-4 p-4 border-b border-[var(--border)]">
                            <Bell size={22} className="text-[var(--muted)]" />
                            <span className="flex-1 text-left text-[var(--foreground)]">Notificações</span>
                            <button
                                onClick={toggleNotifications}
                                className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="w-full flex items-center gap-4 p-4">
                            {theme === 'dark' ? <Moon size={22} className="text-[var(--muted)]" /> : <Sun size={22} className="text-[var(--muted)]" />}
                            <span className="flex-1 text-left text-[var(--foreground)]">Tema Escuro</span>
                            <button
                                onClick={toggleTheme}
                                className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-indigo-500' : 'bg-gray-300'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                    </div>
                </div>

                {/* New Outro Section */}
                <div>
                    <h2 className="text-[var(--muted)] font-medium mb-3 px-2">Outro</h2>
                    <div className="bg-[var(--card)] rounded-3xl overflow-hidden shadow-sm">
                        <SettingsItem
                            icon={Mail}
                            label="Suporte | Sugestões | Ajuda"
                            onClick={handleSupportClick}
                        />
                        <SettingsItem
                            icon={Lock}
                            label="Política de privacidade"
                            onClick={() => setCurrentView('privacy')}
                        />
                        <SettingsItem
                            icon={Download}
                            label="Adicionar App a Tela Inicial"
                            onClick={() => setCurrentView('install-guide')}
                        />
                        <SettingsItem
                            icon={ShieldCheck}
                            label="Termos de uso"
                            last
                            onClick={() => setCurrentView('terms')}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={signOut}
                        className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut size={20} />
                        Sair da Conta
                    </button>
                    <p className="text-center text-[var(--muted)] text-xs mt-4">
                        BurnCal v1.0.1
                    </p>
                </div>

            </div>
        </div>
    );
}

function SettingsItem({ icon: Icon, label, last = false, onClick }: { icon: any, label: string, last?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 p-4 hover:bg-[var(--card-hover)] transition-colors ${!last ? 'border-b border-[var(--border)]' : ''}`}
        >
            <Icon size={22} className="text-[var(--muted)]" />
            <span className="flex-1 text-left text-[var(--foreground)]">{label}</span>
            <ChevronRight size={18} className="text-[var(--muted)]/50" />
        </button>
    );
}
