-- Corrige les mots de passe démo (hashes invalides dans la première version du SQL)
-- Exécuter dans phpMyAdmin sur la base u192070974_mbalaka_kwa

UPDATE users SET password = '$2y$12$hV8clTJ4jDD3yGnFbKHwkuO.rgzfOtvtr2HOgxneJZmWwKYJk5QX.' WHERE email = 'admin@mbala-kwa.ci';
UPDATE users SET password = '$2y$12$RhjF2DFLR3BzBCzIWSS3vOSq5pd43bWwXcA4VUwVGdyEkWLBz5XdG' WHERE email = 'marie@mbala-kwa.ci';
UPDATE users SET password = '$2y$12$.9Zsh6gqJuKCtR4fYbJM6e3L3BSVbAB2Er9fhjJcmL/xMd4CZRgCm' WHERE email = 'manager@mbala-kwa.ci';

-- admin@mbala-kwa.ci   → admin123
-- marie@mbala-kwa.ci   → vendeur123
-- manager@mbala-kwa.ci → manager123
