-- Allow anyone to read puzzle_likes for aggregate like counts on the browse panel

create policy "puzzle_likes_select_anon"
  on public.puzzle_likes
  for select
  to anon
  using (true);

-- Broaden authenticated select to all rows (not just own likes)
-- so the count aggregate works for logged-in users too
drop policy "puzzle_likes_select_authenticated" on public.puzzle_likes;

create policy "puzzle_likes_select_authenticated"
  on public.puzzle_likes
  for select
  to authenticated
  using (true);
