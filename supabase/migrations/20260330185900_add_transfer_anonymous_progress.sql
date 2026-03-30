-- Transfer game progress from an anonymous user to the current authenticated user.
-- Used after OAuth sign-in to preserve progress from the anonymous session.

create or replace function public.transfer_anonymous_progress(old_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new_user_id uuid := auth.uid();
begin
  -- Only transfer from verified anonymous users to non-anonymous users
  if not exists (select 1 from auth.users where id = old_user_id and is_anonymous = true) then
    return;
  end if;
  if exists (select 1 from auth.users where id = v_new_user_id and is_anonymous = true) then
    return;
  end if;

  -- Transfer game_turns only for puzzles the authenticated user hasn't played
  update public.game_turns set user_id = v_new_user_id
  where user_id = old_user_id
    and puzzle_id not in (select puzzle_id from public.game_turns where user_id = v_new_user_id);

  -- Delete remaining anonymous game_turns (user already had progress on those puzzles)
  delete from public.game_turns where user_id = old_user_id;

  -- Transfer puzzle_likes, skip conflicts (composite PK: user_id, puzzle_id)
  insert into public.puzzle_likes (user_id, puzzle_id, created_at)
  select v_new_user_id, puzzle_id, created_at
  from public.puzzle_likes where user_id = old_user_id
  on conflict (user_id, puzzle_id) do nothing;

  delete from public.puzzle_likes where user_id = old_user_id;
end;
$$;
