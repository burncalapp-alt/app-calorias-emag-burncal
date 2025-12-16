# Launch Readiness Checklist

## 1. Persistência de Dados (Crítico 🚨)
Atualmente, as funções `handleMealAdd` e `handleWaterAdd` no `page.tsx` apenas atualizam o estado local da aplicação.
- [ ] Criar tabela `meals` (e `water_logs`) no Supabase.
- [ ] Atualizar `page.tsx` para salvar os dados no Supabase ao adicionar refeição/água.
- [ ] Atualizar `page.tsx` para carregar o histórico do Supabase ao iniciar o app.

## 2. Configuração PWA (Instalação)
Para o aplicativo ser instalável como um App nativo no celular:
- [ ] Criar `public/manifest.json`.
- [ ] Gerar ícones do aplicativo (192x192, 512x512) e salvar em `public`.
- [ ] Configurar `viewport` e metadados corretamente no `layout.tsx`.

## 3. Deploy (Publicação)
- [ ] Configurar projeto na Vercel (recomendado para Next.js).
- [ ] Configurar variáveis de ambiente de produção no painel da Vercel.

## 4. Polimento Final
- [ ] Verificar se todos os textos "mockados" (como o gráfico de peso estático) estão conectados a dados reais ou se ficarão assim para o MVP.
