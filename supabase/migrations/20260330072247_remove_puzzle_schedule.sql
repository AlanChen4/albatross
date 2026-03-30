-- Remove daily puzzle scheduling in favor of per-user random puzzle selection

-- Drop scheduling table and its policies
drop policy if exists "puzzle_schedule_select_anon" on public.puzzle_schedule;
drop policy if exists "puzzle_schedule_select_authenticated" on public.puzzle_schedule;
drop table if exists public.puzzle_schedule;

-- RPC: returns the user's active session puzzle, or a random unplayed puzzle
create or replace function public.get_next_puzzle_for_user()
returns table (id uuid, prompt text, image_url text)
language sql stable security invoker
as $$
  (
    -- Step 1: Active session (has turns but none with end_reason)
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
  (
    -- Step 2: Random unplayed puzzle
    select p.id, p.prompt, p.image_url
    from public.puzzles p
    where p.status = 'published'
      and not exists (
        select 1 from public.game_turns gt
        where gt.puzzle_id = p.id and gt.user_id = auth.uid()
      )
    order by random()
    limit 1
  )
  limit 1;
$$;
