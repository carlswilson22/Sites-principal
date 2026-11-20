export const MIGRATION_002 = `
-- Veículo completo (o front usa muito mais campos do que o schema inicial)
ALTER TABLE vehicles ADD COLUMN slug TEXT;
ALTER TABLE vehicles ADD COLUMN brand TEXT;
ALTER TABLE vehicles ADD COLUMN highlight INTEGER NOT NULL DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN original_price REAL;
ALTER TABLE vehicles ADD COLUMN tags TEXT;
ALTER TABLE vehicles ADD COLUMN features TEXT;
ALTER TABLE vehicles ADD COLUMN spec_sheet TEXT;
ALTER TABLE vehicles ADD COLUMN report_data TEXT;
ALTER TABLE vehicles ADD COLUMN dossier TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_slug ON vehicles(slug);

-- Mídia com arquivo próprio (foto ou quadro de 360°)
ALTER TABLE vehicle_photos ADD COLUMN kind TEXT NOT NULL DEFAULT 'photo';
ALTER TABLE vehicle_photos ADD COLUMN storage_key TEXT;
ALTER TABLE vehicle_photos ADD COLUMN content_type TEXT;

-- Leads: mensagem e consentimento rastreável
ALTER TABLE leads ADD COLUMN message TEXT;
ALTER TABLE leads ADD COLUMN consent_version TEXT;
ALTER TABLE leads ADD COLUMN consent_at DATETIME;

-- Contas de clientes do site (separadas da equipe)
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  consent_version TEXT,
  consent_at DATETIME,
  active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS customer_sessions (
  id TEXT PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS customer_favorites (
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id, vehicle_id)
);
CREATE TABLE IF NOT EXISTS price_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  desired_price REAL NOT NULL,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS trade_in_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  vehicle_data TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Recuperação de senha (equipe e clientes), token de uso único guardado em hash
CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_kind TEXT NOT NULL CHECK(account_kind IN ('staff','customer')),
  account_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Configuração da loja (módulos, tema, horários, taxas do simulador, franquias)
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Métricas de acesso, registradas no servidor, sem dado pessoal
CREATE TABLE IF NOT EXISTS access_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('page_view','vehicle_view','whatsapp_click')),
  page TEXT,
  vehicle_id INTEGER,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_access_events_created ON access_events(created_at);

-- Consumo de recursos com franquia (IA, consulta de placa)
CREATE TABLE IF NOT EXISTS usage_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  units INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_usage_events_kind ON usage_events(kind, created_at);
`;
