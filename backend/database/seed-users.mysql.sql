-- ============================================================
-- Comptes de démo — MBALA KWA SELEMANI (MySQL / XAMPP)
-- Exécuter APRÈS schema.mysql.sql dans phpMyAdmin
-- ============================================================
USE mbala_kwa;

INSERT INTO users (name, email, password, role, active, created_at, updated_at)
VALUES
(

  'Admin Principal',
  'admin@mbala-kwa.ci',
  '$2y$10$frCXgVLAT60HrA5kUEzUielTk5XWeuyPd95dgV/8HJRLZGZe8V56q',
  'admin',
  1,
  NOW(),
  NOW()
),
(
  'Marie Vendeur',
  'marie@mbala-kwa.ci',
  '$2y$10$vJXs6UY5biO6zSihk74VMOdYZ4h4h30QeZR6QanCgX8e7iEggc9A.',
  'vendeur',
  1,
  NOW(),
  NOW()
),
(
  'Paul Manager',
  'manager@mbala-kwa.ci',
  '$2y$10$9Vfbzp6RWfTWFyB2wJITlO9bvrizK.QHouzdjLxCE4KuxlKz8lITG',
  'manager',
  1,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = VALUES(role),
  active = VALUES(active),
  updated_at = NOW();

-- admin@mbala-kwa.ci     → admin123
-- marie@mbala-kwa.ci     → vendeur123
-- manager@mbala-kwa.ci   → manager123
