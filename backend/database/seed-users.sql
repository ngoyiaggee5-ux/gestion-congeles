-- ============================================================
-- Comptes de démo — MBALA KWA SELEMANI
-- Supabase → SQL Editor → Run (après schema.postgresql.sql)
-- ============================================================

INSERT INTO users (name, email, password, role, active, created_at, updated_at)
VALUES
(
  'Admin Principal',
  'admin@mbala-kwa.ci',
  '$2y$10$9BkY2f93kFAWwhVMEOWS9ur/B5bhC4QvyZD4Wu42O3KnFQ7TEs8cy',
  'admin',
  TRUE,
  NOW(),
  NOW()
),
(
  'Marie Vendeur',
  'marie@mbala-kwa.ci',
  '$2y$10$m8pvsZIerffXnx5CY6AIqeYCIxZzbzuBQdEW5gzT9Xcj1mk1InONW',
  'vendeur',
  TRUE,
  NOW(),
  NOW()
),
(
  'Paul Manager',
  'manager@mbala-kwa.ci',
  '$2y$10$ROqA8ii16aiR7QPv90klqOpD.Devb/3qxQG.nAZZ/ygKs06Mx3I/K',
  'manager',
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- admin@mbala-kwa.ci     → admin123
-- marie@mbala-kwa.ci     → vendeur123
-- manager@mbala-kwa.ci   → manager123
