import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; // Allow longer timeout for vision

export async function POST(req: Request) {
    try {
        const { image, profile } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'Imagem não fornecida' }, { status: 400 });
        }

        const prompt = `
            Analise este print de treino (provavelmente do Strava, Nike Run Club, ou app similar).
            
            Perfil do Usuário:
            - Nome: ${profile.name}
            - Objetivo: ${profile.goal}
            - Peso: ${profile.weight}kg
            - Nível de Atividade: ${profile.activityLevel}

            Por favor, extraia as estatísticas principais e forneça uma análise personalizada.
            Crucialmente, forneça conselhos específicos "Pré-Treino" para o *próximo* treino com base neste desempenho.

            Responda APENAS com um JSON válido neste formato (mantenha as chaves em inglês, mas os valores em PORTUGUÊS do Brasil):
            {
                "stats": {
                    "distance": "string (ex: 5.0 km)",
                    "duration": "string (ex: 25:00)",
                    "pace": "string (ex: 5:00 /km)",
                    "calories": "string (ex: 400 kcal)"
                },
                "summary": "Resumo breve e encorajador do desempenho.",
                "feedback": [
                    "Ponto positivo específico sobre o ritmo ou distância",
                    "Dica construtiva para melhoria"
                ],
                "preRunAdvice": {
                    "fuel": "Sugestão específica de alimentos como Banana, Aveia e Mel para energia antes da próxima corrida similar",
                    "mobility": "Exercício específico de alongamento dinâmico ou ativação para fazer antes de começar (ex: 'Balanços de perna e joelhos altos')"
                },
                "score": 0 a 100 (número inteiro)
            }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                "url": image, // Expecting data:image/jpeg;base64,...
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1000,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;

        if (!content) {
            throw new Error("No content from OpenAI");
        }

        const result = JSON.parse(content);
        return NextResponse.json(result);

    } catch (error) {
        console.error('Error analyzing workout image:', error);
        return NextResponse.json(
            { error: 'Falha ao analisar imagem. Tente novamente.' },
            { status: 500 }
        );
    }
}
