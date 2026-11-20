export const MIGRATION_003 = `
-- Contas criadas por provisionamento ou por redefinição administrativa exigem troca de senha no primeiro acesso
ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0;
`;
