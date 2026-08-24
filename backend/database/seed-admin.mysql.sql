-- ============================================================
-- Créer un administrateur (ADM) — MBALA KWA SELEMANI (MySQL)
-- phpMyAdmin → SQL → Exécuter (après schema.mysql.sql)
-- ============================================================
-- Email        : admin@mbala-kwa.ci
-- Mot de passe : admin123
-- (hash bcrypt — ne jamais stocker le mot de passe en clair)

USE mbala_kwa;

INSERT INTO users (name, email, password, role, active, created_at, updated_at)
VALUES (
  'Admin Principal',
  'admin@mbala-kwa.ci',
  '$2y$10$frCXgVLAT60HrA5kUEzUielTk5XWeuyPd95dgV/8HJRLZGZe8V56q',
  'admin',
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
