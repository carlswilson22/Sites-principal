/**
 * server/src/services/contractGenerator.js
 * Emissor de Contratos Básicos, Recibos e Termos de Vistoria (I7)
 * - Modelos em linguagem própria
 * - Preenchimento automático a partir do cliente e veículo
 * - Gera documento formatado para impressão/PDF e envio WhatsApp
 */

export function generateContractDocument({
  type, // 'compra_venda', 'recibo_sinal', 'vistoria_simples'
  contractCode,
  dealership,
  client,
  vehicle,
  terms
}) {
  const code = contractCode || `CTR-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const disclaimer = `⚠️ AVISO LEGAL: Este documento foi gerado pelo sistema como modelo referencial genérico. Deve ser submetido à revisão e validação de um advogado ou departamento jurídico antes do uso comercial definitivo.`;

  // 1. Contrato de Compra e Venda
  if (type === 'compra_venda') {
    return {
      code,
      type,
      title: 'Instrumento Particular de Compra e Venda de Veículo Automotor',
      disclaimer,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
          <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase;">${dealership.nome || 'CONCESSIONÁRIA'}</h1>
            <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">CNPJ: ${dealership.cnpj || '12.345.678/0001-90'} • Contrato nº ${code}</p>
          </div>

          <h2 style="font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 20px;">INSTRUMENTO PARTICULAR DE COMPRA E VENDA DE VEÍCULO</h2>

          <p><strong>VENDEDOR(A):</strong> ${dealership.nome}, com sede em ${dealership.cidade || 'Brasília'}-${dealership.uf || 'DF'}, inscrita no CNPJ sob o nº ${dealership.cnpj || '12.345.678/0001-90'}.</p>
          <p><strong>COMPRADOR(A):</strong> ${client.name}, portador(a) do CPF nº ${client.cpfMasked || '***.***.***-**'}, residente em ${client.address || 'Endereço cadastrado'}.</p>

          <h3 style="font-size: 14px; font-weight: bold; margin-top: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">1. DO OBJETO</h3>
          <p>O presente instrumento tem por objeto a alienação do seguinte veículo seminovo:</p>
          <ul>
            <li><strong>Veículo:</strong> ${vehicle.title} ${vehicle.version || ''}</li>
            <li><strong>Ano / Fabricação:</strong> ${vehicle.year} • <strong>Cor:</strong> ${vehicle.color}</li>
            <li><strong>Quilometragem:</strong> ${vehicle.km?.toLocaleString('pt-BR')} km</li>
            <li><strong>Câmbio / Combustível:</strong> ${vehicle.transmission} • ${vehicle.fuel}</li>
          </ul>

          <h3 style="font-size: 14px; font-weight: bold; margin-top: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">2. DO PREÇO E CONDIÇÕES DE PAGAMENTO</h3>
          <p>O valor total ajustado para a presente transação é de <strong>R$ ${vehicle.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, a ser liquidado conforme estipulado entre as partes na proposta comercial.</p>

          <h3 style="font-size: 14px; font-weight: bold; margin-top: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">3. DA PROCEDÊNCIA E VISTORIA</h3>
          <p>O comprador declara que inspecionou o veículo, tendo ciência de suas condições mecânicas, estruturais e de conservação externa e interna.</p>

          <div style="margin-top: 40px; display: flex; justify-content: space-between;">
            <div style="width: 45%; text-align: center; border-top: 1px solid #94a3b8; padding-top: 8px;">
              <strong>${dealership.nome}</strong><br/>Vendedor
            </div>
            <div style="width: 45%; text-align: center; border-top: 1px solid #94a3b8; padding-top: 8px;">
              <strong>${client.name}</strong><br/>Comprador
            </div>
          </div>

          <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 12px;">
            ${disclaimer}<br/>Gerado em ${dateStr}.
          </div>
        </div>
      `
    };
  }

  // 2. Recibo de Sinal de Negócio
  if (type === 'recibo_sinal') {
    const signalValue = parseFloat(terms?.signalValue) || 5000;

    return {
      code,
      type,
      title: 'Recibo de Sinal e Princípio de Pagamento',
      disclaimer,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
          <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="font-size: 20px; font-weight: bold; margin: 0;">${dealership.nome}</h1>
            <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">RECIBO DE SINAL • Código: ${code}</p>
          </div>

          <p>Recebemos de <strong>${client.name}</strong> (CPF: ${client.cpfMasked || '***.***.***-**'}) a importância de <strong>R$ ${signalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> a título de SINAL E PRINCÍPIO DE PAGAMENTO para reserva do veículo <strong>${vehicle.title} ${vehicle.version || ''} (${vehicle.year})</strong>.</p>
          
          <p>O saldo remanescente no valor de R$ ${(vehicle.price - signalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} será quitado no ato da entrega ou liberação de financiamento.</p>

          <p style="margin-top: 30px; text-align: right;">${dealership.cidade || 'Brasília'}, ${dateStr}.</p>

          <div style="margin-top: 40px; text-align: center; border-top: 1px solid #94a3b8; width: 50%; margin-left: auto; margin-right: auto; padding-top: 8px;">
            <strong>${dealership.nome}</strong><br/>Assinatura do Responsável
          </div>

          <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 12px;">
            ${disclaimer}
          </div>
        </div>
      `
    };
  }

  // 3. Termo de Vistoria Simples (Checklist completo)
  const checklist = terms?.checklist || {
    documentos: true,
    chaveReserva: true,
    estepe: true,
    macacoTriangulo: true,
    pneus: 'Bons (70% de vida útil)',
    lataria: 'Conforme laudo cautelar aprovado',
    interior: 'Higienizado, estofamento íntegro'
  };

  return {
    code,
    type: 'vistoria_simples',
    title: 'Termo de Vistoria e Entrega do Veículo',
    disclaimer,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 2px solid #f59e0b; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0;">${dealership.nome}</h1>
          <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">TERMO DE VISTORIA E CONFERÊNCIA • ${code}</p>
        </div>

        <p>Aos ${dateStr}, foi realizada a conferência física e documental do veículo <strong>${vehicle.title} (${vehicle.year})</strong> entregue a <strong>${client.name}</strong>.</p>

        <h3 style="font-size: 14px; font-weight: bold; margin-top: 16px;">ITENS CONFERIDOS NA ENTREGA:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px;">Documento do Veículo (CRLV-e):</td><td style="font-weight: bold; color: #16a34a;">[x] Entregue</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px;">Chave Principal e Chave Reserva:</td><td style="font-weight: bold; color: #16a34a;">[x] Conferidas</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px;">Kit Estepe, Macaco e Chave de Roda:</td><td style="font-weight: bold; color: #16a34a;">[x] Presentes</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px;">Estado dos Pneus:</td><td>${checklist.pneus}</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px;">Inspeção de Lataria e Pintura:</td><td>${checklist.lataria}</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px;">Interior e Estofamento:</td><td>${checklist.interior}</td></tr>
        </table>

        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
          <div style="width: 45%; text-align: center; border-top: 1px solid #94a3b8; padding-top: 8px;">
            <strong>${dealership.nome}</strong><br/>Entregador
          </div>
          <div style="width: 45%; text-align: center; border-top: 1px solid #94a3b8; padding-top: 8px;">
            <strong>${client.name}</strong><br/>Recebedor
          </div>
        </div>

        <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 12px;">
          ${disclaimer}
        </div>
      </div>
    `
  };
}

