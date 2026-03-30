-- Add title and slug columns to puzzles, with slug-based URLs as canonical

-- 1. Add columns as nullable first (to allow backfill)
alter table public.puzzles add column if not exists title text;
alter table public.puzzles add column if not exists slug text;

-- 2. Backfill existing rows: derive title from first ~60 chars of prompt
update public.puzzles
set title = case
  when length(prompt) <= 60 then prompt
  else left(prompt, 60) || '...'
end
where title is null;

-- 3. Backfill slugs from titles, handling duplicates with row_number suffix
with slugged as (
  select
    id,
    lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9 -]', '', 'g'), '\s+', '-', 'g')) as base_slug,
    row_number() over (
      partition by lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9 -]', '', 'g'), '\s+', '-', 'g'))
      order by created_at
    ) as rn
  from public.puzzles
  where slug is null
)
update public.puzzles p
set slug = case
  when s.rn = 1 then s.base_slug
  else s.base_slug || '-' || s.rn
end
from slugged s
where p.id = s.id;

-- 4. Set NOT NULL constraints
alter table public.puzzles alter column title set not null;
alter table public.puzzles alter column slug set not null;

-- 5. Create unique index on slug
create unique index if not exists idx_puzzles_slug on public.puzzles (slug);

-- 6. Update get_next_puzzle_for_user() to also return slug
-- Must drop first because CREATE OR REPLACE cannot change return type
drop function if exists public.get_next_puzzle_for_user();
create function public.get_next_puzzle_for_user()
returns table (id uuid, prompt text, image_url text, slug text)
language sql stable security invoker
as $$
  ( -- Priority 1: Resume active session (has turns but none with end_reason)
    select p.id, p.prompt, p.image_url, p.slug
    from public.puzzles p
    inner join public.game_turns gt on gt.puzzle_id = p.id
    where gt.user_id = auth.uid() and p.status = 'published'
    group by p.id, p.prompt, p.image_url, p.slug
    having bool_or(gt.end_reason is not null) = false
    order by max(gt.created_at) desc
    limit 1
  )
  union all
  ( -- Priority 2: Random unplayed seed/import puzzle
    select p.id, p.prompt, p.image_url, p.slug
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
    select p.id, p.prompt, p.image_url, p.slug
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
