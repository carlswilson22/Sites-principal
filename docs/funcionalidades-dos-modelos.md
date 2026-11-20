# Funcionalidades atuais dos três modelos

Atualizado em **17/11/2026**, referência `3f3961d`. Inventário da demonstração;
para preparar o contrato, selecione os itens na [base técnica](base-para-contratacao.md).
Os módulos administrativos são cumulativos; as propostas visuais são distintas.

## Base dos três modelos

- Inicial com vídeo e até seis veículos publicados e não vendidos, priorizando
  destaques. Havendo menos veículos, aparecem somente os disponíveis.
- Estoque, destaques e Sobre Nós e Contato; busca, filtros e ordenação conforme
  o modelo; tipografia Inter e adaptação para computador/celular.
- Anúncio compacto com galeria, miniaturas, preço, ano, quilometragem, câmbio e
  combustível. Informações adicionais em seções verticais expansíveis; apenas
  uma seção de ferramenta, atendimento ou financiamento aberta por vez.
- Galeria ampliada, opcionais, ficha técnica e laudo informado pela loja.
  Não há consulta oficial de histórico, débitos ou perícia.
- Atendimento automático no anúncio: respostas programadas baseadas no catálogo,
  perguntas rápidas e registro de preferência. Conversa na sessão do navegador,
  separada por loja/veículo. Não é atendimento humano ao vivo.
- Um único botão de WhatsApp no rodapé do anúncio: **Tenho interesse**.
  Encaminhamento ao funcionário por ação explícita do visitante.
- Financiamento no anúncio, após login: **Condição A, Condição B e Condição C**
  (nomes e taxas configuráveis pela loja), com taxas ilustrativas de 1,42%, 1,45% e 1,49% ao mês. Entrada
  entre 0% e 80%, atalhos 20%/30%/50% e prazos 12/24/36/48/60 meses. Tabela
  Price para parcela, juros e total. Sem IOF, tarifas, seguros ou CET; sem
  consulta/aprovação de crédito ou vínculo comercial com instituição financeira.
- Contato institucional: registro local e mensagem preparada para WhatsApp.
  Não envia e-mail nem agenda visitas.
- Login único de cliente ou equipe, reconhecido pelas credenciais. Cadastro
  público cria somente cliente. Painel apenas para equipe autenticada.
- Contas e dados demonstrativos no navegador, separados por loja. Senhas
  cadastradas usam hash scrypt com salt. Sem sincronização entre dispositivos;
  não constitui autenticação de produção para dados reais.

Veja a [experiência dos anúncios](experiencia-anuncios.md) para navegação,
conservação dos campos e carregamento sob demanda.

## Modelo 1 — AutoElite Seminovos

### Site público

Identidade azul; abertura dividida entre busca e vídeo, com destaque para a
animação; cartões verticais em grade. Busca por texto e categoria (SUV, sedan,
hatch, picape e esportivo); ordenação por destaque, preço, ano ou quilometragem.
Atendimento e financiamento no anúncio.

Não inclui favoritos, comparação, 360°, TCO, dossiê ampliado, formulário de
troca ou página independente de financiamento na configuração padrão.

### Painel — cinco módulos para o proprietário

1. **Início e indicadores:** estoque, vendas recentes, veículos parados,
   novos contatos e pendências calculados dos dados locais da loja.
2. **Estoque de veículos:** cadastro, edição, exclusão autorizada, situação,
   publicação, informações comerciais, fotos, capa e ordem da galeria.
   Alterações alimentam a vitrine local.
3. **Contatos e WhatsApp:** consulta, filtros, situação, observações e histórico.
4. **Simulador de financiamento:** veículo do estoque, entrada, prazo e taxa
   manual para estimativas durante o atendimento.
5. **Contratos e termos:** compra/venda, recibo de sinal e termo de vistoria;
   prévia, impressão/salvar PDF pelo navegador, histórico local e mensagem para
   compartilhar. Sem assinatura eletrônica integrada.

## Modelo 2 — DriveNow Multimarcas

### Site público

Identidade âmbar; marca centralizada, abertura cinematográfica e apresentação
editorial, com fotografias amplas e cartões horizontais. Pesquisa textual,
filtros de marca/blindagem e ordenação por preço e ano.

Acrescenta à base:

- **Serviços** e **financiamento independente** com taxa manual, além do
  simulador com bancos ilustrativos no anúncio.
- **Avaliação do usado na troca:** dados do cliente e veículo, ano,
  quilometragem, blindagem, interesse e observações; registra contato e prepara
  negociação no WhatsApp. Não calcula oferta automática de compra.
- Atendimento/concierge em tela própria e no anúncio, com lógica automática local.
- **Favoritos:** salvar/remover e consultar após login, por conta e loja no
  navegador. Coração no cabeçalho e nos cartões; atalho "Meus favoritos" no estoque.
- Sobre Nós e Contato editorial, com história, valores, foto e contato.

Não inclui comparador, TCO, dossiê ampliado ou 360° padrão.

### Painel — nove módulos para o proprietário

Inclui os cinco anteriores e acrescenta:

