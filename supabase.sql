-- Linha de Produção de Conteúdo com IA: banco do Supabase.
-- Cole tudo no SQL Editor do Supabase e clique em Run. Pode rodar mais de uma vez sem problema.

create table if not exists public.progresso (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  dados jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

-- Cada aluno só enxerga e altera o próprio progresso.
alter table public.progresso enable row level security;

drop policy if exists "aluno le o proprio progresso" on public.progresso;
drop policy if exists "aluno cria o proprio progresso" on public.progresso;
drop policy if exists "aluno atualiza o proprio progresso" on public.progresso;

create policy "aluno le o proprio progresso" on public.progresso
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "aluno cria o proprio progresso" on public.progresso
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "aluno atualiza o proprio progresso" on public.progresso
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select, insert, update on public.progresso to authenticated;
revoke all on public.progresso from anon;
