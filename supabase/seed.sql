-- Seed: one sample lateral thinking puzzle
insert into public.puzzles (id, prompt, solution, image_url, source, status)
values (
  'a0000000-0000-0000-0000-000000000001',
  'A man walks into a restaurant and orders albatross soup. After taking one sip, he leaves the restaurant, goes home, and kills himself. Why?',
  'The man was once stranded on a desert island with other survivors after a shipwreck. When food ran out, he was told they caught and cooked an albatross. In reality, they had used the flesh of his wife, who had died. Years later, when he tasted real albatross soup at the restaurant, he realized it tasted completely different from what he was given on the island. He understood the horrifying truth of what he had actually eaten, and the grief and horror drove him to take his own life.',
  'https://i.imgur.com/YzQBafT.png',
  'seed',
  'published'
)
on conflict (id) do nothing;

-- Schedule the seed puzzle for a known date
insert into public.puzzle_schedule (release_date, puzzle_id)
values ('2025-01-01', 'a0000000-0000-0000-0000-000000000001')
on conflict (release_date) do nothing;
