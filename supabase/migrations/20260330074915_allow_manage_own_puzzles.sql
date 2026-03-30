-- Allow puzzle owners to update and delete their own puzzles regardless of status.
-- Previously restricted to drafts only; now owners can unpublish and delete published puzzles too.

-- Relax UPDATE: allow owner to update any of their puzzles
drop policy "puzzles_update_authenticated" on public.puzzles;
create policy "puzzles_update_authenticated"
  on public.puzzles
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- Relax DELETE: allow owner to delete any of their puzzles
drop policy "puzzles_delete_authenticated" on public.puzzles;
create policy "puzzles_delete_authenticated"
  on public.puzzles
  for delete
  to authenticated
  using (created_by = auth.uid());

-- Add cascade on game_turns FK so deleting a puzzle cleans up associated turns
alter table public.game_turns
  drop constraint game_turns_puzzle_id_fkey,
  add constraint game_turns_puzzle_id_fkey
    foreign key (puzzle_id) references public.puzzles(id) on delete cascade;
