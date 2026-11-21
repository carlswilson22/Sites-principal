export const MIGRATION_005 = `
ALTER TABLE leads ADD COLUMN marketing_source TEXT;
ALTER TABLE leads ADD COLUMN marketing_campaign TEXT;
ALTER TABLE leads ADD COLUMN marketing_medium TEXT;
ALTER TABLE leads ADD COLUMN next_action TEXT;
ALTER TABLE leads ADD COLUMN next_action_at TEXT;
`;
