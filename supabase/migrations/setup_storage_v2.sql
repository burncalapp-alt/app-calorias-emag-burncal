-- Script de Configuração do Armazenamento (Storage)
-- Execute este script no Editor SQL do Supabase para corrigir o problema das fotos

-- 1. Criar o Bucket 'meal_photos' (se não existir)
insert into storage.buckets (id, name, public)
values ('meal_photos', 'meal_photos', true)
on conflict (id) do nothing;

-- 2. Remover políticas antigas para evitar duplicidade
drop policy if exists "Public Access to Meal Photos" on storage.objects;
drop policy if exists "Authenticated Users can Upload Meal Photos" on storage.objects;
drop policy if exists "Users can update own meal photos" on storage.objects;
drop policy if exists "Users can delete own meal photos" on storage.objects;

-- 3. Criar Políticas de Segurança (RLS)

-- Permitir que qualquer pessoa veja as fotos (Necessário para exibir no app)
create policy "Public Access to Meal Photos"
on storage.objects for select
using ( bucket_id = 'meal_photos' );

-- Permitir que usuários logados façam upload
create policy "Authenticated Users can Upload Meal Photos"
on storage.objects for insert
with check ( bucket_id = 'meal_photos' and auth.role() = 'authenticated' );

-- Permitir que usuários atualizem suas próprias fotos
create policy "Users can update own meal photos"
on storage.objects for update
using ( bucket_id = 'meal_photos' and auth.uid()::text = (storage.foldername(name))[1] );

-- Permitir que usuários apaguem suas próprias fotos
create policy "Users can delete own meal photos"
on storage.objects for delete
using ( bucket_id = 'meal_photos' and auth.uid()::text = (storage.foldername(name))[1] );
