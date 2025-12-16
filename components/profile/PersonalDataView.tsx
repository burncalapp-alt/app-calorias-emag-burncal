'use client';

import React, { useState } from 'react';
import { useUserContext, ActivityLevel, Gender } from '@/contexts/UserContext';
import { ChevronLeft, Ruler, Weight, Target, User, Users, Activity, BarChart2, Star, Droplet, X, Check } from 'lucide-react';

interface PersonalDataViewProps {
    onBack: () => void;
}

export function PersonalDataView({ onBack }: PersonalDataViewProps) {
    const { profile, updateProfile, goals } = useUserContext();

    const [editingField, setEditingField] = useState<{ key: string; label: string; type: 'text' | 'number' | 'select'; options?: string[]; suffix?: string } | null>(null);

    const handleSave = (newValue: string) => {
        if (editingField) {
            let updatedValue: any = newValue;

            // Type conversion
            if (editingField.type === 'number') {
                updatedValue = parseFloat(newValue.replace(',', '.'));
            }
            if (editingField.key === 'activityLevel') {
                // Map readable label back to ActivityLevel key if needed, or store formatted.
                // For simplicity, we stored keys in context but show formatted.
                // Let's assume we map back:
                const map: Record<string, ActivityLevel> = {
                    'Sedentário': 'sedentary',
                    'Leve': 'light',
                    'Moderada': 'moderate',
                    'Ativa': 'active',
                    'Muito Ativa': 'very_active'
                };
                updatedValue = map[newValue] || 'moderate';
            }
            if (editingField.key === 'gender') {
                updatedValue = newValue === 'Masculino' ? 'male' : 'female';
            }

            updateProfile({ [editingField.key]: updatedValue });
            setEditingField(null);
        }
    };

    const openEdit = (key: string, label: string, type: 'text' | 'number' | 'select' = 'text', suffix: string = '', options: string[] = []) => {
        setEditingField({ key, label, type, suffix, options });
    };

    // Formatter helpers
    const formatActivity = (level: ActivityLevel) => {
        const map: Record<ActivityLevel, string> = {
            sedentary: 'Sedentário',
            light: 'Leve',
            moderate: 'Moderada',
            active: 'Ativa',
            very_active: 'Muito Ativa'
        };
        return map[level] || level;
    };

    const formatGender = (g: Gender) => g === 'male' ? 'Masculino' : 'Feminino';

    return (
        <div className="flex flex-col h-full bg-[#0f172a] animate-in slide-in-from-right duration-300 relative">
            {/* Header with Back Button */}
            <div className="pt-12 pb-6 px-6 relative flex items-center justify-center">
                <button
                    onClick={onBack}
                    className="absolute left-6 w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center text-white hover:bg-[#253248] transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Dados pessoais</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-6">

                {/* Pessoal Section */}
                <div>
                    <h2 className="text-gray-400 font-medium mb-3 px-2">Pessoal</h2>
                    <div className="bg-[#1e293b] rounded-3xl overflow-hidden">
                        <DataItem icon={Ruler} label="Altura" value={`${profile.height} cm`} onClick={() => openEdit('height', 'Altura', 'number', ' cm')} />
                        <DataItem icon={Weight} label="Peso" value={`${profile.weight} kg`} onClick={() => openEdit('weight', 'Peso', 'number', ' kg')} />
                        <DataItem icon={User} label="Idade" value={`${profile.age} anos`} onClick={() => openEdit('age', 'Idade', 'number')} />
                        <DataItem icon={Users} label="Gênero" value={formatGender(profile.gender)} onClick={() => openEdit('gender', 'Gênero', 'select', '', ['Masculino', 'Feminino'])} />
                        <DataItem icon={Activity} label="Nível de atividade" value={formatActivity(profile.activityLevel)} onClick={() => openEdit('activityLevel', 'Nível de atividade', 'select', '', ['Sedentário', 'Leve', 'Moderada', 'Ativa', 'Muito Ativa'])} />
                    </div>
                </div>

                {/* Macros Section (Read Only for now as they are calculated) */}
                <div>
                    <h2 className="text-gray-400 font-medium mb-3 px-2">Metas Calculadas (Automático)</h2>
                    <div className="bg-[#1e293b] rounded-3xl overflow-hidden">
                        <DataItem icon={Star} label="Calorias Diárias" value={`${goals.dailyCalories} kcal`} onClick={() => { }} />
                        <DataItem icon={Weight} label="Proteínas" value={`${goals.macros.protein} g`} onClick={() => { }} />
                        <DataItem icon={BarChart2} label="Carboidratos" value={`${goals.macros.carbs} g`} onClick={() => { }} />
                        <DataItem icon={Droplet} label="Gorduras" value={`${goals.macros.fat} g`} onClick={() => { }} />
                        <DataItem icon={Droplet} label="Água" value={`${goals.water} ml`} onClick={() => { }} last />
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingField && (
                <EditModal
                    initialValue={String(profile[editingField.key as keyof typeof profile] || '')}
                    field={editingField}
                    onSave={handleSave}
                    onClose={() => setEditingField(null)}
                />
            )}
        </div>
    );
}

function DataItem({ icon: Icon, label, value, onClick, last = false }: { icon: any, label: string, value: string, onClick: () => void, last?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 hover:bg-[#253248] transition-colors ${!last ? 'border-b border-gray-800' : ''}`}
        >
            <div className="flex items-center gap-4">
                <Icon size={20} className="text-gray-300" />
                <span className="text-white">{label}</span>
            </div>
            <span className="text-white font-medium">{value}</span>
        </button>
    );
}

function EditModal({ initialValue, field, onSave, onClose }: { initialValue: string, field: any, onSave: (val: string) => void, onClose: () => void }) {
    const [value, setValue] = useState(initialValue);

    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#1e293b] rounded-t-3xl sm:rounded-3xl p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center text-white">
                    <h3 className="text-lg font-bold">Editar {field.label}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="space-y-4">
                    {field.type === 'select' ? (
                        <div className="space-y-2">
                            {field.options.map((opt: string) => (
                                <button
                                    key={opt}
                                    onClick={() => setValue(opt)}
                                    className={`w-full p-4 rounded-xl text-left font-medium transition-all ${value === opt ? 'bg-orange-500 text-white' : 'bg-[#0f172a] text-gray-300 hover:bg-[#253248]'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            <input
                                type={field.type}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                autoFocus
                                className="w-full bg-[#0f172a] border border-gray-700 rounded-xl p-4 text-white text-lg focus:outline-none focus:border-orange-500 transition-colors"
                            />
                            {field.suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{field.suffix}</span>}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onSave(value)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    <Check size={20} />
                    Salvar
                </button>
            </div>
        </div>
    );
}
