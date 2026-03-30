-- Convert puzzles.source from text+CHECK to a proper enum type,
-- and prioritize seed/import puzzles in the random selection RPC.

-- 1. Create the enum type
do $$ begin
  create type public.puzzle_source as enum ('seed', 'import', 'user', 'remix');
exception when duplicate_object then null;
end $$;

-- 2. Drop the inline CHECK constraint (auto-named puzzles_source_check)
alter table public.puzzles drop constraint if exists puzzles_source_check;

-- 3. Drop the existing text default before converting the type
alter table public.puzzles alter column source drop default;

-- 4. Drop the RLS policy that references source (cannot alter type while policy depends on it)
drop policy if exists "puzzles_insert_authenticated" on public.puzzles;

-- 5. Convert column from text to enum
alter table public.puzzles
  alter column source type public.puzzle_source using source::public.puzzle_source;

-- 6. Set the new default as the enum type
alter table public.puzzles
  alter column source set default 'seed'::public.puzzle_source;

-- 7. Recreate the RLS policy
create policy "puzzles_insert_authenticated"
  on public.puzzles
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and source in ('user', 'remix')
    and status = 'draft'
  );

-- 4. Replace the puzzle selection function with source-priority logic
create or replace function public.get_next_puzzle_for_user()
returns table (id uuid, prompt text, image_url text)
language sql stable security invoker
as $$
  ( -- Priority 1: Resume active session (has turns but none with end_reason)
    select p.id, p.prompt, p.image_url
    from public.puzzles p
    inner join public.game_turns gt on gt.puzzle_id = p.id
    where gt.user_id = auth.uid() and p.status = 'published'
    group by p.id, p.prompt, p.image_url
    having bool_or(gt.end_reason is not null) = false
    order by max(gt.created_at) desc
    limit 1
  )
  union all
  ( -- Priority 2: Random unplayed seed/import puzzle
    select p.id, p.prompt, p.image_url
    from public.puzzles p
    where p.status = 'published'
      and p.source in ('seed', 'import')
      and not exists (
        select 1 from public.game_turns gt
        where gt.puzzle_id = p.id and gt.user_id = auth.uid()
      )
    order by random()
    limit 1
  )
  union all
  ( -- Priority 3: Random unplayed user/remix puzzle (fallback)
    select p.id, p.prompt, p.image_url
    from public.puzzles p
    where p.status = 'published'
      and p.source in ('user', 'remix')
      and not exists (
        select 1 from public.game_turns gt
        where gt.puzzle_id = p.id and gt.user_id = auth.uid()
      )
    order by random()
    limit 1
  )
  limit 1;
$$;
