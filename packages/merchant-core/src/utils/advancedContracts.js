/**
 * Gerador compartilhado de minutas
 * Gerador de minutas contratuais avançadas (Nível 3 - A2):
 * - Consignação de Veículos (terceiros)
 * - Compra e Venda com Veículo na Troca
 * - Termo Aditivo vinculado a contrato original
 *
 * Regra obrigatória: Contém aviso explícito sobre necessidade de revisão jurídica.
 */

export function generateContractCode(prefix = 'CTR', sequenceNumber = 1) {
  const year = new Date().getFullYear();
  const seq = String(sequenceNumber).padStart(4, '0');
  return `${prefix}-${year}-${seq}`;
}

export function generateAdvancedContractHtml({
  type, // 'consignacao' | 'compra_venda_troca' | 'termo_aditivo'
  code,
  parentCode = null,
  client,
  vehicle,
  tradeVehicle = null,
  terms = {},
  store = {
    name: 'Auto-Dealership Enterprise Veículos',
    cnpj: '00.123.456/0001-99',
    address: 'Av. das Concessionárias, 5000 - Setor Automotivo'
  }
}) {
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const fields = object => Object.fromEntries(Object.entries(object || {}).map(([key, value]) => [key, typeof value === 'string' ? escape(value) : value]));
  client = fields(client);
  vehicle = fields(vehicle);
  tradeVehicle = fields(tradeVehicle);
  terms = fields(terms);
  store = fields(store);
  code = escape(code);
  parentCode = parentCode ? escape(parentCode) : null;
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const valorFormatado = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  let title = 'INSTRUMENTO CONTRATUAL';
  let specificBody = '';

  if (type === 'consignacao') {
    title = 'CONTRATO DE CONSIGNAÇÃO MERCANTIL DE VEÍCULO';
    specificBody = `
      <div class="section">
        <h3>CLÁUSULA 1ª - DO OBJETO E CONDIÇÕES DE VENDA</h3>
        <p>O <strong>CONSIGNANTE</strong> confere à <strong>CONSIGNATÁRIA</strong> poderes de intermediação para alienação do seguinte veículo de sua propriedade:</p>
        <table class="data-table">
          <tr><td><strong>Veículo:</strong> ${vehicle.title} ${vehicle.version || ''}</td><td><strong>Ano:</strong> ${vehicle.year || '-'}</td></tr>
          <tr><td><strong>Placa / Chassi:</strong> ${vehicle.plate || 'Em vistoria'} / ${vehicle.chassi || 'Constante no CRLV'}</td><td><strong>Km:</strong> ${vehicle.km ? vehicle.km.toLocaleString('pt-BR') + ' km' : '-'}</td></tr>
          <tr><td><strong>Valor Sugerido para Venda:</strong> ${valorFormatado(vehicle.price)}</td><td><strong>Prazo de Vigência:</strong> ${terms.contractEnd || '30 dias'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>CLÁUSULA 2ª - DA REMUNERAÇÃO, TAXAS E DIÁRIAS</h3>
        <p>A remuneração pelos serviços de corretagem e consignação será fixada nos seguintes termos:</p>
        <ul>
          <li><strong>Modalidade de Remuneração:</strong> ${terms.remunerationType === 'percentual' ? `${terms.remunerationValue}% sobre o valor final de venda (mínimo de ${valorFormatado(terms.minRemuneration)})` : `Valor líquido garantido ao proprietário de ${valorFormatado(terms.remunerationValue)}`}</li>
          <li><strong>Taxa de Entrada / Preparação Estética:</strong> ${valorFormatado(terms.serviceFee)}</li>
          <li><strong>Diária de Guarda / Estacionamento:</strong> ${valorFormatado(terms.dailyStorageFee)} por dia decorrido até a venda ou retirada</li>
          <li><strong>Prazo Máximo de Repasse Financeiro:</strong> Até ${terms.payoutDeadlineDays || 5} dias úteis após a compensação integral do pagamento</li>
        </ul>
      </div>

      <div class="section">
        <h3>CLÁUSULA 3ª - DA VISTORIA CAUTELAR E RESPONSABILIDADES</h3>
        <p>O veículo foi entregue à CONSIGNATÁRIA acompanhado de chave principal, manual e documento CRLV vigente, sendo conferido o estado geral de conservação sem avarias ocultas ou pendências judiciais de responsabilidade do CONSIGNANTE.</p>
      </div>
    `;
  } else if (type === 'compra_venda_troca') {
    title = 'CONTRATO DE COMPRA E VENDA COM DAÇÃO DE VEÍCULO EM PAGAMENTO (TROCA)';
    specificBody = `
      <div class="section">
        <h3>CLÁUSULA 1ª - DO OBJETO PRINCIPAL</h3>
        <p>A VENDEDORA aliena ao COMPRADOR o veículo automotor discriminado:</p>
        <p><strong>Veículo Adquirido:</strong> ${vehicle.title} ${vehicle.version || ''} | Ano: ${vehicle.year || '-'} | Valor: <strong>${valorFormatado(vehicle.price)}</strong></p>
      </div>

      <div class="section">
        <h3>CLÁUSULA 2ª - DO VEÍCULO DADO NA TROCA (DAÇÃO EM PAGAMENTO)</h3>
        <p>Como parte integrante do pagamento, o COMPRADOR entrega à VENDEDORA, livre de quaisquer ônus fiscais, multas e gravames:</p>
        <table class="data-table">
          <tr><td><strong>Veículo na Troca:</strong> ${tradeVehicle?.title || 'Veículo dado em dação'}</td><td><strong>Ano / Modelo:</strong> ${tradeVehicle?.year || '-'}</td></tr>
          <tr><td><strong>Valor de Avaliação da Troca:</strong> ${valorFormatado(terms.tradeValue)}</td><td><strong>Quitação de Saldo Pendente:</strong> ${terms.tradeHasDebt ? valorFormatado(terms.tradeDebtAmount) : 'Quitado'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>CLÁUSULA 3ª - DA COMPOSIÇÃO DO SALDO FINAL</h3>
        <ul>
          <li><strong>Valor Total do Veículo Adquirido:</strong> ${valorFormatado(vehicle.price)}</li>
          <li><strong>(-) Crédito da Troca:</strong> ${valorFormatado(terms.tradeValue)}</li>
          <li><strong>(-) Entrada em Moeda Corrente:</strong> ${valorFormatado(terms.cashDownPayment)}</li>
          <li><strong>(=) Saldo Remanescente Financiado:</strong> ${valorFormatado(terms.financedBalance)}</li>
        </ul>
      </div>
    `;
  } else if (type === 'termo_aditivo') {
    title = 'TERMO ADITIVO DE CONTRATO';
    specificBody = `
      <div class="section">
        <h3>CLÁUSULA 1ª - DO VÍNCULO AO INSTRUMENTO ORIGINAL</h3>
        <p>O presente Termo Aditivo vincula-se e integra para todos os fins de direito o <strong>Contrato Original sob código ${parentCode || 'CTR-ANTERIOR'}</strong> celebrado entre as partes.</p>
      </div>

      <div class="section">
        <h3>CLÁUSULA 2ª - DAS ALTERAÇÕES E PACTUAÇÕES</h3>
        <p>Pelo presente instrumento, as partes deliberam e acordam as seguintes modificações contratuais:</p>
        <div style="background: #f8fafc; border: 1px dashed #94a3b8; padding: 12px; margin: 10px 0; border-radius: 6px;">
          ${terms.amendmentReason || 'Pactuação de prorrogação de prazo e adequação de valores conforme acordo mútuo.'}
        </div>
        <p>Permanecem inalteradas, válidas e vigentes todas as demais cláusulas e condições não expressamente modificadas por este aditivo.</p>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title} - ${code}</title>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.5; color: #111; margin: 40px; font-size: 13pt; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 24px; }
    .header h1 { font-size: 16pt; margin: 0; text-transform: uppercase; }
    .header .code { font-size: 11pt; color: #555; margin-top: 4px; font-weight: bold; }
    .legal-alert { background: #fef2f2; border: 1px solid #ef4444; color: #991b1b; padding: 10px 14px; font-size: 9pt; margin-bottom: 20px; border-radius: 4px; }
    .section { margin-bottom: 18px; }
    .section h3 { font-size: 11pt; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px; font-size: 11pt; }
    .data-table td { border: 1px solid #cbd5e1; padding: 6px 10px; }
    .signatures { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; font-size: 11pt; }
    .witness-signatures { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; font-size: 10pt; }
    .sign-line { border-top: 1px solid #111; padding-top: 6px; }
    @media print {
      body { margin: 20mm; }
      .legal-alert { display: block !important; }
    }
  </style>
</head>
<body>

  <div class="legal-alert">
    <strong>AVISO LEGAL OBRIGATÓRIO:</strong> Este documento é uma minuta contratual padronizada gerada pelo sistema de gestão da loja. Para sua plena validade jurídica e adequação ao caso concreto, deve ser submetida à revisão e aprovação prévia de advogado legalmente habilitado antes de qualquer assinatura.
  </div>

  <div class="header">
    <h1>${title}</h1>
    <div class="code">DOCUMENTO Nº: ${code} ${parentCode ? `(Vinculado a: ${parentCode})` : ''}</div>
  </div>

  <div class="section">
    <h3>DAS PARTES</h3>
    <p><strong>CONTRATADA/LOJA:</strong> ${store.name}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${store.cnpj}, com sede em ${store.address}.</p>
    <p><strong>CONTRATANTE/CLIENTE:</strong> ${client.name || 'Cliente'}, portador(a) do CPF sob o nº ${client.cpf_masked || '000.***.***-00'}, telefone de contato: ${client.phone || '-'}, residente em ${client.address || 'Endereço cadastrado'}.</p>
  </div>

  ${specificBody}

  <div class="section">
    <h3>DO FORO</h3>
    <p>As partes elegem o foro da Comarca da sede da CONTRATADA para dirimir quaisquer dúvidas decorrentes do presente instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>
  </div>

  <p style="text-align: right; margin-top: 30px;">Data de Emissão: ${currentDate}</p>

  <div class="signatures">
    <div>
      <div class="sign-line">
        <strong>${store.name}</strong><br>
        CNPJ: ${store.cnpj}
      </div>
    </div>
    <div>
      <div class="sign-line">
        <strong>${client.name || 'CLIENTE'}</strong><br>
        CPF: ${client.cpf_masked || '000.***.***-00'}
      </div>
    </div>
  </div>

  <div class="witness-signatures">
    <div>
      <div class="sign-line">
        1ª Testemunha: ${terms.witness1_name || 'Nome:'} ____________________<br>
        CPF: ${terms.witness1_cpf || '000.***.***-00'}
      </div>
    </div>
    <div>
      <div class="sign-line">
        2ª Testemunha: ${terms.witness2_name || 'Nome:'} ____________________<br>
        CPF: ${terms.witness2_cpf || '000.***.***-00'}
      </div>
    </div>
  </div>

</body>
</html>
  `;
}
