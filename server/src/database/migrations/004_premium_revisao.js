export const MIGRATION_004 = `
-- Venda real: preço efetivamente vendido e data da venda (base do financeiro, comissões e consignação)
ALTER TABLE vehicles ADD COLUMN sale_price REAL;
ALTER TABLE vehicles ADD COLUMN sold_at TEXT;
UPDATE vehicles SET sold_at = COALESCE(updated_at, created_at), sale_price = price WHERE status = 'vendido' AND sold_at IS NULL;
`;
