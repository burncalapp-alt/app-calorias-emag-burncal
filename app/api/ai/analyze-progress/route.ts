import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface AnalysisRequest {
    profile: {
        name: string;
        age: number;
        weight: number;
        height: number;
        gender: string;
        goal: string;
        activityLevel: string;
    };
    dailyData: {
        calories: { consumed: number; goal: number };
        water: { consumed: number; goal: number };
        macros: { protein: number; carbs: number; fat: number };
    };
    weeklyProgress?: {
        weightsLast7Days?: number[];
        caloriesLast7Days?: number[];
        workoutsCompleted?: number;
    };
}

export async function POST(request: NextRequest) {
    try {
        const { profile, dailyData, weeklyProgress }: AnalysisRequest = await request.json();

        if (!OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'API key não configurada' },
                { status: 500 }
            );
        }

        const systemPrompt = `Você é um nutricionista e personal trainer virtual especializado em emagrecimento e performance.
Sua função é analisar os dados do usuário e fornecer:
1. Um resumo do progresso atual
2. Pontos positivos identificados
3. Áreas de melhoria
4. Dicas práticas e personalizadas
5. Motivação e encorajamento

Seja direto, prático e motivador. Use linguagem acessível e brasileira.`;

        const bmi = profile.weight / Math.pow(profile.height / 100, 2);

        const userPrompt = `
Analise os dados deste usuário e forneça insights personalizados:

**PERFIL:**
- Nome: ${profile.name}
- Idade: ${profile.age} anos
- Peso: ${profile.weight} kg
- Altura: ${profile.height} cm
- IMC: ${bmi.toFixed(1)}
- Gênero: ${profile.gender === 'male' ? 'Masculino' : 'Feminino'}
- Objetivo: ${profile.goal === 'lose_weight' ? 'Perder peso' : profile.goal === 'gain_muscle' ? 'Ganhar massa' : 'Manter peso'}
- Nível de atividade: ${profile.activityLevel}

**DADOS DE HOJE:**
- Calorias: ${dailyData.calories.consumed}/${dailyData.calories.goal} kcal (${Math.round((dailyData.calories.consumed / dailyData.calories.goal) * 100)}%)
- Água: ${dailyData.water.consumed}/${dailyData.water.goal} ml (${Math.round((dailyData.water.consumed / dailyData.water.goal) * 100)}%)
- Proteínas: ${dailyData.macros.protein}g
- Carboidratos: ${dailyData.macros.carbs}g
- Gorduras: ${dailyData.macros.fat}g

${weeklyProgress ? `
**PROGRESSO SEMANAL:**
- Treinos completados: ${weeklyProgress.workoutsCompleted || 0}
` : ''}

Responda APENAS em JSON válido, sem markdown:
{
  "summary": "Resumo geral do progresso em 2-3 frases",
  "positives": ["Ponto positivo 1", "Ponto positivo 2"],
  "improvements": ["Área de melhoria 1", "Área de melhoria 2"],
  "tips": [
    {
      "title": "Título da dica",
      "description": "Descrição prática",
      "priority": "high"
    }
  ],
  "motivation": "Frase motivacional personalizada",
  "score": 75
}

O score é de 0-100 representando a aderência geral ao plano.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            return NextResponse.json(
                { error: 'Erro ao analisar progresso' },
                { status: response.status }
            );
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            return NextResponse.json(
                { error: 'Resposta vazia da IA' },
                { status: 500 }
            );
        }

        try {
            const analysisData = JSON.parse(content);
            return NextResponse.json(analysisData);
        } catch {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const analysisData = JSON.parse(jsonMatch[0]);
                return NextResponse.json(analysisData);
            }
            return NextResponse.json(
                { error: 'Formato de resposta inválido' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error in analyze-progress:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
