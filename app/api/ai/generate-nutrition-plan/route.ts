import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { profile, category } = await req.json();

        if (!profile) {
            return NextResponse.json({ error: 'Perfil do usuário não fornecido' }, { status: 400 });
        }

        // Calculate user's actual daily goals (same logic as UserContext)
        const bmr = calculateBMR(profile);
        const tdee = calculateTDEE(bmr, profile.activityLevel);
        const dailyCalories = adjustForGoal(tdee, profile.goal);
        const macros = calculateMacros(dailyCalories, profile.goal);

        let promptContext = '';
        let jsonStructure = '';

        if (category) {
            const translatedCategory =
                category === 'breakfast' ? 'Café da Manhã' :
                    category === 'lunch' ? 'Almoço' :
                        category === 'snack' ? 'Lanche' : 'Jantar';

            // Calculate target calories for this meal based on typical distribution
            const mealCalorieTargets = {
                breakfast: Math.round(dailyCalories * 0.25), // 25%
                lunch: Math.round(dailyCalories * 0.35),     // 35%
                snack: Math.round(dailyCalories * 0.15),     // 15%
                dinner: Math.round(dailyCalories * 0.25)     // 25%
            };

            const targetCalories = mealCalorieTargets[category as keyof typeof mealCalorieTargets];

            promptContext = `
            TAREFA ESPECÍFICA:
            1. Crie EXATAMENTE 5 opções de refeições práticas para o horário: ${translatedCategory} (${category}).
            2. Cada opção deve ter aproximadamente ${targetCalories} calorias (variação de ±50 kcal é aceitável).
            3. As opções devem ser variadas mas todas adequadas para este horário.
            4. Distribua os macros proporcionalmente: ${Math.round(macros.protein * (category === 'breakfast' || category === 'dinner' ? 0.25 : category === 'lunch' ? 0.35 : 0.15))}g proteína, ${Math.round(macros.carbs * (category === 'breakfast' || category === 'dinner' ? 0.25 : category === 'lunch' ? 0.35 : 0.15))}g carboidratos, ${Math.round(macros.fat * (category === 'breakfast' || category === 'dinner' ? 0.25 : category === 'lunch' ? 0.35 : 0.15))}g gordura.
            `;

            jsonStructure = `
            {
                "notes": "Foco em ${translatedCategory} - ${targetCalories} kcal por opção",
                "meals": [
                     {
                        "name": "Opção 1",
                        "calories": ${targetCalories},
                        "protein": 30,
                        "carbs": 40,
                        "fats": 15,
                        "ingredients": ["..."],
                        "instructions": "..."
                    },
                    ... (mais 4 opções com calorias similares)
                ]
            }
            `;
        } else {
            promptContext = `
            TAREFA COMPLETA:
            1. Meta diária do usuário: ${Math.round(dailyCalories)} kcal
            2. Distribua as calorias assim:
               - Café da Manhã: ~${Math.round(dailyCalories * 0.25)} kcal (25%)
               - Almoço: ~${Math.round(dailyCalories * 0.35)} kcal (35%)
               - Lanche: ~${Math.round(dailyCalories * 0.15)} kcal (15%)
               - Jantar: ~${Math.round(dailyCalories * 0.25)} kcal (25%)
            3. Crie 5 opções para CADA categoria.
            4. Macros diários: ${macros.protein}g proteína, ${macros.carbs}g carboidratos, ${macros.fat}g gordura.
            `;
            jsonStructure = `
            {
                "calories_target": ${Math.round(dailyCalories)},
                "protein_target": ${macros.protein},
                "carbs_target": ${macros.carbs},
                "fats_target": ${macros.fat},
                "meal_categories": {
                    "breakfast": [5 opções com ~${Math.round(dailyCalories * 0.25)} kcal cada],
                    "lunch": [5 opções com ~${Math.round(dailyCalories * 0.35)} kcal cada],
                    "snack": [5 opções com ~${Math.round(dailyCalories * 0.15)} kcal cada],
                    "dinner": [5 opções com ~${Math.round(dailyCalories * 0.25)} kcal cada]
                }
            }
            `;
        }

        const prompt = `
            Aja como um nutricionista esportivo de elite.
            
            PERFIL DO USUÁRIO:
            - Gênero: ${profile.gender}
            - Idade: ${calculateAge(profile.birthDate)} anos
            - Altura: ${profile.height} cm
            - Peso Atual: ${profile.weight} kg
            - Peso Meta: ${profile.targetWeight} kg
            - Objetivo: ${translateGoal(profile.goal)}
            
            ${promptContext}

            REGRAS IMPORTANTES:
            - Alimentos acessíveis no Brasil (arroz, feijão, frango, ovos, tapioca, frutas, batata-doce).
            - Exatamente 5 opções por categoria solicitada.
            - Receitas práticas e rápidas (máximo 20 minutos de preparo).
            - As calorias de TODAS as opções de uma mesma categoria devem ser similares (±50 kcal).
            - Se o usuário escolher qualquer opção, ele deve conseguir bater a meta diária.
            
            FORMATO DE RESPOSTA (JSON APENAS):
            ${jsonStructure}
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Você é um nutricionista especialista em emagrecimento e performance. Sempre forneça múltiplas opções de refeições para dar flexibilidade ao usuário."
                },
                {
                    role: "user",
                    content: prompt
                },
            ],
            max_tokens: 4000,
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;

        if (!content) {
            throw new Error("No content from OpenAI");
        }

        const result = JSON.parse(content);
        return NextResponse.json(result);

    } catch (error) {
        console.error('Error generating nutrition plan:', error);
        return NextResponse.json(
            { error: 'Falha ao gerar plano nutricional.' },
            { status: 500 }
        );
    }
}

function calculateAge(birthDate: string) {
    if (!birthDate) return 25;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function translateGoal(goal: string) {
    const map: Record<string, string> = {
        'lose_weight': 'Perder Gordura',
        'gain_definition': 'Definição Muscular',
        'maintain': 'Manutenção',
        'gain_muscle': 'Ganho de Massa Muscular'
    };
    return map[goal] || goal;
}

function translateWorkoutType(types: string[]) {
    if (Array.isArray(types)) return types.join(', ');
    return types;
}

// BMR Calculation (Mifflin-St Jeor)
function calculateBMR(profile: any): number {
    const { gender, age, height, weight } = profile;
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}

// TDEE Calculation
function calculateTDEE(bmr: number, activityLevel: string): number {
    const multipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
    };
    return bmr * (multipliers[activityLevel] || 1.55);
}

// Adjust for Goal
function adjustForGoal(tdee: number, goal: string): number {
    if (goal === 'lose_weight') {
        return tdee - 500; // 500 kcal deficit
    } else if (goal === 'gain_muscle') {
        return tdee + 300; // 300 kcal surplus
    }
    return tdee; // maintain
}

// Calculate Macros
function calculateMacros(dailyCalories: number, goal: string) {
    let proteinRatio = 0.30;
    let fatRatio = 0.25;

    if (goal === 'gain_muscle') {
        proteinRatio = 0.35;
        fatRatio = 0.25;
    } else if (goal === 'lose_weight') {
        proteinRatio = 0.35;
        fatRatio = 0.20;
    }

    const carbRatio = 1 - proteinRatio - fatRatio;

    return {
        protein: Math.round((dailyCalories * proteinRatio) / 4),
        carbs: Math.round((dailyCalories * carbRatio) / 4),
        fat: Math.round((dailyCalories * fatRatio) / 9)
    };
}
