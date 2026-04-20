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

        // Requer pelo menos imagem OU descrição de texto
        if (!imageBase64 && !description?.trim()) {
            return NextResponse.json(
                { error: 'Forneça uma imagem ou descrição do alimento.' },
                { status: 400 }
            );
        }

        const messages: any[] = [
            {
                role: 'system',
                content: `Atue como um Especialista em Nutrição e Visão Computacional focado em identificação PRECISA e LITERAL de alimentos com cálculos de alta granularidade.

SUA PRIORIDADE MÁXIMA É A PRECISÃO MILIMÉTRICA NOS NÚMEROS:
1. Analise visualmente cada componente do prato e seus respectivos tamanhos/porções reais.
2. Forneça números precisos e fracionados, NUNCA arredondados (ex: não diga 450 calorias, diga 437; não diga 25g de proteína, diga 23.4g). Use valores críveis mas matematicamente precisos com base na porção visual.
3. Descreva o que vê literalmente (ex: "Sanduíche de Presunto e Ovos"). Não invente nomes gourmet para comidas simples.

Após identificar o alimento e sua tabela nutricional precisa, adote um tom de nutricionista motivador (estilo Instagram) APENAS para os campos de badge, narrativa e microfrase.

Tarefas:
1. Nome do Prato (Seja literal e preciso)
2. Peso estimado (em gramas exatas, ex: 243)
3. Calorias totais (valor exato não redondo, ex: 412)
4. Macros (Proteína, Carboidratos, Gordura, Fibras) - sempre forneça em gramas quebradas/exatas (ex: 28.5).
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
- "Refeição estratégica"
- "Almoço dentro da meta"

**Microfrase de Calorias (caloriePhrase):**
Frase curta e provocativa, como "Combustível limpo", "Vale a pena", "Sem culpa".

Responda APENAS em JSON válido, no seguinte formato de exemplo de dados precisos (onde "confidence" deve refletir de forma realista entre 0.90 e 0.99 para fotos nítidas do prato). Exemplo:
{
  "name": "Nome do prato",
  "weight": 242.5,
  "calories": 413,
  "protein": 24.3,
  "carbs": 41.8,
  "fat": 16.2,
  "fiber": 4.7,
  "confidence": 0.96,
  "judgmentBadge": {
    "text": "Dentro do plano ✅",
    "color": "green"
  },
  "mealNarrative": "Primeira refeição — energia limpa",
  "caloriePhrase": "Sem culpa"
}

Se a imagem não estiver perfeitamente clara, faça sua MELHOR estimativa precisa baseada no visível. Se estiver em dúvida sobre ingredientes, assuma as texturas/preparos mais tradicionais e calcule exatamente.`
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
            text: imageBase64
                ? (description
                    ? `Analise esta imagem de comida. Contexto adicional: ${description}`
                    : 'Analise esta imagem de comida e forneça as informações nutricionais.')
                : `Analise este alimento descrito pelo usuário e forneça as informações nutricionais estimadas: "${description}"`
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
                temperature: 0.1, // Temperatura baixa para respostas mais lógicas e matemáticas garantindo constância
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
