/**
 * server/src/database/seed.js
 * Carga de dados de demonstração 100% FICTÍCIOS para testes e modo de exibição.
 * Nunca utiliza nomes, documentos ou contatos reais.
 */
import { getDb } from './db.js';
import { hashPassword, encryptSensitive } from '../security/crypto.js';

export async function runSeed(tier = 1) {
  const db = getDb();

  // Verifica se já existem usuários para não duplicar seed
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count > 0) {
    return { message: 'Banco já contém registros. Seed ignorado.' };
  }

  // 1. Usuários Fictícios com Perfis Distintos (RBAC)
  const defaultPassword = await hashPassword('Admin@123456');
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, tier, active)
    VALUES (?, ?, ?, ?, ?, 1)
  `);

  insertUser.run('Carlos Silva (Proprietário)', 'proprietario@lojaexemplo.com.br', defaultPassword, 'proprietario', tier);
  insertUser.run('Renata Souza (Gerente)', 'gerente@lojaexemplo.com.br', defaultPassword, 'gerente', tier);
  insertUser.run('Lucas Lima (Atendente)', 'atendente@lojaexemplo.com.br', defaultPassword, 'atendente', tier);

  // 2. Veículos Fictícios de Demonstração
  const insertVehicle = db.prepare(`
    INSERT INTO vehicles (title, version, category, year, km, transmission, fuel, color, doors, engine, power, price, status, ownership_type, is_published, days_in_stock, notes, fipe_reference_price, fipe_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Carro 1: Estoque próprio, ativo
  const c1 = insertVehicle.run(
    'Sedan Urbano Confort', '1.0 Flex Manual', 'sedan', '2022/2023', 28500,
    'Manual', 'Flex', 'Prata Sirius', 4, '1.0 3 cil.', '82 cv', 68900,
    'disponivel', 'proprio', 1, 14, 'Veículo de único dono, revisões em concessionária.', 69500, '001234-5'
  );

  // Carro 2: SUV Premium, estoque há 65 dias (alerta de parado > 60d)
  const c2 = insertVehicle.run(
    'Aventureiro Cross Pro', '1.6 16V Automático', 'suv', '2021/2022', 49200,
    'Automático', 'Flex', 'Cinza Chumbo', 4, '1.6 16V', '118 cv', 89900,
    'disponivel', 'proprio', 1, 68, 'Requer revisão de preço sugerida pelo sistema de giro.', 91200, '002345-6'
  );

  // Carro 3: Hatch Econômico, Consignado (Nível 3)
  const c3 = insertVehicle.run(
    'Compacto Smart Plus', '1.0 Turbo AT', 'hatch', '2023/2024', 12300,
    'Automático', 'Flex', 'Branco Polar', 4, '1.0 Turbo', '105 cv', 77500,
    'disponivel', 'consignado', 1, 8, 'Consignação com proprietário particular.', 78000, '003456-7'
  );

  // Carro 4: Vendido no mês (para métricas)
  const c4 = insertVehicle.run(
    'Executivo Sport Line', '2.0 Turbo AWD', 'sedan', '2022/2022', 34000,
    'Automático', 'Gasolina', 'Preto Obsidian', 4, '2.0 Turbo', '211 cv', 145000,
    'vendido', 'proprio', 0, 42, 'Venda fechada com financiamento aprovado.', 144500, '004567-8'
  );

  // 3. Fotos dos Veículos
  const insertPhoto = db.prepare(`
    INSERT INTO vehicle_photos (vehicle_id, url, is_cover, order_index)
    VALUES (?, ?, ?, ?)
  `);

  insertPhoto.run(c1.lastInsertRowid, '/images/FotoPoloTSI.jpg', 1, 0);
  insertPhoto.run(c1.lastInsertRowid, '/images/carro_lataria_amassada.jpg', 0, 1);
  insertPhoto.run(c2.lastInsertRowid, '/images/FotoChevroletTracker.jpg', 1, 0);
  insertPhoto.run(c3.lastInsertRowid, '/images/FotoFiatPulse.jpg', 1, 0);
  insertPhoto.run(c4.lastInsertRowid, '/images/FotoCorollaCross.jpg', 1, 0);

  // 4. Custos e Gastos Fictícios (Nível 2 e 3)
  const insertCosts = db.prepare(`
    INSERT INTO vehicle_costs (vehicle_id, city_consumption, road_consumption, tank_capacity, avg_maintenance, annual_insurance)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertCosts.run(c1.lastInsertRowid, 12.8, 14.5, 52, 650.00, 2400.00);
  insertCosts.run(c2.lastInsertRowid, 9.4, 11.8, 60, 920.00, 3100.00);

  const insertExpense = db.prepare(`
    INSERT INTO vehicle_expenses (vehicle_id, category, description, amount, expense_date, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertExpense.run(c1.lastInsertRowid, 'compra', 'Aquisição do veículo em leilão/troca', 58000.00, '2026-10-10', 1);
  insertExpense.run(c1.lastInsertRowid, 'estetica', 'Polimento técnico e higienização interna', 450.00, '2026-10-12', 1);
  insertExpense.run(c1.lastInsertRowid, 'documentacao', 'Transferência e vistoria cautelar', 380.00, '2026-10-14', 1);

  // 5. Contatos (Leads Fictícios)
  const insertLead = db.prepare(`
    INSERT INTO leads (vehicle_id, name, phone, email, source, temperature, status, assigned_to, simulation_data, consent_lgpd)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  insertLead.run(
    c1.lastInsertRowid, 'Roberto Alves (Fictício)', '(11) 98888-0001', 'roberto.ficticio@exemplo.com',
    'site_formulario', 'quente', 'novo', 3,
    JSON.stringify({ entrada: 20000, parcelas: 48, valorParcela: 1420 }),
  );

  insertLead.run(
    c2.lastInsertRowid, 'Mariana Costa (Fictício)', '(11) 97777-0002', 'mariana.ficticia@exemplo.com',
    'site_whatsapp', 'morno', 'em_atendimento', 3, null
  );

  // 6. Cliente Fictício com Criptografia LGPD
  const insertClient = db.prepare(`
    INSERT INTO clients (name, cpf_encrypted, phone, email, address_encrypted, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const cpfEncrypted = encryptSensitive('123.456.789-00');
  const addressEncrypted = encryptSensitive('Rua das Amostras Fictícias, 100 - Bairro Modelo');
  const client1 = insertClient.run('Juliana Mendes (Fictícia)', cpfEncrypted, '(11) 96666-0003', 'juliana.ficticia@exemplo.com', addressEncrypted, 'Cliente pré-aprovada para crédito.');

  // 7. Contrato Básico de Teste (Nível 2)
  const insertContract = db.prepare(`
    INSERT INTO contracts (code, type, vehicle_id, client_id, terms_data, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertContract.run(
    'CTR-2026-0001', 'compra_venda', c4.lastInsertRowid, client1.lastInsertRowid,
    JSON.stringify({
      valorTotal: 145000,
      sinal: 15000,
      financiado: 130000,
      testemunhas: ['Testemunha 1 Fictícia', 'Testemunha 2 Fictícia'],
      observacoes: 'Modelo de referência para homologação interna.'
    }),
    'assinado', 1
  );

  // 8. Consignação de Teste (Nível 3)
  const insertConsignment = db.prepare(`
    INSERT INTO consignments (vehicle_id, owner_name, owner_cpf_encrypted, owner_bank_data_encrypted, remuneration_type, remuneration_value, service_fee, daily_storage_fee, contract_start, contract_end, payout_deadline_days, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertConsignment.run(
    c3.lastInsertRowid, 'Fernando Prado (Fictício)',
    encryptSensitive('987.654.321-99'),
    encryptSensitive('Banco 001 - Ag 1234 - CC 56789-0'),
    'percentual', 6.0, 350.00, 15.00, '2026-11-01', '2026-12-01', 5, 'ativo'
  );

  return { message: 'Seed de demonstração fictícia inserido com sucesso!' };
}
