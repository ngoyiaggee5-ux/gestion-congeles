-- ============================================================
-- MBALA KWA SELEMANI — Schéma PostgreSQL (Supabase)
-- Exécuter dans : Supabase → SQL Editor → New query
-- ============================================================

-- Types ENUM
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'manager', 'vendeur');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE client_type AS ENUM ('détail', 'gros');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sale_type AS ENUM ('détail', 'gros');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sale_status AS ENUM ('payée', 'annulée');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('émise', 'payée', 'annulée');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE stock_movement_type AS ENUM ('entrée', 'sortie');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'vendeur',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    remember_token  VARCHAR(100),
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ
);

-- Tokens API (Laravel Sanctum)
CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id              BIGSERIAL PRIMARY KEY,
    tokenable_type  VARCHAR(255) NOT NULL,
    tokenable_id    BIGINT NOT NULL,
    name            TEXT NOT NULL,
    token           VARCHAR(64) NOT NULL UNIQUE,
    abilities       TEXT,
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_index
    ON personal_access_tokens (tokenable_type, tokenable_id);
CREATE INDEX IF NOT EXISTS personal_access_tokens_expires_at_index
    ON personal_access_tokens (expires_at);

-- Catégories
CREATE TABLE IF NOT EXISTS categories (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ
);

-- Produits
CREATE TABLE IF NOT EXISTS products (
    id              BIGSERIAL PRIMARY KEY,
    category_id     BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    sku             VARCHAR(255) NOT NULL UNIQUE,
    unit            VARCHAR(255) NOT NULL DEFAULT 'kg',
    price_retail    INTEGER NOT NULL DEFAULT 0 CHECK (price_retail >= 0),
    price_wholesale INTEGER NOT NULL DEFAULT 0 CHECK (price_wholesale >= 0),
    stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock       INTEGER NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
    description     TEXT,
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(255),
    email           VARCHAR(255),
    type            client_type NOT NULL DEFAULT 'détail',
    address         VARCHAR(255),
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ
);

-- Ventes
CREATE TABLE IF NOT EXISTS sales (
    id              BIGSERIAL PRIMARY KEY,
    number          VARCHAR(255) NOT NULL UNIQUE,
    type            sale_type NOT NULL,
    client_id       BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    client_name     VARCHAR(255),
    payment_method  VARCHAR(255) NOT NULL,
    status          sale_status NOT NULL DEFAULT 'payée',
    total           INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ
);

-- Lignes de vente
CREATE TABLE IF NOT EXISTS sale_items (
    id              BIGSERIAL PRIMARY KEY,
    sale_id         BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_price      INTEGER NOT NULL CHECK (unit_price >= 0),
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ
);

-- Factures
CREATE TABLE IF NOT EXISTS invoices (
    id              BIGSERIAL PRIMARY KEY,
    number          VARCHAR(255) NOT NULL UNIQUE,
    sale_id         BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    client_id       BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    client_name     VARCHAR(255),
    total           INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),
    status          invoice_status NOT NULL DEFAULT 'émise',
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ
);

-- Mouvements de stock
CREATE TABLE IF NOT EXISTS stock_movements (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type            stock_movement_type NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost       INTEGER NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
    reference       VARCHAR(255),
    note            VARCHAR(255),
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ
);

-- Paramètres application
CREATE TABLE IF NOT EXISTS settings (
    id              BIGSERIAL PRIMARY KEY,
    key             VARCHAR(255) NOT NULL UNIQUE,
    value           JSONB NOT NULL,
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ
);

-- Suivi migrations Laravel (si vous utilisez php artisan migrate)
CREATE TABLE IF NOT EXISTS migrations (
    id              SERIAL PRIMARY KEY,
    migration       VARCHAR(255) NOT NULL,
    batch           INTEGER NOT NULL
);

-- Index utiles
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_sales_client ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_invoices_sale ON invoices(sale_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
