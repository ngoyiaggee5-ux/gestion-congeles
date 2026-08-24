-- Corriger les mots de passe démo (MySQL / phpMyAdmin)
USE mbala_kwa;

UPDATE users SET password = '$2y$10$frCXgVLAT60HrA5kUEzUielTk5XWeuyPd95dgV/8HJRLZGZe8V56q', updated_at = NOW()
WHERE email = 'admin@mbala-kwa.ci';

UPDATE users SET password = '$2y$10$vJXs6UY5biO6zSihk74VMOdYZ4h4h30QeZR6QanCgX8e7iEggc9A.', updated_at = NOW()
WHERE email = 'marie@mbala-kwa.ci';

UPDATE users SET password = '$2y$10$9Vfbzp6RWfTWFyB2wJITlO9bvrizK.QHouzdjLxCE4KuxlKz8lITG', updated_at = NOW()
WHERE email = 'manager@mbala-kwa.ci';

-- admin@mbala-kwa.ci / admin123
-- marie@mbala-kwa.ci / vendeur123
-- manager@mbala-kwa.ci / manager123
