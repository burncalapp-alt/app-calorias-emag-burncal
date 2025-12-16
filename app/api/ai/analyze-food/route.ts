import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
    try {
        const { imageBase64, description } = await request.json();

        if (!OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'API key não configurada' },
                { status: 500 }
            );
        }

        const messages: any[] = [
            {
                role: 'system',
                content: `Você é um nutricionista especialista em análise de alimentos. Ao receber uma imagem de comida, você deve:
1. Identificar o prato/alimento
2. Estimar o peso em gramas
3. Calcular as calorias totais
4. Calcular os macronutrientes (proteína, carboidratos, gordura)

Responda APENAS em JSON válido, sem markdown, no seguinte formato:
{
  "name": "Nome do prato",
  "weight": 250,
  "calories": 450,
  "protein": 25,
  "carbs": 40,
  "fat": 15,
  "fiber": 5,
  "confidence": 0.85
}

Se não conseguir identificar o alimento, retorne:
{
  "error": "Não foi possível identificar o alimento",
  "confidence": 0
}`
            }
        ];

        // Build user message with image and optional description
        const userContent: any[] = [];

        if (imageBase64) {
            userContent.push({
                type: 'image_url',
                image_url: {
                    url: imageBase64.startsWith('data:')
                        ? imageBase64
                        : `data:image/jpeg;base64,${imageBase64}`,
                    detail: 'high'
                }
            });
        }

        userContent.push({
            type: 'text',
            text: description
                ? `Analise esta imagem de comida. Contexto adicional: ${description}`
                : 'Analise esta imagem de comida e forneça as informações nutricionais.'
        });

        messages.push({
            role: 'user',
            content: userContent
        });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages,
                max_tokens: 500,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            return NextResponse.json(
                {
                    error: 'Erro ao analisar imagem',
                    details: errorData
                },
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
            const nutritionData = JSON.parse(content);
            return NextResponse.json(nutritionData);
        } catch {
            // If parsing fails, try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const nutritionData = JSON.parse(jsonMatch[0]);
                return NextResponse.json(nutritionData);
            }
            return NextResponse.json(
                { error: 'Formato de resposta inválido', raw: content },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error in analyze-food:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
