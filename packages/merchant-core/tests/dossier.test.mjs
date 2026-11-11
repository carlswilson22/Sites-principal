import test from 'node:test';
import assert from 'node:assert/strict';
import { getDossierSummary } from '../../../sites/popular-dealership/src/utils/dossier.js';

test('dossiê não declara histórico aprovado quando os dados estão ausentes', () => {
  assert(getDossierSummary().every(fact => fact.clear === null && fact.text === 'Não informado'));
  const facts = getDossierSummary({ leilao: true, sinistros: ['Ocorrência'], recallPendente: true, quilometragemAutentica: false });
  assert(facts.every(fact => fact.clear === false));
  assert(getDossierSummary({ leilao: false, sinistros: [], recallPendente: false, quilometragemAutentica: true }).every(fact => fact.clear === true));
});
