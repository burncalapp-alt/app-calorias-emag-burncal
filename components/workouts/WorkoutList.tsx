'use client';

import React from 'react';
import { Play, Clock, Flame } from 'lucide-react';

interface Workout {
    id: string;
    title: string;
    duration: string;
    calories: number;
    color: string;
}

export function WorkoutList() {
    const workouts: Workout[] = [
        { id: '1', title: 'Leg Day - Glúteos', duration: '45 min', calories: 320, color: '#ef4444' },
        { id: '2', title: 'Core Strength', duration: '30 min', calories: 180, color: '#f59e0b' },
        { id: '3', title: 'Upper Body', duration: '40 min', calories: 250, color: '#3b82f6' },
        { id: '4', title: 'HIIT Cardio', duration: '25 min', calories: 400, color: '#22c55e' },
        { id: '5', title: 'Yoga & Relaxamento', duration: '35 min', calories: 120, color: '#8b5cf6' },
    ];

    return (
        <div className="space-y-4 pb-24">
            {/* Hero Banner */}
            <div
                className="rounded-2xl p-6 mb-6 card-hover animate-fade-in cursor-pointer"
                style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)'
                }}
            >
                <h2 className="text-2xl font-bold text-white mb-1">Treino do Dia</h2>
                <p className="text-white/80 text-sm mb-4">Mantenha a consistência!</p>
                <button className="bg-white text-green-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg 
          transition-all duration-200 ease-out
          hover:shadow-xl hover:scale-105 hover:bg-gray-100
          active:scale-95">
                    Começar Agora
                </button>
            </div>

            <h3 className="text-lg font-semibold text-white mb-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
                Treinos Disponíveis
            </h3>

            {/* Workout Cards */}
            {workouts.map((workout, index) => (
                <div
                    key={workout.id}
                    className="flex gap-4 p-4 rounded-xl cursor-pointer card-hover animate-fade-in"
                    style={{
                        backgroundColor: '#1a1d24',
                        animationDelay: `${(index + 2) * 100}ms`
                    }}
                >
                    {/* Icon */}
                    <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0
              transition-all duration-200 hover:scale-110"
                        style={{ backgroundColor: `${workout.color}20` }}
                    >
                        <Play
                            size={28}
                            style={{ color: workout.color }}
                            fill={workout.color}
                            className="transition-transform duration-200"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-white font-semibold mb-1">{workout.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1 transition-colors hover:text-gray-300">
                                <Clock size={12} />
                                {workout.duration}
                            </span>
                            <span className="flex items-center gap-1 transition-colors hover:text-orange-400">
                                <Flame size={12} />
                                {workout.calories} kcal
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
