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
                try {
                    imageBase64 = await new Promise((resolve, reject) => {
                        const img = new Image();

                        // Set a safety timeout for image loading
                        const timer = setTimeout(() => {
                            reject(new Error("Image load timeout"));
                        }, 8000);

                        img.onload = async () => {
                            clearTimeout(timer);
                            try {
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
                            } catch (err) {
                                reject(err);
                            }
                        };

                        img.onerror = (e) => {
                            clearTimeout(timer);
                            reject(new Error("Image load failed"));
                        };

                        img.src = previewUrl;
                    });
                } catch (imgError) {
                    console.error("Image processing failed:", imgError);
                }
            }

            // Create an abort controller for the fetch timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

            const apiResponse = await fetch('/api/ai/analyze-food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64,
                    description
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

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
                    if (error.message.includes('Bucket not found')) {
                        alert('ERRO DE CONFIGURAÇÃO: O bucket de armazenamento "meal_photos" não foi encontrado no Supabase.\n\nPor favor, execute o script "create_burn_tables.sql" no Editor SQL do Supabase para corrigir isso.');
                    }
                    // Continue with local URL as fallback
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
            <div className="fixed inset-0 z-[60] bg-[var(--background)] flex flex-col animate-in fade-in duration-200">
                {/* Header with Logo and Close Button */}
                <div className="p-4 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    {/* App Logo with Name */}
                    <div className="flex items-center gap-2">
                        <Flame size={28} className="text-orange-500 fill-orange-500" />
                        <span className="text-orange-600 font-bold text-lg">BurnCal</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center px-6 overflow-y-auto">


                    {/* DESCRIBE STEP */}
                    {step === 'describe' && (
                        <div className="w-full max-w-md space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {previewUrl && (
                                <div className="w-full h-40 rounded-2xl overflow-hidden shadow-md border border-[var(--border)]">
                                    <img
                                        src={previewUrl}
                                        className="w-full h-full object-cover"
                                        alt="Preview"
                                    />
                                </div>
                            )}
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">Descrição do prato</h2>

                            <div className="relative">
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}

                                    placeholder="Peso, composição e método de preparo ajudarão a determinar o valor nutricional..."
                                    className="w-full h-24 p-4 pr-12 bg-transparent border-2 border-orange-500/50 rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] resize-none focus:outline-none focus:border-orange-500 transition-colors"
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
                                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-[var(--card)] text-[var(--foreground)] border font-medium hover:bg-[var(--card-hover)] transition-all active:scale-95"
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
                    {/* ANALYZING STEP */}
                    {step === 'analyzing' && (
                        <div className="w-full flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
                            <div className="relative w-64 h-64">
                                {/* Image being analyzed */}
                                <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-orange-500/20 shadow-2xl">
                                    {previewUrl && (
                                        <img
                                            src={previewUrl}
                                            className="w-full h-full object-cover"
                                            alt="Analyzing"
                                        />
                                    )}
                                    {/* Scanning Line Animation */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/50 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
                                </div>

                                {/* Orbiting rings */}
                                <div className="absolute inset-0 rounded-full border border-orange-500/30 animate-[spin_4s_linear_infinite]" />
                                <div className="absolute -inset-4 rounded-full border border-dashed border-orange-500/20 animate-[spin_8s_linear_infinite_reverse]" />

                                {/* AI Badge */}
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-orange-500 rounded-full shadow-lg flex items-center gap-2 animate-bounce-soft">
                                    <span className="text-xl">✨</span>
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">AI BurnCal</span>
                                </div>
                            </div>

                            <div className="text-center space-y-3 max-w-xs mx-auto">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent animate-pulse">
                                    Analisando sua refeição...
                                </h3>
                                <p className="text-sm text-[var(--muted)]">
                                    Nossa IA está identificando ingredientes e calculando macros.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* RESULT STEP - Influencer-Optimized Layout */}
                    {step === 'result' && scannedFood && (
                        <div className="w-full flex-1 flex flex-col animate-in fade-in duration-300">
                            {/* Hero Image Section with Overlay */}
                            <div className="relative w-full aspect-square max-h-[32vh] overflow-hidden rounded-3xl shadow-2xl mb-3">
                                {previewUrl && (
                                    <img
                                        src={previewUrl}
                                        alt="Food preview"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {/* Floating Badge on Image */}
                                {scannedFood.judgmentBadge && (
                                    <div className="absolute top-4 left-4">
                                        <div className={`px-3 py-1.5 rounded-full border-2 font-bold text-sm backdrop-blur-sm shadow-lg ${scannedFood.judgmentBadge.color === 'green' ? 'bg-green-500/30 border-green-400 text-green-300' :
                                            scannedFood.judgmentBadge.color === 'yellow' ? 'bg-yellow-500/30 border-yellow-400 text-yellow-300' :
                                                'bg-orange-500/30 border-orange-400 text-orange-300'
                                            }`}>
                                            {scannedFood.judgmentBadge.text}
                                        </div>
                                    </div>
                                )}

                                {/* Food Name on Image Bottom */}
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <h2 className="text-xl font-black text-white drop-shadow-lg leading-tight">
                                        {scannedFood.title}
                                    </h2>
                                    {scannedFood.mealNarrative && (
                                        <p className="text-white/80 text-sm mt-1 drop-shadow">{scannedFood.mealNarrative}</p>
                                    )}
                                </div>
                            </div>

                            {/* Compact Info Card */}
                            <div className="bg-[var(--card)] rounded-2xl p-3 border border-[var(--border)] shadow-lg">
                                {/* Calories & Weight Row */}
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-sm text-[var(--muted)] uppercase tracking-wider font-semibold">Calorias</p>
                                        <p className="text-4xl font-black text-orange-500">{scannedFood.calories}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm text-[var(--muted)] uppercase tracking-wider font-semibold">Porção</p>
                                        <p className="text-2xl font-bold text-[var(--foreground)]">{scannedFood.weight}g</p>
                                    </div>
                                    {scannedFood.confidence && (
                                        <div className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-600 text-xs font-bold flex items-center gap-1">
                                            <Check size={12} />
                                            {Math.round(scannedFood.confidence * 100)}%
                                        </div>
                                    )}
                                </div>

                                {/* Macros Grid - 2x2 Layout */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 flex flex-col items-center gap-1.5">
                                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <Beef size={24} className="text-red-500" />
                                        </div>
                                        <p className="text-xs text-[var(--muted)]">Proteínas</p>
                                        <p className="font-black text-[var(--foreground)] text-lg">{scannedFood.protein} g</p>
                                    </div>
                                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 flex flex-col items-center gap-1.5">
                                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <Wheat size={24} className="text-green-500" />
                                        </div>
                                        <p className="text-xs text-[var(--muted)]">Carboidratos</p>
                                        <p className="font-black text-[var(--foreground)] text-lg">{scannedFood.carbs} g</p>
                                    </div>
                                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 flex flex-col items-center gap-1.5">
                                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                            <Flame size={24} className="text-yellow-500" />
                                        </div>
                                        <p className="text-xs text-[var(--muted)]">Gorduras</p>
                                        <p className="font-black text-[var(--foreground)] text-lg">{scannedFood.fat} g</p>
                                    </div>
                                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 flex flex-col items-center gap-1.5">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <Wheat size={24} className="text-emerald-500" />
                                        </div>
                                        <p className="text-xs text-[var(--muted)]">Fibras</p>
                                        <p className="font-black text-[var(--foreground)] text-lg">{scannedFood.fiber} g</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Action - Sticky */}
                {step === 'result' && (
                    <div className="p-4 pb-8 bg-[var(--background)]">
                        <button
                            onClick={handleConfirmMeal}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all active:scale-[0.98] shadow-xl shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    Registrar Alimentação
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
                className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-6 pb-10 animate-slide-up bg-[var(--card)] border-t border-[var(--border)]"
            >
                <div className="w-10 h-1 rounded-full bg-gray-600 mx-auto mb-6" />

                <div className="space-y-2 mb-6">
                    <button
                        onClick={handleCameraClick}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--card-hover)] hover:opacity-80 transition-all active:scale-98 animate-fade-in border border-[var(--border)]"
                        style={{ animationDelay: '100ms' }}
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Camera size={20} className="text-blue-500" />
                        </div>
                        <span className="text-[var(--foreground)] font-medium">Escanear comida</span>
                    </button>

                    <button
                        onClick={handleLibraryClick}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--card-hover)] hover:opacity-80 transition-all active:scale-98 animate-fade-in border border-[var(--border)]"
                        style={{ animationDelay: '200ms' }}
                    >
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <ImageIcon size={20} className="text-purple-500" />
                        </div>
                        <span className="text-[var(--foreground)] font-medium">Escolher da biblioteca</span>
                    </button>

                    <button
                        onClick={() => setStep('describe')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--card-hover)] hover:opacity-80 transition-all active:scale-98 animate-fade-in border border-[var(--border)]"
                        style={{ animationDelay: '300ms' }}
                    >
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <PenLine size={20} className="text-orange-500" />
                        </div>
                        <span className="text-[var(--foreground)] font-medium">Descrever comida</span>
                    </button>
                </div>

                <div className="mt-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <h4 className="text-sm text-[var(--muted)] mb-3">Ingestão de água</h4>
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
