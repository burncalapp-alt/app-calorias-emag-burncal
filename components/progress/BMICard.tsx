'use client';

import React from 'react';

interface BMICardProps {
    weight: number;
    height: number;
}

export function BMICard({ weight, height }: BMICardProps) {
    // Calculate BMI: weight (kg) / height (m)^2
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const bmiValue = bmi.toFixed(1);

    // Calculate position on the scale (range: 15-40)
    const minBMI = 15;
    const maxBMI = 40;
    const position = Math.min(100, Math.max(0, ((bmi - minBMI) / (maxBMI - minBMI)) * 100));

    return (
        <div
            className="rounded-2xl p-5 bg-[var(--card)] shadow-sm"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">IMC</h3>
                    <p className="text-sm text-[var(--muted)]">{weight} kg • {height} cm</p>
                </div>
            </div>

            {/* BMI Value */}
            <p className="text-5xl font-bold text-[var(--foreground)] mb-6">{bmiValue}</p>

            {/* Color Scale */}
            <div className="relative mb-2">
                <div className="flex h-4 rounded-full overflow-hidden">
                    <div className="flex-1" style={{ backgroundColor: '#3b82f6' }} /> {/* Underweight - Blue */}
                    <div className="flex-[1.5]" style={{ backgroundColor: '#22c55e' }} /> {/* Normal - Green */}
                    <div className="flex-[0.8]" style={{ backgroundColor: '#eab308' }} /> {/* Overweight - Yellow */}
                    <div className="flex-1" style={{ backgroundColor: '#ef4444' }} /> {/* Obese - Red */}
                </div>

                {/* Indicator */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white rounded-full shadow-lg transform -translate-x-1/2"
                    style={{
                        left: `${position}%`,
                        boxShadow: '0 0 6px rgba(0,0,0,0.3)'
                    }}
                />
            </div>

            {/* Labels */}
            <div className="flex justify-between text-xs text-[var(--muted)] mt-2">
                <span>Abaixo<br />do peso</span>
                <span>Normal</span>
                <span>Sobrepeso</span>
                <span>Obesidade</span>
            </div>
        </div>
    );
}
