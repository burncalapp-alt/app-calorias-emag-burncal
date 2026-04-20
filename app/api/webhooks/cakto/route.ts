import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Precisamos usar a Service Role Key para ignorar as permissões de segurança (RLS) 
// e conseguir atualizar os dados do usuário a partir do servidor em background.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Adicione isso no seu .env.local

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        // 1. Receber os dados da Cakto
        const payload = await request.json();
        console.log('Webhook da Cakto recebido:', JSON.stringify(payload, null, 2));

        // 2. Extrair informações cruciais (Isso pode variar levemente dependendo da estrutura exata da Cakto)
        // Geralmente plataformas brasileiras mandam algo parecido com isso:
        const email = payload.customer?.email || payload.client?.email || payload.email;
        const status = payload.status || payload.event_type; 
        
        // Vamos supor que a Cakto envie "approved" ou "active" para compras/assinaturas aprovadas
        const isApproved = status === 'approved' || status === 'active' || status === 'paid';
        
        // E "canceled", "refunded", "chargeback" para cancelamentos
        const isCanceled = status === 'canceled' || status === 'refunded' || status === 'chargeback' || status === 'overdue';

        if (!email) {
            return NextResponse.json({ message: 'Email não encontrado no payload' }, { status: 400 });
        }

        // 3. Buscar o usuário no Supabase pelo E-mail
        // Primeiro achamos o ID do Auth do usuário
        const { data: userData, error: userError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email) // Vamos precisar garantir que a tabela profiles tenha a coluna email, ou usar a tabela de auth do supabase
            .single();

        if (userError || !userData) {
            console.log(`Usuário com e-mail ${email} não encontrado no banco.`);
            // Retorna 200 pro Cakto parar de tentar, mas avisa no log
            return NextResponse.json({ message: 'User not found in database, but hook received' });
        }

        // 4. Atualizar o status da assinatura
        let newStatus = 'inactive';
        if (isApproved) newStatus = 'active';

        // Atualizamos a tabela de profiles
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ subscription_status: newStatus })
            .eq('id', userData.id);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ message: 'Assinatura atualizada com sucesso', status: newStatus });
    } catch (error: any) {
        console.error('Erro na webhook da Cakto:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
