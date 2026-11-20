/**
 * Gerador compartilhado de minutas avançadas (Premium):
 * - Consignação de veículo de terceiro
 * - Compra e venda com veículo na troca
 * - Termo aditivo vinculado a contrato anterior
 *
 * São modelos de apoio, não aconselhamento jurídico: trazem aviso de revisão por advogado.
 * Nenhum dado da loja é inventado: nome, CNPJ e endereço vêm do cadastro (ou aparecem como campo a preencher).
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
  store = {}
}) {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const fields = object => Object.fromEntries(Object.entries(object || {}).map(([key, value]) => [key, typeof value === 'string' ? escape(value) : value]));
  client = fields(client);
  vehicle = fields(vehicle);
  tradeVehicle = fields(tradeVehicle);
  terms = fields(terms);
  store = fields(store);
  code = escape(code);
  parentCode = parentCode ? escape(parentCode) : null;
  const blank = '[preencher]';
  const storeName = store.name || blank;
  const storeCnpj = store.cnpj || blank;
  const storeAddress = store.address || blank;
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const money = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const warrantyDays = Number(terms.warrantyDays);
  const warrantyText = Number.isFinite(warrantyDays) && warrantyDays > 0
    ? `Além da garantia legal, a VENDEDORA oferece garantia contratual de ${warrantyDays} dias, nas condições informadas ao COMPRADOR.`
    : 'Não há garantia contratual adicional, ficando mantida a garantia legal prevista na legislação aplicável.';

  let title = 'INSTRUMENTO CONTRATUAL';
  let specificBody = '';
  let forum = 'As partes elegem o foro da comarca da sede da loja para dirimir dúvidas decorrentes deste instrumento, ressalvados os foros que a lei considere obrigatórios.';

  if (type === 'consignacao') {
    title = 'CONTRATO DE CONSIGNAÇÃO MERCANTIL DE VEÍCULO';
    specificBody = `
      <div class="section">
        <h3>CLÁUSULA 1ª - DO OBJETO E DO PREÇO</h3>
        <p>O <strong>CONSIGNANTE</strong> entrega à <strong>CONSIGNATÁRIA</strong> o veículo abaixo, de sua propriedade, para exposição e intermediação da venda:</p>
        <table class="data-table">
          <tr><td><strong>Veículo:</strong> ${vehicle.title} ${vehicle.version || ''}</td><td><strong>Ano:</strong> ${vehicle.year || '-'}</td></tr>
          <tr><td><strong>Placa / Chassi:</strong> ${vehicle.plate || blank} / ${vehicle.chassi || blank}</td><td><strong>Km:</strong> ${vehicle.km ? Number(vehicle.km).toLocaleString('pt-BR') + ' km' : '-'}</td></tr>
          <tr><td><strong>Preço de anúncio:</strong> ${money(vehicle.price)}</td><td><strong>Preço mínimo autorizado:</strong> ${terms.minSalePrice ? money(terms.minSalePrice) : blank}</td></tr>
          <tr><td colspan="2"><strong>Vigência até:</strong> ${terms.contractEnd || blank}</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>CLÁUSULA 2ª - DA REMUNERAÇÃO, TAXAS E DIÁRIAS</h3>
        <ul>
          <li><strong>Remuneração da CONSIGNATÁRIA:</strong> ${terms.remunerationType === 'percentual' ? `${terms.remunerationValue}% sobre o valor efetivo da venda (mínimo de ${money(terms.minRemuneration)})` : `o que exceder ${money(terms.remunerationValue)}, valor líquido garantido ao CONSIGNANTE`}</li>
          <li><strong>Taxa de entrada / preparação:</strong> ${money(terms.serviceFee)}</li>
          <li><strong>Diária de guarda:</strong> ${money(terms.dailyStorageFee)} por dia, contada do início da vigência até a venda ou a retirada do veículo</li>
          <li><strong>Despesas adiantadas pela CONSIGNATÁRIA, mediante comprovação:</strong> ${money(terms.advancedExpenses)}</li>
          <li><strong>Prestação de contas e repasse:</strong> em até ${terms.payoutDeadlineDays || 5} dias úteis após a compensação integral do pagamento do comprador</li>
        </ul>
      </div>

      <div class="section">
        <h3>CLÁUSULA 3ª - DA ENTREGA, DA PROPRIEDADE E DAS RESPONSABILIDADES</h3>
        <p>As condições do veículo, os acessórios, as chaves e os documentos entregues serão registrados em termo de vistoria de entrada, assinado pelas partes. O CONSIGNANTE declara ser o legítimo proprietário, que o veículo está livre de ônus, gravames, restrições judiciais e débitos não informados por escrito, e responde por multas, impostos e taxas anteriores à entrega e por vícios que tenha omitido. A CONSIGNATÁRIA zela pelo veículo durante a guarda e responde pelos danos a que der causa, salvo caso fortuito ou força maior.</p>
      </div>

      <div class="section">
        <h3>CLÁUSULA 4ª - DA VIGÊNCIA E DA RETIRADA</h3>
        <p>Qualquer das partes pode encerrar a consignação mediante aviso por escrito. Em caso de retirada do veículo antes da venda, ficam devidas as diárias e as despesas adiantadas comprovadas até a data da retirada, conforme a Cláusula 2ª.</p>
      </div>
    `;
  } else if (type === 'compra_venda_troca') {
    title = 'CONTRATO DE COMPRA E VENDA COM VEÍCULO DADO NA TROCA';
    forum = 'As partes elegem o foro da comarca do domicílio do COMPRADOR para dirimir dúvidas decorrentes deste instrumento, ressalvados os foros que a lei considere obrigatórios.';
    const price = Number(vehicle.price || 0);
    const trade = Number(terms.tradeValue || 0);
    const cash = Number(terms.cashDownPayment || 0);
    const computed = Math.max(0, price - trade - cash);
    const informed = terms.financedBalance === undefined || terms.financedBalance === '' ? computed : Number(terms.financedBalance);
    const mismatch = Math.abs(informed - computed) > 0.01;
    specificBody = `
      <div class="section">
        <h3>CLÁUSULA 1ª - DO VEÍCULO VENDIDO</h3>
        <p>A VENDEDORA vende ao COMPRADOR o veículo <strong>${vehicle.title} ${vehicle.version || ''}</strong>, ano ${vehicle.year || '-'}, placa ${vehicle.plate || blank}, pelo preço de <strong>${money(vehicle.price)}</strong>.</p>
      </div>

      <div class="section">
        <h3>CLÁUSULA 2ª - DO VEÍCULO DADO NA TROCA</h3>
        <p>Como parte do pagamento, o COMPRADOR entrega o veículo abaixo e declara ser seu legítimo proprietário:</p>
        <table class="data-table">
          <tr><td><strong>Veículo:</strong> ${tradeVehicle?.title || blank}</td><td><strong>Ano / modelo:</strong> ${tradeVehicle?.year || '-'}</td></tr>
          <tr><td><strong>Placa:</strong> ${tradeVehicle?.plate || blank}</td><td><strong>Valor atribuído à troca:</strong> ${money(trade)}</td></tr>
          <tr><td colspan="2"><strong>Saldo de financiamento ou débito a quitar:</strong> ${terms.tradeHasDebt ? money(terms.tradeDebtAmount) : 'Nenhum informado'}</td></tr>
        </table>
        <p>O COMPRADOR responde por multas, impostos, taxas e gravames do veículo dado na troca até a data da entrega, e deve quitar o saldo acima informado, quando houver.</p>
      </div>

      <div class="section">
        <h3>CLÁUSULA 3ª - DA COMPOSIÇÃO DO PAGAMENTO</h3>
        <ul>
          <li>Preço do veículo vendido: ${money(price)}</li>
          <li>(-) Valor atribuído à troca: ${money(trade)}</li>
          <li>(-) Entrada em dinheiro: ${money(cash)}</li>
          <li>(=) Saldo a pagar${terms.paymentMethod ? ` (${terms.paymentMethod})` : ''}: <strong>${money(informed)}</strong></li>
        </ul>
        ${mismatch ? `<p><em>Atenção: o saldo informado difere do cálculo (${money(computed)}). Confira os valores antes de assinar.</em></p>` : ''}
      </div>

      <div class="section">
        <h3>CLÁUSULA 4ª - DA TRANSFERÊNCIA E DA GARANTIA</h3>
        <p>As partes providenciarão a transferência de propriedade e a comunicação de venda dos veículos nos prazos da legislação de trânsito. Os débitos e as infrações do veículo vendido anteriores à entrega são de responsabilidade da VENDEDORA. ${warrantyText}</p>
      </div>
    `;
  } else if (type === 'termo_aditivo') {
    title = 'TERMO ADITIVO DE CONTRATO';
    specificBody = `
      <div class="section">
        <h3>CLÁUSULA 1ª - DO CONTRATO ORIGINAL</h3>
        <p>Este Termo Aditivo integra o <strong>contrato de código ${parentCode || blank}</strong>, celebrado entre as partes.</p>
      </div>

      <div class="section">
        <h3>CLÁUSULA 2ª - DAS ALTERAÇÕES</h3>
        <p>As partes acordam a seguinte modificação:</p>
        <div style="background: #f8fafc; border: 1px dashed #94a3b8; padding: 12px; margin: 10px 0; border-radius: 6px;">
          ${terms.amendmentReason || blank}
        </div>
        <p>Permanecem inalteradas as demais cláusulas e condições não modificadas por este aditivo.</p>
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
    .signatures, .witness-signatures { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; font-size: 11pt; }
    .sign-line { border-top: 1px solid #111; padding-top: 6px; }
    @media print { body { margin: 20mm; } .legal-alert { display: block !important; } }
  </style>
</head>
<body>

  <div class="legal-alert">
    <strong>AVISO:</strong> Este documento é uma minuta-modelo gerada pelo sistema de gestão da loja, sem validade jurídica própria. Antes de qualquer assinatura, deve ser revisada e adequada ao caso concreto por advogado habilitado. O sistema não presta assessoria jurídica.
  </div>

  <div class="header">
    <h1>${title}</h1>
    <div class="code">DOCUMENTO Nº: ${code} ${parentCode ? `(vinculado a: ${parentCode})` : ''}</div>
  </div>

  <div class="section">
    <h3>DAS PARTES</h3>
    <p><strong>LOJA:</strong> ${storeName}, inscrita no CNPJ sob o nº ${storeCnpj}, com sede em ${storeAddress}.</p>
    <p><strong>CLIENTE:</strong> ${client.name || blank}, CPF nº ${client.cpf_masked || blank}, telefone ${client.phone || '-'}, residente em ${client.address || blank}.</p>
  </div>

  ${specificBody}

  <div class="section">
    <h3>DO FORO</h3>
    <p>${forum}</p>
  </div>

  <p style="text-align: right; margin-top: 30px;">Data de emissão: ${currentDate}</p>

  <div class="signatures">
    <div><div class="sign-line"><strong>${storeName}</strong><br>CNPJ: ${storeCnpj}</div></div>
    <div><div class="sign-line"><strong>${client.name || 'CLIENTE'}</strong><br>CPF: ${client.cpf_masked || ''}</div></div>
  </div>

  <div class="witness-signatures">
    <div><div class="sign-line">1ª testemunha: ${terms.witness1_name || ''}<br>CPF: ${terms.witness1_cpf || ''}</div></div>
    <div><div class="sign-line">2ª testemunha: ${terms.witness2_name || ''}<br>CPF: ${terms.witness2_cpf || ''}</div></div>
  </div>

</body>
</html>
  `;
}
