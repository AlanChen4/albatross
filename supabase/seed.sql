-- Seed: one sample lateral thinking puzzle
insert into public.puzzles (id, title, slug, prompt, solution, image_url, source, status)
values (
  'a0000000-0000-0000-0000-000000000001',
  'Albatross Soup',
  'albatross-soup',
  'A man walks into a restaurant and orders albatross soup. After taking one sip, he leaves the restaurant, goes home, and kills himself. Why?',
  'The man was once stranded on a desert island with other survivors after a shipwreck. When food ran out, he was told they caught and cooked an albatross. In reality, they had used the flesh of his wife, who had died. Years later, when he tasted real albatross soup at the restaurant, he realized it tasted completely different from what he was given on the island. He understood the horrifying truth of what he had actually eaten, and the grief and horror drove him to take his own life.',
  'https://i.imgur.com/YzQBafT.png',
  'seed',
  'published'
)
on conflict (id) do nothing;

insert into public.puzzles (id, title, slug, prompt, solution, image_url, source, status)
values (
  'a0000000-0000-0000-0000-000000000002',
  'The Candle in the Window',
  'the-candle-in-the-window',
  'Every night for ten years, an old woman placed a lit candle in her upstairs window before going to sleep. One winter night, she forgot. The next morning, three people were dead.',
  'The woman lived on a cliff near a dangerous stretch of coastline. The candle in her upstairs window was not sentimental decoration — it was an unofficial landmark that sailors had come to rely on to tell where the rocks were and where shore safely curved away. That night, in a storm, a small boat mistook its position in the darkness. It crashed against the rocks below. Three people drowned. What looked like a private ritual was secretly keeping strangers alive.',
  null,
  'seed',
  'published'
)
on conflict (id) do nothing;

insert into public.puzzles (id, title, slug, prompt, solution, image_url, source, status)
values (
  'a0000000-0000-0000-0000-000000000003',
  'The Basement Door',
  'the-basement-door',
  'A man buys an old house at a suspiciously low price. During the tour, he is told never to open the basement door. He laughs, buys the house anyway, and on his first night uses a crowbar to force it open. He looks inside, screams, slams it shut, and immediately calls the police. When the police arrive, they arrest him for murder.',
  'The basement was empty except for walls covered in photographs — hundreds of them — all showing the inside of the house from impossible angles: from under beds, inside closets, outside the shower curtain, beside sleeping people. He screams because he realizes someone had been secretly living inside the house and watching the former owners. But the police arrest him because among the newer photographs are pictures of his own wife, who had supposedly died years earlier in a home invasion he claimed to have survived. He had killed his wife in that house long ago, when he was using it under another identity, and the hidden photographer had unknowingly documented evidence tying him to the crime. The basement didn''t contain a body. It contained memory — and proof.',
  null,
  'seed',
  'published'
)
on conflict (id) do nothing;

insert into public.puzzles (id, title, slug, prompt, solution, image_url, source, status)
values (
  'a0000000-0000-0000-0000-000000000004',
  'The Sleeping Child',
  'the-sleeping-child',
  'Late at night, a woman is alone in a train car except for a sleeping child across from her. At every stop, she becomes more and more terrified that the child will wake up. When the train reaches the final station, the child opens his eyes. The woman starts crying with relief.',
  'Earlier that evening, the woman had kidnapped the child from a crowded station, intending to demand ransom. She drugged him so he would stay unconscious during the trip. As the train ride went on, she began hearing police announcements and seeing officers move through stations. Then she noticed the child''s breathing had become shallow. She realized she may have given him too much. By the final station, she is no longer afraid of being caught — she is terrified that she has killed him. When he opens his eyes, she cries in relief because it means he is still alive. The "threat" was never the child waking up and exposing her — it was the possibility that he never would.',
  null,
  'seed',
  'published'
)
on conflict (id) do nothing;

