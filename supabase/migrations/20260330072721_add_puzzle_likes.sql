-- Add puzzle_likes table for users to like puzzles

create table if not exists public.puzzle_likes (
  user_id uuid not null references auth.users(id),
  puzzle_id uuid not null references public.puzzles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, puzzle_id)
);

alter table public.puzzle_likes enable row level security;

-- Authenticated users can read their own likes
create policy "puzzle_likes_select_authenticated"
  on public.puzzle_likes
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Authenticated users can insert their own likes
create policy "puzzle_likes_insert_authenticated"
  on public.puzzle_likes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Authenticated users can delete their own likes
create policy "puzzle_likes_delete_authenticated"
  on public.puzzle_likes
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Index for looking up likes by puzzle
create index idx_puzzle_likes_puzzle_id on public.puzzle_likes (puzzle_id);
