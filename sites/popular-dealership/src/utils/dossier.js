export function getDossierSummary(data = {}) {
  const booleanFact = (label, value, clearValue, clearText, warningText) => ({ label, clear: typeof value === 'boolean' ? value === clearValue : null, text: typeof value === 'boolean' ? (value === clearValue ? clearText : warningText) : 'Não informado' });
  return [
    booleanFact('Histórico de leilão', data.leilao, false, 'Sem registro informado', 'Registro informado'),
    { label: 'Registro de sinistros', clear: Array.isArray(data.sinistros) ? data.sinistros.length === 0 : null, text: Array.isArray(data.sinistros) ? (data.sinistros.length ? `${data.sinistros.length} ocorrência(s) informada(s)` : 'Sem ocorrência informada') : 'Não informado' },
    booleanFact('Recall pendente', data.recallPendente, false, 'Sem pendência informada', 'Pendência informada'),
    booleanFact('Quilometragem verificada', data.quilometragemAutentica, true, 'Verificada no cadastro', 'Verificação pendente'),
  ];
}
