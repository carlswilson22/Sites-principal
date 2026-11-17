# Módulos do painel — operação e conferência

Atualizado em **17/11/2026**, na `main`, referência `3f3961d`.
A distribuição de edição/cargo está na [matriz](matriz-de-funcionalidades.md).
Este roteiro é operacional; o escopo contratual ainda será selecionado.

## Base: estoque, contatos, financiamento e contratos

Os três modelos têm estoque, contatos com histórico, simulador e minutas
básicas. Atendente, gerente e proprietário acessam esses módulos; exclusão de
veículo exige gerente/proprietário. Alterações do estoque local alimentam a
vitrine da loja no mesmo navegador.

Contatos guardam situação, observações e datas. A seleção acompanha alterações
em outras abas e fecha se o contato for removido. Atualizações não substituem
dados inválidos; falhas de salvamento mantêm o atendimento aberto.

Contratos básicos usam veículo do estoque, dados informados e emissor
compartilhado com a API. Há compra/venda, sinal e vistoria, com prévia, impressão
e histórico por loja. Vistoria deixa itens para conferência, sem aprovação
automática. Alterar manualmente o comprador remove o vínculo anterior.

O simulador do painel usa taxa manual. O anúncio usa seleção de três bancos
ilustrativos após login. Ambos estimam parcelas; não aprovam crédito. As
rotas de financiamento e contratos básicos do servidor também admitem nível 1,
embora estejam no arquivo de rotas de nível 2.

## Financeiro por veículo — modelos 2 e 3

Exclusivo do proprietário; permite cadastrar, editar e remover aquisição/outros
gastos. Valores calculados em centavos e persistidos por loja/veículo. Sem
compra registrada, não apresenta um resultado de margem como se fosse completo.

Preço anunciado serve para estimativa. Resultado realizado exige veículo
vendido e valor efetivo em `actual_sale_price`, `sold_price` ou `actualSalePrice`.
A interface ainda não oferece cadastro desse valor. Não apresentar como
conciliação contábil completa. Falhas de armazenamento preservam o formulário.

## Métricas — modelos 2 e 3

Para gerente/proprietário. Registra página, anúncio aberto e ação de WhatsApp,
com filtros de 7/30/90 dias e ranking. Guarda até 10 mil eventos dos últimos
90 dias, por loja, no navegador usado. Eventos contêm tipo, página, identificador
do veículo e data; não copiam mensagem, nome ou telefone.

Não são visitantes únicos nem tráfego consolidado. Falha de métrica opcional
não impede navegação. CRM e precificador FIPE usam dados locais/referência manual.

## Ferramentas Enterprise

- Consignações: dados persistidos e cálculo de comissão, diárias e repasse.
- Contratos avançados: minutas preenchidas, numeração e aditivos vinculados.
- Mercado/leilão: cálculo com concorrentes e demais parâmetros manuais.
- Stories: escolha do estoque, três layouts, PNG, publicação fictícia local e
  histórico cuja ação **Ver publicação** abre a arte/legenda salva.
- Exportação de catálogo: arquivo CSV local, sem envio direto a portais.
- Auditoria/LGPD: ações persistidas sobre clientes de exemplo; não abrangem
  todas as contas, documentos ou CRM.
- DRE/comissões e funil/giro: relatórios com números de exemplo, sem consolidar
  automaticamente estoque, gastos e contatos locais.

As amostras avançadas ficam em `store_tool_samples_<loja>`. A simulação não
comprova integração em produção. Para operações avançadas fora do modo demo,
as chamadas `toolApi` exigem resposta da API e propagam erro, sem substituir
falha por sucesso local. Outros relatórios ainda têm respostas de exemplo;
conferir cada fluxo antes de ativar uma instalação real.

## Roteiro manual

1. Entrar com cada perfil e conferir menu, rotas e ações conforme a matriz.
2. Cadastrar/editar/publicar um veículo e conferir vitrine e galeria.
3. Registrar contato, mudar situação/anotar; reabrir e conferir histórico.
4. Como atendente, simular financiamento e emitir os três documentos básicos;
   conferir prévia, impressão e histórico. Confirmar o veículo correto.
5. Como proprietário dos modelos 2/3, lançar aquisição/gasto; alternar veículo,
   recarregar e conferir valores. Consultar métricas após navegar pela vitrine.
6. No Enterprise, salvar consignação, emitir minuta/aditivo, calcular preço,
   gerar Story e reabrir publicação salva. Conferir persistência após recarregar.
7. Exportar/anonimizar somente um cliente de exemplo e conferir a trilha;
   distinguir esse conjunto dos cadastros reais de CRM/contas locais.

A persistência central e serviços externos exigem trabalho descrito em
[integrações](manuais-de-integracao.md). Comandos de verificação estão em
[desenvolvimento local](desenvolvimento-local.md); acessos em
[demonstração](painel-demonstracao.md).
