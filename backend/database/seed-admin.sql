-- ============================================================
-- Créer un administrateur (ADM) — MBALA KWA SELEMANI
-- Supabase → SQL Editor → New query → Run
-- ============================================================
-- Email    : admin@mbala-kwa.ci
-- Mot de passe : admin123
-- (hash bcrypt — ne jamais stocker le mot de passe en clair)

INSERT INTO users (name, email, password, role, active, created_at, updated_at)
VALUES (
  'Admin Principal',
  'admin@mbala-kwa.ci',
  '$2y$10$9BkY2f93kFAWwhVMEOWS9ur/B5bhC4QvyZD4Wu42O3KnFQ7TEs8cy',
  'admin',
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
