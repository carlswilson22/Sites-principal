/**
 * server/src/database/schema.js
 * Definição estrita das tabelas SQLite para o Painel do Lojista.
 * Isolamento total por instalação (banco dedicado da loja).
 */

export const SCHEMA_SQL = `
-- Configuração de integridade e desempenho SQLite
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- 1. Usuários e Acesso
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('proprietario', 'gerente', 'atendente')),
  tier INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sessões Ativas (Cookie Seguro / Revogação)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Estoque de Veículos
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  version TEXT,
  category TEXT NOT NULL DEFAULT 'sedan',
  year TEXT NOT NULL,
  km INTEGER NOT NULL DEFAULT 0,
  transmission TEXT NOT NULL DEFAULT 'Automático',
  fuel TEXT NOT NULL DEFAULT 'Flex',
  color TEXT NOT NULL,
  doors INTEGER DEFAULT 4,
  engine TEXT,
  power TEXT,
  price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'disponivel' CHECK(status IN ('disponivel', 'reservado', 'vendido')),
  ownership_type TEXT NOT NULL DEFAULT 'proprio' CHECK(ownership_type IN ('proprio', 'consignado', 'parceiro')),
  is_published INTEGER NOT NULL DEFAULT 1,
  days_in_stock INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  fipe_reference_price REAL,
  fipe_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Fotos dos Veículos (até 20 fotos por carro, ordem e capa)
CREATE TABLE IF NOT EXISTS vehicle_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_cover INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  file_size INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Custos do Carro e Informações de Consumo (Nível 2+)
CREATE TABLE IF NOT EXISTS vehicle_costs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER UNIQUE NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  city_consumption REAL,
  road_consumption REAL,
  tank_capacity INTEGER,
  avg_maintenance REAL,
  annual_insurance REAL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Lançamentos Financeiros por Carro (Nível 2+)
CREATE TABLE IF NOT EXISTS vehicle_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK(category IN ('compra', 'documentacao', 'funilaria', 'mecanica', 'pecas', 'estetica', 'outros')),
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  expense_date DATE NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Contatos e Oportunidades (Leads)
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT NOT NULL DEFAULT 'site_formulario' CHECK(source IN ('site_formulario', 'site_whatsapp', 'simulador_financiamento', 'avaliacao_troca')),
  temperature TEXT NOT NULL DEFAULT 'morno' CHECK(temperature IN ('quente', 'morno', 'frio')),
  status TEXT NOT NULL DEFAULT 'novo' CHECK(status IN ('novo', 'em_atendimento', 'ganho', 'perdido')),
  assigned_to INTEGER REFERENCES users(id),
  simulation_data TEXT, -- JSON com entrada, parcelas, taxa Price
  consent_lgpd INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Histórico do Contato (Timeline CRM - Nível 2+)
CREATE TABLE IF NOT EXISTS lead_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Cadastro de Clientes (Reaproveitável nos Contratos, LGPD - Nível 2+)
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  cpf_encrypted TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address_encrypted TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Contratos Emitidos (PDF, Termos e Vistorias - Nível 2 e 3)
CREATE TABLE IF NOT EXISTS contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('compra_venda', 'recibo_sinal', 'vistoria_simples', 'consignacao', 'compra_venda_troca', 'termo_aditivo')),
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  parent_contract_id INTEGER REFERENCES contracts(id), -- Para aditivos (Nível 3)
  terms_data TEXT NOT NULL, -- JSON com valores, testemunhas, checklists
  status TEXT NOT NULL DEFAULT 'emitido' CHECK(status IN ('rascunho', 'emitido', 'assinado', 'cancelado')),
  pdf_path TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Gestão de Consignação Completa (Nível 3)
CREATE TABLE IF NOT EXISTS consignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER UNIQUE NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_cpf_encrypted TEXT NOT NULL,
  owner_bank_data_encrypted TEXT,
  remuneration_type TEXT NOT NULL CHECK(remuneration_type IN ('percentual', 'valor_liquido')),
  remuneration_value REAL NOT NULL,
  min_remuneration REAL DEFAULT 0,
  service_fee REAL DEFAULT 0,
  daily_storage_fee REAL DEFAULT 0,
  contract_start DATE NOT NULL,
  contract_end DATE NOT NULL,
  payout_deadline_days INTEGER DEFAULT 5,
  advanced_expenses REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK(status IN ('ativo', 'liquidado', 'cancelado', 'expirado')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Publicações em Mídia Social (Instagram Story - Nível 3)
CREATE TABLE IF NOT EXISTS social_publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'instagram_story',
  status TEXT NOT NULL DEFAULT 'nao_configurado' CHECK(status IN ('nao_configurado', 'fila', 'publicado', 'erro')),
  external_media_id TEXT,
  response_log TEXT,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. Auditoria Estrita e LGPD (Quem, O quê, Quando - Nível 3)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. Índices Estratégicos para Otimização de Consultas
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_days ON vehicles(days_in_stock);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_contracts_code ON contracts(code);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
`;

