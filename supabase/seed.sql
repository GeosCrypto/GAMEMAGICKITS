-- ============================================================
-- GameMagicKit Seed Data
-- ============================================================

-- Badges
INSERT INTO public.badges (id, name, description, icon) VALUES
  ('00000000-0000-0000-0000-000000000001', 'First Prediction', 'Made your very first prediction', '🎯'),
  ('00000000-0000-0000-0000-000000000002', 'Win Streak 3', 'Won 3 predictions in a row', '🔥'),
  ('00000000-0000-0000-0000-000000000003', 'Win Streak 5', 'Won 5 predictions in a row', '⚡'),
  ('00000000-0000-0000-0000-000000000004', 'Top 10', 'Reached the top 10 on the leaderboard', '🏆'),
  ('00000000-0000-0000-0000-000000000005', 'High Roller', 'Staked 500+ credits on a single prediction', '💎'),
  ('00000000-0000-0000-0000-000000000006', 'Perfect Week', 'Won all predictions in a single week', '⭐'),
  ('00000000-0000-0000-0000-000000000007', 'Century Club', 'Made 100 total predictions', '💯'),
  ('00000000-0000-0000-0000-000000000008', 'Early Bird', 'Joined in the first month of GameMagicKit', '🐦')
ON CONFLICT (name) DO NOTHING;

-- Sample Markets
INSERT INTO public.markets (id, title, description, category, type, status, closes_at, created_at) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Will GTA VI launch in 2025?',
    'Rockstar Games confirmed a 2025 window. Will it actually ship before December 31, 2025?',
    'GAMES', 'YES_NO', 'OPEN',
    NOW() + INTERVAL '30 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Who will win the next League of Legends World Championship?',
    'Predict which region will take home the Summoner''s Cup at Worlds.',
    'ESPORTS', 'MULTI', 'OPEN',
    NOW() + INTERVAL '60 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'Will Apple release AR glasses in 2025?',
    'Following Vision Pro, will Apple announce and ship a lighter AR glasses product this year?',
    'TECH', 'YES_NO', 'OPEN',
    NOW() + INTERVAL '45 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'Will there be a new Avengers movie announced in 2025?',
    'Will Marvel officially announce a new Avengers film (beyond Secret Wars) at Comic-Con or D23?',
    'POP_CULTURE', 'YES_NO', 'OPEN',
    NOW() + INTERVAL '20 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    'Best Esports Game of 2025?',
    'Which title will dominate esports viewership and tournament prize pools in 2025?',
    'ESPORTS', 'MULTI', 'OPEN',
    NOW() + INTERVAL '90 days',
    NOW() - INTERVAL '7 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000006',
    'Will Minecraft reach 400M copies sold?',
    'Minecraft passed 300M in 2023. Will it hit 400M before end of 2025?',
    'GAMES', 'YES_NO', 'CLOSED',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '30 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000007',
    'Will GPT-5 be released before June 2025?',
    'OpenAI has been teasing next-generation models. Will GPT-5 launch publicly before June 2025?',
    'TECH', 'YES_NO', 'SETTLED',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '60 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000008',
    'Which console will outsell the others in Q4 2025?',
    'Holiday 2025 console sales battle: PS5 Pro vs Xbox Series X vs Nintendo Switch 2.',
    'GAMES', 'MULTI', 'OPEN',
    NOW() + INTERVAL '120 days',
    NOW() - INTERVAL '4 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Market Options
INSERT INTO public.market_options (market_id, label, order_index) VALUES
  -- GTA VI (YES_NO)
  ('a0000000-0000-0000-0000-000000000001', 'Yes', 0),
  ('a0000000-0000-0000-0000-000000000001', 'No', 1),

  -- LoL Worlds (MULTI)
  ('a0000000-0000-0000-0000-000000000002', 'Korea (LCK)', 0),
  ('a0000000-0000-0000-0000-000000000002', 'China (LPL)', 1),
  ('a0000000-0000-0000-0000-000000000002', 'Europe (LEC)', 2),
  ('a0000000-0000-0000-0000-000000000002', 'North America (LCS)', 3),

  -- Apple AR Glasses (YES_NO)
  ('a0000000-0000-0000-0000-000000000003', 'Yes', 0),
  ('a0000000-0000-0000-0000-000000000003', 'No', 1),

  -- Avengers (YES_NO)
  ('a0000000-0000-0000-0000-000000000004', 'Yes', 0),
  ('a0000000-0000-0000-0000-000000000004', 'No', 1),

  -- Best Esports Game (MULTI)
  ('a0000000-0000-0000-0000-000000000005', 'League of Legends', 0),
  ('a0000000-0000-0000-0000-000000000005', 'Valorant', 1),
  ('a0000000-0000-0000-0000-000000000005', 'CS2', 2),
  ('a0000000-0000-0000-0000-000000000005', 'Dota 2', 3),
  ('a0000000-0000-0000-0000-000000000005', 'Other', 4),

  -- Minecraft 400M (YES_NO)
  ('a0000000-0000-0000-0000-000000000006', 'Yes', 0),
  ('a0000000-0000-0000-0000-000000000006', 'No', 1),

  -- GPT-5 (YES_NO, settled)
  ('a0000000-0000-0000-0000-000000000007', 'Yes', 0),
  ('a0000000-0000-0000-0000-000000000007', 'No', 1),

  -- Console Sales (MULTI)
  ('a0000000-0000-0000-0000-000000000008', 'PlayStation 5 Pro', 0),
  ('a0000000-0000-0000-0000-000000000008', 'Xbox Series X', 1),
  ('a0000000-0000-0000-0000-000000000008', 'Nintendo Switch 2', 2)
ON CONFLICT DO NOTHING;

-- Update settled market resolved outcome
UPDATE public.markets SET resolved_outcome = 'No' WHERE id = 'a0000000-0000-0000-0000-000000000007';
