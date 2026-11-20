import type { APIRoute } from 'astro';

/** Modelo de planilha com as colunas que a importação reconhece. A linha de exemplo é ignorada na importação. */
export const GET: APIRoute = () => {
  const header = ['Título *', 'Versão', 'Marca', 'Categoria', 'Ano *', 'Km', 'Câmbio', 'Combustível', 'Cor', 'Portas', 'Motor', 'Potência', 'Preço (R$) *', 'Preço original (R$)', 'Tipo', 'Situação', 'Dias já em estoque', 'Opcionais', 'Observações'];
  const example = ['Honda Civic EXL (EXEMPLO)', '2.0 Flex Automático', 'Honda', 'sedan', '2021/2022', '42000', 'Automático', 'Flex', 'Prata', '4', '2.0', '155 cv', '119900', '124900', 'próprio', 'disponível', '20', 'Ar-condicionado; Direção elétrica; Câmera de ré', 'Único dono'];
  const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const body = '﻿' + [header, example].map(row => row.map(cell).join(';')).join('\r\n') + '\r\n';
  return new Response(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="modelo-estoque.csv"' } });
};
