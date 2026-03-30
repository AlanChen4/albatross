-- Change game_turns.id from bigint (identity) to uuid
-- Identity must be dropped in a separate statement before the type can be changed

alter table public.game_turns
  alter column id drop identity if exists;

alter table public.game_turns
  alter column id set data type uuid using gen_random_uuid(),
  alter column id set default gen_random_uuid();