6. **Clientes (CRM):** cadastro, pesquisa, consulta a contatos, conversão de
   contato em cliente e encaminhamento autorizado para emitir documento.
7. **Precificador FIPE:** referência manual, preparação e margem; calcula
   teto de compra, venda sugerida e lucro previsto. Sem consulta FIPE atualizada.
8. **Financeiro e margens:** cadastrar/editar/remover gastos por veículo;
   aquisição, custos e margem estimada. Resultado realizado exige venda e valor
   efetivo nos dados; a interface ainda não oferece esse campo. Só proprietário.
9. **Métricas do site:** páginas, anúncios abertos, cliques no WhatsApp e ranking
   em 7/30/90 dias. Eventos deste navegador, sem visitantes únicos ou
   consolidação entre dispositivos.

## Modelo 3 — Enterprise Veículos

### Site público

Identidade ciano; vídeo panorâmico, título abaixo, faixa de filtros na inicial
e cartões amplos em duas colunas. Estoque com busca, marca, categoria,
ordenação e filtros laterais. Serviços, financiamento independente e troca.
Sobre Nós e Contato com navegação por seções e painéis expansíveis de contato.

Acrescenta:

- **Favoritos** (também no DriveNow): coração à esquerda dos acessos de conta/painel,
  visível ao visitante, solicitando login. Atalhos completos ficam no estoque.
- **Comparador público:** selecionar dois a três veículos; fotos/dados lado
  a lado e resumo de menor preço, menor quilometragem e ano mais recente.
  Cinco seções: preço/FIPE, uso, laudo, documentação e especificações.
  Considera empates/ausências; usa cadastro, sem consulta externa.
- **360°:** sequência orbital própria por veículo. Não gera giro de uma foto;
  indisponível quando não há sequência válida.
- **TCO:** estimativas de combustível, seguro, IPVA e revisões; ajusta uso e
  combustível. Premissas ilustrativas, sem cotações reais de serviços/tributos.
- **Dossiê:** histórico, procedência, proprietários e revisões conforme cadastro.
  Campos ausentes são indicados; não certifica procedência.
- **Interesse em condição de preço:** contato e valor desejado para negociação.
  Não monitora preço nem envia notificações automáticas.
- **Consultor virtual:** sugestões com respostas programadas, sem IA generativa.
  Afirmações automáticas precisam ser conferidas contra os dados reais antes
  de operar uma loja em produção.

### Painel — dezesseis módulos para o proprietário

Inclui os nove anteriores e acrescenta:

10. **Consignação completa:** consignante, comissão, taxas, diárias, vigência,
    prazo e cálculo de repasse; gravação local na demonstração.
11. **Contratos avançados e troca:** minutas de consignação, compra/venda com
    troca e aditivos; dados do formulário, numeração, vínculo e impressão.
12. **DRE e comissões:** demonstrativos e relatório bancário com números de
    exemplo; não consolidam operações locais. Inclui exportação do catálogo
    em CSV local, sem publicação em portais. Exclusivo do proprietário.
13. **Precificador de mercado e leilão:** referência e concorrentes manuais,
    leilão, liquidez, preparação e margem; cálculo compartilhado com servidor.
    Não pesquisa mercado ou leilões automaticamente.
14. **Funil de vendas e giro:** etapas, conversão, resposta e estoque parado
    com números de exemplo; não consolida contatos locais.
15. **Estúdio de Stories:** estoque da loja, três layouts, preço/enquadramento
    e PNG 1080 × 1920. Publicação fictícia local, histórico e arte salva;
    não publica no Instagram real.
16. **Auditoria e LGPD:** exportação JSON e anonimização de clientes de exemplo,
    com trilha local. Não altera todas as contas/CRM/bases reais. Só proprietário.

Consignações, minutas avançadas, publicações e ações sobre titulares de exemplo
são persistidas por loja no navegador. Limpar os dados pode removê-las.
As [integrações](manuais-de-integracao.md) detalham servidor e pendências.

## Perfis e disponibilidade

| Perfil | AutoElite | DriveNow | Enterprise |
| --- | --- | --- | --- |
| Visitante/cliente | Sem painel | Sem painel | Sem painel |
| Atendente | 5 módulos | 7 módulos | 9 módulos |
| Gerente | 5 módulos | 8 módulos | 13 módulos |
| Proprietário | 5 módulos | 9 módulos | 16 módulos |

A [matriz](matriz-de-funcionalidades.md) define as permissões por módulo. A
contagem representa rotas do painel, não integrações conectadas. Trocar cargo
no painel é exclusivo da demonstração para funcionários já autenticados.

## Referências da implementação

- `sites/*/src/App.jsx` e `pages/HomePage.jsx`: páginas e apresentação.
- `packages/merchant-core/src/utils/merchantAccess.js`: edição e cargo.
- `packages/merchant-core/src/services/apiClient.js`: modo local e API.
- `packages/merchant-core/src/components/common/VehicleAdSections.jsx`: seções.
- `packages/merchant-core/src/data/financingBanks.js`: bancos/taxas ilustrativos.
