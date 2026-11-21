import test from 'node:test';
import assert from 'node:assert/strict';
import { findContractClient } from '../src/utils/contractClient.js';

test('contrato reutiliza cliente pelo nome e telefone normalizado', () => {
  const client = { id: 3, name: 'Ana Souza', phone: '(61) 99999-1234' };
  assert.equal(findContractClient([client], { clientName: ' ana  souza ', clientPhone: '55 61 99999-1234' }), client);
  assert.equal(findContractClient([client], { clientId: 3, clientName: 'Ana Souza', clientPhone: '' }), client);
  assert.equal(findContractClient([client], { clientName: 'Outra Pessoa', clientPhone: '(61) 98888-1234' }), null);
});

test('telefone compartilhado ou cliente removido exige escolha explícita', () => {
  const clients = [{ id: 'a', name: 'Ana', phone: '(61) 99999-1234' }];
  assert.throws(() => findContractClient(clients, { clientName: 'Bruno', clientPhone: '61999991234' }), /Selecione o cliente/);
  assert.throws(() => findContractClient(clients, { clientId: 'removido' }), /não está mais disponível/);
  assert.throws(() => findContractClient([], { clientName: 'Ana', clientPhone: '123' }), /telefone com DDD/);
});
