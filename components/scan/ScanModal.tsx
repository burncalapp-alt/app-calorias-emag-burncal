'use client';

import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUserContext } from '@/contexts/UserContext';
import { Camera, Image as ImageIcon, PenLine, X, Droplet, Check, RefreshCcw, Mic, Beef, Wheat, Flame, Loader2 } from 'lucide-react';

interface ScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onWaterAdd: (amount: number) => void;
    onMealAdd?: (meal: any) => void;
}

type ScanStep = 'menu' | 'describe' | 'analyzing' | 'result';

export function ScanModal({ isOpen, onClose, onWaterAdd, onMealAdd }: ScanModalProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [step, setStep] = React.useState<ScanStep>('menu');
    const [description, setDescription] = React.useState('');
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [scannedFood, setScannedFood] = React.useState<any | null>(null);
    const [uploading, setUploading] = React.useState(false);
    const [imageBlob, setImageBlob] = React.useState<Blob | null>(null);
    const { user } = useUserContext();

    React.useEffect(() => {
        if (!isOpen) {
            setStep('menu');
            setDescription('');
            setPreviewUrl(null);
            setScannedFood(null);
            setImageBlob(null);
            setUploading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const waterOptions = [100, 150, 200, 500];

    const handleCameraClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute('capture', 'environment');
            fileInputRef.current.click();
        }
    };

    const handleLibraryClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.removeAttribute('capture');
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setStep('describe');
        }
    };

    const handleRetake = () => {
        setPreviewUrl(null);
        setDescription('');
        setStep('menu');
    };

    const handleAnalyze = async () => {
        setStep('analyzing');

        try {
            // Convert image to base64 with resizing
            let imageBase64 = '';
            if (previewUrl) {
                imageBase64 = await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = async () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        // Resize to max 800px dimension
                        const maxDim = 800;
                        if (width > maxDim || height > maxDim) {
                            if (width > height) {
                                height = (height * maxDim) / width;
                                width = maxDim;
                            } else {
                                width = (width * maxDim) / height;
                                height = maxDim;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);

                        // Compress to JPEG with 0.7 quality
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                        // Convert to Blob for upload
                        const res = await fetch(dataUrl);
                        const blob = await res.blob();
                        setImageBlob(blob);

                        resolve(dataUrl.split(',')[1]); // Remove "data:image/jpeg;base64," prefix
                    };
                    img.src = previewUrl;
                });
            }

            const apiResponse = await fetch('/api/ai/analyze-food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64,
                    description
                })
            });

            const data = await apiResponse.json();

            if (data.error) {
                console.error('AI Error:', data.error);
                // Fallback to manual entry if AI fails
                setScannedFood({
                    title: description || 'Alimento não identificado',
                    calories: 0,
                    weight: 100,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    fiber: 0,
                    sodium: 0,
                    image: previewUrl
                });
            } else {
                setScannedFood({
                    title: data.name || description || 'Alimento',
                    calories: data.calories || 0,
                    weight: data.weight || 100,
                    protein: data.protein || 0,
                    carbs: data.carbs || 0,
                    fat: data.fat || 0,
                    fiber: data.fiber || 0,
                    sodium: data.sodium || 0,
                    image: previewUrl,
                    confidence: data.confidence,
                    judgmentBadge: data.judgmentBadge,
                    mealNarrative: data.mealNarrative,
                    caloriePhrase: data.caloriePhrase
                });
            }
            setStep('result');
        } catch (error) {
            console.error('Error analyzing food:', error);
            // Fallback on error
            setScannedFood({
                title: description || 'Erro na análise',
                calories: 0,
                weight: 100,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0,
                sodium: 0,
                image: previewUrl
            });
            setStep('result');
        }
    };

    const handleConfirmMeal = async () => {
        if (!onMealAdd || !scannedFood) return;

        let finalImageUrl = scannedFood.image;

        if (imageBlob && user) {
            setUploading(true);
            try {
                const filename = `${user.id}/${Date.now()}.jpg`;
                const { data, error } = await supabase.storage
                    .from('meal_photos')
                    .upload(filename, imageBlob, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                if (error) {
                    console.error('Upload error:', error);
                    // Continue with local URL as fallback, but warn?
                } else if (data) {
                    const { data: publicUrlData } = supabase.storage
                        .from('meal_photos')
                        .getPublicUrl(filename);

                    finalImageUrl = publicUrlData.publicUrl;
                }
            } catch (err) {
                console.error('Upload exception:', err);
            } finally {
                setUploading(false);
            }
        }

        onMealAdd({
            ...scannedFood,
            image: finalImageUrl
        });
        onClose();
    };

    // Helper function for badge color styles
    const getBadgeStyles = (color?: string) => {
        switch (color) {
            case 'green':
                return 'bg-green-500/20 border-green-500 text-green-400';
            case 'yellow':
                return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
            case 'orange':
                return 'bg-orange-500/20 border-orange-500 text-orange-400';
            default:
                return 'bg-gray-500/20 border-gray-500 text-gray-400';
        }
    };

    // Full Screen Modal for describe/analyzing/result
    if (step !== 'menu') {
        return (
            <div className="fixed inset-0 z-[60] bg-[#0d0f14] flex flex-col animate-in fade-in duration-200">
                {/* Header with Logo and Close Button */}
                <div className="p-4 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    {/* App Logo */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                        <img
                            src="/icons/icon-192.png"
                            alt="BurnCal Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center px-6 overflow-y-auto">
                    {/* Image Preview */}
                    <div className="relative w-40 h-40 mb-8">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/20 to-transparent"></div>
                        {previewUrl && (
                            <img
                                src={previewUrl}
                                alt="Food preview"
                                className="w-full h-full object-cover rounded-full border-4 border-gray-800 shadow-2xl"
                            />
                        )}
                        {step === 'analyzing' && (
                            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                        )}
                    </div>

                    {/* DESCRIBE STEP */}
                    {step === 'describe' && (
                        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h2 className="text-lg font-semibold text-white">Descrição do prato</h2>

                            <div className="relative">
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Peso, composição e método de preparo ajudarão a determinar o valor nutricional..."
                                    className="w-full h-24 p-4 pr-12 bg-transparent border-2 border-orange-500/50 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-orange-500 transition-colors"
                                />
                                <button
                                    onClick={() => {
                                        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                                            const startRecognition = () => {
                                                const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                                                const recognition = new SpeechRecognition();
                                                recognition.lang = 'pt-BR';
                                                recognition.start();

                                                const btn = document.getElementById('mic-btn');
                                                if (btn) btn.classList.add('text-orange-500', 'animate-pulse');

                                                recognition.onresult = (event: any) => {
                                                    const transcript = event.results[0][0].transcript;
                                                    setDescription(prev => prev + (prev ? ' ' : '') + transcript);
                                                    if (btn) btn.classList.remove('text-orange-500', 'animate-pulse');
                                                };

                                                recognition.onerror = (event: any) => {
                                                    console.error("Speech Recognition Error:", event.error);
                                                    if (btn) btn.classList.remove('text-orange-500', 'animate-pulse');
                                                    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                                                        alert('Permissão de microfone negada. Verifique as configurações do seu navegador.');
                                                    }
                                                };

                                                recognition.onend = () => {
                                                    if (btn) btn.classList.remove('text-orange-500', 'animate-pulse');
                                                };
                                            };

                                            // Request microphone access first to "wake up" the permission prompt on mobile PWAs
                                            navigator.mediaDevices.getUserMedia({ audio: true })
                                                .then((stream) => {
                                                    // Stop the stream immediately, we just needed the permission/wake-up
                                                    stream.getTracks().forEach(track => track.stop());
                                                    startRecognition();
                                                })
                                                .catch((err) => {
                                                    console.error("Microphone permission denied:", err);
                                                    alert('Não foi possível acessar o microfone. Verifique se você deu permissão ao site.');
                                                });

                                        } else {
                                            alert('Seu navegador não suporta reconhecimento de voz.');
                                        }
                                    }}
                                    id="mic-btn"
                                    className="absolute right-3 bottom-3 p-2 text-gray-500 hover:text-orange-500 transition-colors"
                                >
                                    <Mic size={20} />
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleRetake}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-all active:scale-95"
                                >
                                    <RefreshCcw size={18} />
                                    Tirar novamente
                                </button>
                                <button
                                    onClick={handleAnalyze}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                                >
                                    <Check size={18} />
                                    Analisar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ANALYZING STEP */}
                    {step === 'analyzing' && (
                        <div className="text-center space-y-4 animate-pulse">
                            <p className="text-lg text-gray-300 font-medium">Analisando...</p>
                            <p className="text-sm text-gray-500">Identificando ingredientes e calculando nutrientes</p>
                        </div>
                    )}

                    {/* RESULT STEP */}
                    {step === 'result' && scannedFood && (
                        <div className="w-full max-w-md text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Judgment Badge */}
                            {scannedFood.judgmentBadge && (
                                <div className="flex justify-center animate-in zoom-in duration-300" style={{ animationDelay: '100ms' }}>
                                    <div className={`px-4 py-1.5 rounded-full border font-semibold text-sm ${getBadgeStyles(scannedFood.judgmentBadge.color)}`}>
                                        {scannedFood.judgmentBadge.text}
                                    </div>
                                </div>
                            )}

                            {/* Meal Narrative */}
                            {scannedFood.mealNarrative && (
                                <p className="text-sm text-gray-400 italic animate-in fade-in duration-300" style={{ animationDelay: '200ms' }}>
                                    {scannedFood.mealNarrative}
                                </p>
                            )}

                            {/* Food Name */}
                            <div className="animate-in fade-in duration-300" style={{ animationDelay: '300ms' }}>
                                <h2 className="text-2xl font-bold text-white leading-tight">{scannedFood.title}</h2>
                                {scannedFood.confidence && (
                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <div className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium flex items-center gap-1">
                                            <Check size={12} />
                                            {Math.round(scannedFood.confidence * 100)}% de assertividade
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Calories */}
                            <div className="space-y-1 animate-in fade-in duration-300" style={{ animationDelay: '400ms' }}>
                                <p className="text-3xl font-bold text-orange-500">{scannedFood.calories} calorias</p>
                                <p className="text-gray-400">{scannedFood.weight} g</p>
                            </div>

                            {/* Macro Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#1a1d24] rounded-2xl p-4 flex flex-col items-center gap-2 border border-gray-800">
                                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <Beef size={24} className="text-red-400" />
                                    </div>
                                    <span className="text-sm text-gray-400">Proteínas</span>
                                    <span className="text-white font-bold">{scannedFood.protein} g</span>
                                </div>
                                <div className="bg-[#1a1d24] rounded-2xl p-4 flex flex-col items-center gap-2 border border-gray-800">
                                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                                        <Wheat size={24} className="text-green-400" />
                                    </div>
                                    <span className="text-sm text-gray-400">Carboidratos</span>
                                    <span className="text-white font-bold">{scannedFood.carbs} g</span>
                                </div>
                                <div className="bg-[#1a1d24] rounded-2xl p-4 flex flex-col items-center gap-2 border border-gray-800">
                                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                                        <Flame size={24} className="text-orange-400" />
                                    </div>
                                    <span className="text-sm text-gray-400">Gorduras</span>
                                    <span className="text-white font-bold">{scannedFood.fat} g</span>
                                </div>
                                <div className="bg-[#1a1d24] rounded-2xl p-4 flex flex-col items-center gap-2 border border-gray-800">
                                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Wheat size={24} className="text-green-400" />
                                    </div>
                                    <span className="text-sm text-gray-400">Fibras</span>
                                    <span className="text-white font-bold">{scannedFood.fiber} g</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Action */}
                {step === 'result' && (
                    <div className="p-6 pb-10 animate-in fade-in slide-in-from-bottom duration-300">
                        <button
                            onClick={handleConfirmMeal}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Check size={20} />
                                    Adicionar ao diário
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // MENU STEP (Bottom Sheet)
    return (
        <div className="fixed inset-0 z-[60]">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            <div
                className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-6 pb-10 animate-slide-up"
                style={{ backgroundColor: '#1a1d24' }}
            >
                <div className="w-10 h-1 rounded-full bg-gray-600 mx-auto mb-6" />

                <div className="space-y-2 mb-6">
                    <button
                        onClick={handleCameraClick}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-all active:scale-98 animate-fade-in"
                        style={{ animationDelay: '100ms' }}
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Camera size={20} className="text-blue-400" />
                        </div>
                        <span className="text-white font-medium">Escanear comida</span>
                    </button>

                    <button
                        onClick={handleLibraryClick}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-all active:scale-98 animate-fade-in"
                        style={{ animationDelay: '200ms' }}
                    >
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <ImageIcon size={20} className="text-purple-400" />
                        </div>
                        <span className="text-white font-medium">Escolher da biblioteca</span>
                    </button>

                    <button
                        onClick={() => setStep('describe')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-all active:scale-98 animate-fade-in"
                        style={{ animationDelay: '300ms' }}
                    >
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <PenLine size={20} className="text-orange-400" />
                        </div>
                        <span className="text-white font-medium">Descrever comida</span>
                    </button>
                </div>

                <div className="mt-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <h4 className="text-sm text-gray-400 mb-3">Ingestão de água</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {waterOptions.map((amount) => (
                            <button
                                key={amount}
                                onClick={() => {
                                    onWaterAdd(amount);
                                    onClose();
                                }}
                                className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Droplet size={18} className="text-sky-400" fill="currentColor" />
                                <span className="text-sky-400 font-medium">{amount} ml</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
