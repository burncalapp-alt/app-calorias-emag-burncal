import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface UserProfile {
    age: number;
    weight: number;
    height: number;
    gender: 'male' | 'female';
    activityLevel: string;
    goal: string;
}

export async function POST(request: NextRequest) {
    try {
        const { profile, workoutType }: { profile: UserProfile; workoutType: 'pre-run' | 'post-run' } = await request.json();

        if (!OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'API key não configurada' },
                { status: 500 }
            );
        }

        const systemPrompt = workoutType === 'pre-run'
            ? `Você é um treinador de elite especializado em MARATONAS e corrida de longa distância. Crie uma rotina de AQUECIMENTO DINÂMICO específica para corredores de rua.
               
               FOCO: Preparar o corpo para longas distâncias, evitando lesões comuns (canelite, joelho de corredor).
               TIPOS DE EXERCÍCIO que DEVEM ser incluídos:
               - Mobilidade de quadril e tornozelo (essencial para corredores)
               - Ativação de glúteo médio (estabilidade pélvica)
               - Educativos de corrida (skipping, anfersen)
               - Aumento gradual da frequência cardíaca
               
               NUNCA inclua alongamentos estáticos no pré-treino.`
            : `Você é um treinador de elite especializado em MARATONAS. Crie uma rotina de RECUPERAÇÃO pós-treino longo.
               
               FOCO: Recuperação muscular e retorno à calma após alto volume de corrida.
               TIPOS DE EXERCÍCIO que DEVEM ser incluídos:
               - Soltura miofascial (se possível sugerir movimentos manuais ou com rolo)
               - Alongamentos estáticos profundos para cadeia posterior (isquiotibiais, panturrilhas)
               - Descompressão lombar
               - Mobilidade de tornozelo e pés
               
               NUNCA inclua movimentos explosivos no pós-treino. Foco total em relaxamento.`;

        const userPrompt = `
Perfil do usuário:
- Idade: ${profile.age} anos
- Peso: ${profile.weight} kg
- Altura: ${profile.height} cm
- Gênero: ${profile.gender === 'male' ? 'Masculino' : 'Feminino'}
- Nível de atividade: ${profile.activityLevel}
- Objetivo: ${profile.goal}

${workoutType === 'pre-run'
                ? 'Gere uma rotina de AQUECIMENTO DINÂMICO pré-corrida. Inclua também 3-4 ações de PREPARAÇÃO (beber água, comer algo leve, protetor solar).'
                : 'Gere uma rotina de ALONGAMENTO ESTÁTICO pós-corrida. Inclua também 3-4 ações de RECUPERAÇÃO (banho gelado, elevar pernas, proteína).'}

Responda APENAS em JSON válido, sem markdown, no seguinte formato:
{
  "title": "Nome da Rotina",
  "description": "Breve descrição",
  "nutritionTips": "${workoutType === 'pre-run' ? 'Dica de alimento pré-treino (ex: Banana com mel)' : 'Dica de pós-treino (ex: Iogurte com whey)'}",
  "totalTime": "${workoutType === 'pre-run' ? '6 min' : '8 min'}",
  "calories": "${workoutType === 'pre-run' ? '45 kcal' : '15 kcal'}",
  "actions": [
    {
       "task": "Descrição da tarefa (ex: Beber 500ml de água)",
       "category": "${workoutType === 'pre-run' ? 'Preparação' : 'Recuperação'}",
       "icon": "🥤"
    }
  ],
  "exercises": [
    {
      "name": "Nome do Exercício",
      "durationLabel": "${workoutType === 'pre-run' ? '30 segundos' : '30 seg cada lado'}",
      "durationSeconds": ${workoutType === 'pre-run' ? 30 : 60},
      "type": "time",
      "icon": "🔄",
      "description": "Instrução breve de como fazer"
    }
  ]
}

Use type: "time" para exercícios cronometrados e "reps" para repetições.
Emojis sugeridos: ${workoutType === 'pre-run'
                ? '🔄 (rotação), 🦵 (perna), 🏃 (corrida), 🦿 (movimento), 💪 (ativação)'
                : '🧘 (alongamento), 🦵 (quadríceps), 🦶 (panturrilha), 🍑 (glúteo), 🌀 (relaxamento), 😮‍💨 (respiração)'}`;

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
                { error: 'Erro ao gerar treino' },
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

        // Parse the JSON response
        try {
            const workoutData = JSON.parse(content);
            return NextResponse.json(workoutData);
        } catch {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const workoutData = JSON.parse(jsonMatch[0]);
                return NextResponse.json(workoutData);
            }
            return NextResponse.json(
                { error: 'Formato de resposta inválido' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error in generate-workout:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
