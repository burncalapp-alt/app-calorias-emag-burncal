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
                content: `Atue como um Especialista em Visão Computacional focado em identificação PRECISA e LITERAL de alimentos.

SUA PRIORIDADE MÁXIMA É A PRECISÃO.
1. Analise visualmente cada componente do prato. Se for pão com ovo, diga "Pão com Ovo". Se for arroz e feijão, diga "Arroz e Feijão".
2. NÃO invente nomes gourmet ("Salada Caesar", "Bowl de...") se a imagem mostrar comida caseira simples.
3. Se houver dúvida, descreva o que vê literalmente (ex: "Sanduíche de Presunto e Ovos").

Após identificar o alimento com precisão técnica, adote um tom de nutricionista motivador (estilo Instagram) APENAS para os campos de narrativa e badge.

Tarefas:
1. Nome do Prato (Seja literal e preciso)
2. Peso estimado (em gramas)
3. Calorias totais (estimativa realista)
4. Macros (Proteína, Carboidratos, Gordura, Fibras)
5. Badge de Juízo (nutricionista motivador)
6. Narrativa (nutricionista motivador)
7. Microfrase (nutricionista motivador)

**Badge de Juízo (judgmentBadge):**
- Para alimentos saudáveis/dentro da dieta: use "green" e textos como "Dentro do plano ✅", "Escolha inteligente ✅", "Top demais 💚"
- Para alimentos intermediários/controlados: use "yellow" e textos como "Deslize controlado", "Equilíbrio é tudo ⚖️", "Cabe na meta 👌"
- Para alimentos indulgentes/calóricos: use "orange" e textos como "Proibido? Não — estratégico", "Cheat inteligente 🔥", "Vale o prazer ⚡"

**Narrativa da Refeição (mealNarrative):**
Crie uma frase curta e contextual, como:
- "1ª refeição do dia — limpa"
- "Refeição 1/3 — dentro da meta"
- "Primeiro round do dia — foco"
- "Energia pura pra começar"
- "Almoço estratégico"

**Microfrase de Calorias (caloriePhrase):**
Crie uma frase curta e provocativa, como:
- "Sem culpa"
- "Cabe na dieta?"
- "Vale como cheat controlado"
- "Combustível limpo"
- "Estratégico demais"

Responda APENAS em JSON válido, sem markdown, no seguinte formato:
{
  "name": "Nome do prato",
  "weight": 250,
  "calories": 450,
  "protein": 25,
  "carbs": 40,
  "fat": 15,
  "fiber": 5,
  "confidence": 0.85,
  "judgmentBadge": {
    "text": "Dentro do plano ✅",
    "color": "green"
  },
  "mealNarrative": "Primeira refeição — energia limpa",
  "caloriePhrase": "Sem culpa"
}

Se a imagem não estiver perfeitamente clara, faça sua MELHOR ESTIMATIVA baseada no que é visível. NÃO retorne erro a menos que a imagem seja totalmente preta ou corrompida. Se parecer comida, analise.

Se estiver em dúvida sobre o ingredientes específicos, assuma os mais prováveis para aquele tipo de prato.`
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
                ? `Analise esta imagem de comida.Contexto adicional: ${description}`
                : 'Analise esta imagem de comida e forneça as informações nutricionais.'
        });

        messages.push({
            role: 'user',
            content: userContent
        });

        console.log('=== AI FOOD ANALYSIS DEBUG ===');
        console.log('Image included:', !!imageBase64);
        console.log('Image size (bytes):', imageBase64?.length || 0);
        console.log('Description:', description);
        console.log('API Key present:', !!OPENAI_API_KEY);
        console.log('API Key prefix:', OPENAI_API_KEY?.substring(0, 20));

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages,
                max_tokens: 1000,
                temperature: 0.3,
                response_format: { type: "json_object" }
            })
        });

        console.log('OpenAI Response Status:', response.status);
        console.log('OpenAI Response OK:', response.ok);

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

        console.log('OpenAI Full Response:', JSON.stringify(data, null, 2));
        console.log('OpenAI Content:', content);

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
