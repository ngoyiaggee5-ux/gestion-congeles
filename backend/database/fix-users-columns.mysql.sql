-- Corriger les noms de colonnes (Windows/phpMyAdmin met parfois NAME/PASSWORD en majuscules)
USE mbala_kwa;

ALTER TABLE users CHANGE COLUMN `NAME` `name` VARCHAR(255) NOT NULL;
ALTER TABLE users CHANGE COLUMN `PASSWORD` `password` VARCHAR(255) NOT NULL;
