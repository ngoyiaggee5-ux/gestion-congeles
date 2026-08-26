-- ============================================================
-- MBALA KWA SELEMANI — Schéma MySQL (XAMPP / phpMyAdmin)
-- Exécuter dans : phpMyAdmin → SQL → coller → Exécuter
-- ============================================================

CREATE DATABASE IF NOT EXISTS mbala_kwa
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mbala_kwa;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS personal_access_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS migrations;

SET FOREIGN_KEY_CHECKS = 1;

-- Utilisateurs
CREATE TABLE users (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    `password`      VARCHAR(255) NOT NULL,
    role            ENUM('admin', 'manager', 'vendeur') NOT NULL DEFAULT 'vendeur',
    active          TINYINT(1) NOT NULL DEFAULT 1,
    remember_token  VARCHAR(100) NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tokens API (Laravel Sanctum)
CREATE TABLE personal_access_tokens (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tokenable_type  VARCHAR(255) NOT NULL,
    tokenable_id    BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(255) NOT NULL,
    token           VARCHAR(64) NOT NULL,
    abilities       TEXT NULL,
    last_used_at    TIMESTAMP NULL,
    expires_at      TIMESTAMP NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY personal_access_tokens_token_unique (token),
    KEY personal_access_tokens_tokenable_index (tokenable_type, tokenable_id),
    KEY personal_access_tokens_expires_at_index (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Catégories
CREATE TABLE categories (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(255) NOT NULL,
    description     TEXT NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY categories_name_unique (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Produits
CREATE TABLE products (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    category_id     BIGINT UNSIGNED NOT NULL,
    `name`          VARCHAR(255) NOT NULL,
    sku             VARCHAR(255) NOT NULL,
    unit            VARCHAR(255) NOT NULL DEFAULT 'kg',
    price_retail    INT UNSIGNED NOT NULL DEFAULT 0,
    price_wholesale INT UNSIGNED NOT NULL DEFAULT 0,
    stock           INT UNSIGNED NOT NULL DEFAULT 0,
    min_stock       INT UNSIGNED NOT NULL DEFAULT 0,
    description     TEXT NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY products_sku_unique (sku),
    KEY idx_products_category (category_id),
    CONSTRAINT products_category_id_foreign
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clients
CREATE TABLE clients (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(255) NOT NULL,
    phone           VARCHAR(255) NULL,
    email           VARCHAR(255) NULL,
    `type`          ENUM('détail', 'gros') NOT NULL DEFAULT 'détail',
    address         VARCHAR(255) NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY clients_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ventes
CREATE TABLE sales (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `number`        VARCHAR(255) NOT NULL,
    `type`          ENUM('détail', 'gros') NOT NULL,
    client_id       BIGINT UNSIGNED NULL,
    client_name     VARCHAR(255) NULL,
    payment_method  VARCHAR(255) NOT NULL,
    `status`        ENUM('payée', 'annulée') NOT NULL DEFAULT 'payée',
    total           INT UNSIGNED NOT NULL DEFAULT 0,
    user_id         BIGINT UNSIGNED NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY sales_number_unique (number),
    KEY idx_sales_client (client_id),
    KEY idx_sales_user (user_id),
    CONSTRAINT sales_client_id_foreign
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    CONSTRAINT sales_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lignes de vente
CREATE TABLE sale_items (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    sale_id         BIGINT UNSIGNED NOT NULL,
    product_id      BIGINT UNSIGNED NOT NULL,
    quantity        INT UNSIGNED NOT NULL,
    unit_price      INT UNSIGNED NOT NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    PRIMARY KEY (id),
    KEY idx_sale_items_sale (sale_id),
    CONSTRAINT sale_items_sale_id_foreign
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    CONSTRAINT sale_items_product_id_foreign
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Factures
CREATE TABLE invoices (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `number`        VARCHAR(255) NOT NULL,
    sale_id         BIGINT UNSIGNED NOT NULL,
    client_id       BIGINT UNSIGNED NULL,
    client_name     VARCHAR(255) NULL,
    total           INT UNSIGNED NOT NULL DEFAULT 0,
    `status`        ENUM('émise', 'payée', 'annulée') NOT NULL DEFAULT 'émise',
    verification_code VARCHAR(32) NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY invoices_number_unique (number),
    KEY idx_invoices_sale (sale_id),
    CONSTRAINT invoices_sale_id_foreign
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    CONSTRAINT invoices_client_id_foreign
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mouvements de stock
CREATE TABLE stock_movements (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    product_id      BIGINT UNSIGNED NOT NULL,
    `type`          ENUM('entrée', 'sortie') NOT NULL,
    quantity        INT UNSIGNED NOT NULL,
    unit_cost       INT UNSIGNED NOT NULL DEFAULT 0,
    reference       VARCHAR(255) NULL,
    note            VARCHAR(255) NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    PRIMARY KEY (id),
    KEY idx_stock_movements_product (product_id),
    CONSTRAINT stock_movements_product_id_foreign
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Journal d'activité
CREATE TABLE activity_logs (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NULL,
    user_name       VARCHAR(255) NOT NULL,
    action          VARCHAR(255) NOT NULL,
    entity_type     VARCHAR(255) NULL,
    entity_id       BIGINT UNSIGNED NULL,
    summary         VARCHAR(255) NOT NULL,
    meta            JSON NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    PRIMARY KEY (id),
    KEY idx_activity_logs_user (user_id),
    CONSTRAINT activity_logs_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Paramètres application
CREATE TABLE settings (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `key`           VARCHAR(255) NOT NULL,
    `value`         JSON NOT NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY settings_key_unique (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Suivi migrations Laravel (optionnel)
CREATE TABLE migrations (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    migration       VARCHAR(255) NOT NULL,
    batch           INT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
