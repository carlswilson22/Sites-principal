/**
 * packages/merchant-core/src/utils/contracts.js
 * Emissor de Contratos Básicos, Recibos e Termos de Vistoria para uso no navegador (I7).
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
        </div>
      `
    };
  }

  // 2. Recibo de Sinal
  if (type === 'recibo_sinal') {
    return {
      code,
      type,
      title: 'Recibo de Reserva e Princípio de Pagamento (Sinal)',
      disclaimer,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
          <div style="text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase;">${dealership.nome || 'CONCESSIONÁRIA'}</h1>
            <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">CNPJ: ${dealership.cnpj || '12.345.678/0001-90'} • Recibo nº ${code}</p>
          </div>

          <h2 style="font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 20px;">RECIBO DE RESERVA E SINAL</h2>

          <p>Recebemos de <strong>${client.name}</strong>, portador(a) do CPF nº <strong>${client.cpfMasked || '***.***.***-**'}</strong>, a importância de <strong>R$ ${(terms?.sinalAmount || 2000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> a título de sinal e princípio de pagamento para a reserva do veículo:</p>

          <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; margin: 16px 0; border-radius: 6px;">
            <p style="margin: 0;"><strong>${vehicle.title} ${vehicle.version || ''}</strong> - Ano: ${vehicle.year} - Preço Total: R$ ${vehicle.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>

          <p>A reserva garante exclusividade para finalização do pagamento ou aprovação de financiamento no prazo improrrogável de ${terms?.validityDays || 3} dias úteis.</p>

          <div style="margin-top: 40px; text-align: center;">
            <div style="display: inline-block; width: 60%; border-top: 1px solid #94a3b8; padding-top: 8px;">
              <strong>${dealership.nome}</strong><br/>Responsável Financeiro
            </div>
          </div>
        </div>
      `
    };
  }

  // 3. Termo de Vistoria Simples
  return {
    code,
    type: 'vistoria_simples',
    title: 'Termo de Vistoria de Entrega e Checklist do Veículo',
    disclaimer,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 2px solid #475569; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase;">${dealership.nome || 'CONCESSIONÁRIA'}</h1>
          <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">Termo de Vistoria nº ${code}</p>
        </div>

        <h2 style="font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 20px;">TERMO DE VISTORIA E CONFERÊNCIA</h2>

        <p><strong>Cliente:</strong> ${client.name} (CPF: ${client.cpfMasked || '***.***.***-**'})</p>
        <p><strong>Veículo:</strong> ${vehicle.title} ${vehicle.version || ''} (Km: ${vehicle.km?.toLocaleString('pt-BR')} km)</p>

        <h3 style="font-size: 14px; font-weight: bold; margin-top: 16px;">ITENS CONFERIDOS NO ATO DA ENTREGA:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px;">
          <tr style="background: #f1f5f9;"><th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">Item</th><th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; width: 80px;">Status</th></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 6px;">Documento do Veículo (CRLV)</td><td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: green;">✓ OK</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 6px;">Chave Principal e Reserva</td><td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: green;">✓ OK</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 6px;">Manual do Proprietário</td><td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: green;">✓ OK</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 6px;">Estepe, Macaco e Chave de Roda</td><td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: green;">✓ OK</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 6px;">Pneus e Calibração</td><td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: green;">✓ OK</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 6px;">Pintura, Lataria e Vidros</td><td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: green;">✓ OK</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 6px;">Interior, Estofamento e Elétrica</td><td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: green;">✓ OK</td></tr>
        </table>

        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
          <div style="width: 45%; text-align: center; border-top: 1px solid #94a3b8; padding-top: 8px;">
            <strong>Vistoriador Responsável</strong><br/>${dealership.nome}
          </div>
          <div style="width: 45%; text-align: center; border-top: 1px solid #94a3b8; padding-top: 8px;">
            <strong>${client.name}</strong><br/>Recebido e Conferido
          </div>
        </div>
      </div>
    `
  };
}
