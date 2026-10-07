-- Coût d'achat réel (Hostinger / MySQL déjà en place)
-- Exécuter dans phpMyAdmin sur la base u192070974_mbalaka_kwa

ALTER TABLE products
  ADD COLUMN cost_price INT UNSIGNED NOT NULL DEFAULT 0 AFTER price_wholesale;

ALTER TABLE sale_items
  ADD COLUMN unit_cost INT UNSIGNED NOT NULL DEFAULT 0 AFTER unit_price;

-- Amorçage optionnel : estimation initiale à partir du prix gros
UPDATE products
SET cost_price = ROUND(price_wholesale * 0.75)
WHERE cost_price = 0 AND price_wholesale > 0;
