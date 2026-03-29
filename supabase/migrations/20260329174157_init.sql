-- Initial schema: puzzles, puzzle_schedule, game_turns

-- Create puzzles table for lateral thinking puzzles
create table if not exists public.puzzles (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  solution text not null,
  image_url text,
  source text not null default 'seed'
    check (source in ('seed', 'import', 'user', 'remix')),
  source_url text,
  created_by uuid references auth.users(id),
  remixed_from uuid references public.puzzles(id),
  status text not null default 'published'
    check (status in ('draft', 'published')),
  content_hash text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.puzzles enable row level security;

-- Anon users can only see published puzzles
create policy "puzzles_select_anon"
  on public.puzzles
  for select
  to anon
  using (status = 'published');

-- Authenticated users can see published puzzles + their own drafts
create policy "puzzles_select_authenticated"
  on public.puzzles
  for select
  to authenticated
  using (
    status = 'published'
    or created_by = auth.uid()
  );

-- Authenticated users can create their own draft puzzles
create policy "puzzles_insert_authenticated"
  on public.puzzles
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and source in ('user', 'remix')
    and status = 'draft'
  );

-- Authenticated users can update only their own drafts
create policy "puzzles_update_authenticated"
  on public.puzzles
  for update
  to authenticated
  using (created_by = auth.uid() and status = 'draft')
  with check (created_by = auth.uid());

-- Authenticated users can delete only their own drafts
create policy "puzzles_delete_authenticated"
  on public.puzzles
  for delete
  to authenticated
  using (created_by = auth.uid() and status = 'draft');

-- Indexes on puzzles
create unique index if not exists idx_puzzles_content_hash
  on public.puzzles (content_hash)
  where content_hash is not null;

create index if not exists idx_puzzles_source on public.puzzles (source);
create index if not exists idx_puzzles_status on public.puzzles (status);
create index if not exists idx_puzzles_created_by on public.puzzles (created_by)
  where created_by is not null;

-- Create puzzle_schedule table for daily puzzle scheduling
create table if not exists public.puzzle_schedule (
  release_date date primary key,
  puzzle_id uuid not null references public.puzzles(id) unique
);

-- Enable RLS
alter table public.puzzle_schedule enable row level security;

-- Everyone can read the schedule
create policy "puzzle_schedule_select_anon"
  on public.puzzle_schedule
  for select
  to anon
  using (true);

create policy "puzzle_schedule_select_authenticated"
  on public.puzzle_schedule
  for select
  to authenticated
  using (true);

-- Create game_turns table for logging AI judgments per turn
create table if not exists public.game_turns (
  id bigint generated always as identity primary key,
  puzzle_id uuid not null references public.puzzles(id),
  user_id uuid not null references auth.users(id),
  turn_number smallint not null,
  question text not null,
  judgment text not null check (judgment in ('yes', 'no', 'not_relevant', 'not_yes_or_no', 'correct', 'incorrect')),
  is_solution_guess boolean not null default false,
  reasoning text,
  -- Feedback for solution guesses
  feedback text,
  -- How close the guess was: 'close' (offer reveal) or 'off_track'
  closeness text check (closeness is null or closeness in ('close', 'off_track')),
  -- Whether the player chose to reveal the answer after a close guess
  revealed boolean not null default false,
  -- How the game ended, set on the final turn only
  end_reason text check (end_reason is null or end_reason in ('solved', 'revealed', 'exhausted')),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.game_turns enable row level security;

-- Authenticated users (including anonymous) can insert their own turns
create policy "game_turns_insert_authenticated"
  on public.game_turns
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Authenticated users can read their own turns
create policy "game_turns_select_authenticated"
  on public.game_turns
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Allow authenticated users to update their own turns (for marking revealed + end_reason)
create policy "game_turns_update_authenticated"
  on public.game_turns
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes for common queries
create index idx_game_turns_puzzle_id on public.game_turns (puzzle_id);
create index idx_game_turns_user_id on public.game_turns (user_id);
create index idx_game_turns_created_at on public.game_turns (created_at);
