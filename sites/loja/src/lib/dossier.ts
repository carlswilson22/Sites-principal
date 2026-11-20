/** Dossiê do veículo: o que a LOJA cadastrou. Campo ausente aparece como "Não informado", nunca como "limpo". */
export interface Fact { label: string; text: string; clear: boolean | null }

const bool = (label: string, value: unknown, clearValue: boolean, clearText: string, warnText: string): Fact => ({
  label, clear: typeof value === 'boolean' ? value === clearValue : null,
  text: typeof value === 'boolean' ? (value === clearValue ? clearText : warnText) : 'Não informado'
});

export function dossierFacts(d: any = {}): Fact[] {
  return [
    bool('Histórico de leilão', d.leilao, false, 'Sem registro informado', 'Registro informado'),
    {
      label: 'Sinistros', clear: Array.isArray(d.sinistros) ? d.sinistros.length === 0 : null,
      text: Array.isArray(d.sinistros) ? (d.sinistros.length ? `${d.sinistros.length} ocorrência(s) informada(s)` : 'Sem ocorrência informada') : 'Não informado'
    },
    bool('Recall pendente', d.recallPendente, false, 'Sem pendência informada', 'Pendência informada'),
    bool('Quilometragem verificada', d.quilometragemAutentica, true, 'Verificada no cadastro', 'Verificação pendente'),
    { label: 'Proprietários anteriores', clear: null, text: Number.isInteger(d.proprietarios) && d.proprietarios > 0 ? String(d.proprietarios) : 'Não informado' },
    { label: 'Última revisão', clear: null, text: d.dataUltimaRevisao ? String(d.dataUltimaRevisao) : 'Não informada' },
    { label: 'Cidade de registro', clear: null, text: d.cidadeRegistro ? String(d.cidadeRegistro) : 'Não informada' }
  ];
}
