/**
 * server/src/database/migrations/index.js
 * Migrações numeradas e imutáveis. Nunca editar uma migração já publicada:
 * criar uma nova. Cada uma roda uma única vez por instalação.
 */
import { SCHEMA_SQL } from '../schema.js';
import { MIGRATION_002 } from './002_m2_schema.js';
import { MIGRATION_003 } from './003_primeiro_acesso.js';
import { MIGRATION_004 } from './004_premium_revisao.js';

export const migrations = [
  // 001 usa CREATE IF NOT EXISTS, então é segura em bancos criados antes do runner existir.
  { id: 1, name: 'schema_inicial', sql: SCHEMA_SQL },
  { id: 2, name: 'm2_catalogo_clientes_configuracao', sql: MIGRATION_002 },
  { id: 3, name: 'primeiro_acesso', sql: MIGRATION_003 },
  { id: 4, name: 'premium_revisao_vendas', sql: MIGRATION_004 }
];
