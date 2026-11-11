# Funcionalidades atuais dos três modelos

Este inventário descreve o código que alimenta a demonstração do GitHub Pages.
Os módulos são cumulativos: DriveNow inclui a base do AutoElite; Enterprise
inclui a base administrativa do DriveNow e acrescenta ferramentas próprias.
Quantidade de telas no menu não equivale a quantidade de integrações prontas.

## Base disponível nos três modelos

- Página inicial com animação em vídeo e seleção de até seis veículos publicados,
  conforme a disponibilidade do estoque.
- Páginas de estoque, destaques e Sobre Nós e Contato.
- Busca, filtros e ordenação do catálogo, com opções diferentes em cada modelo.
- Anúncio em modal, com galeria de fotos, miniaturas, dados do veículo, opcionais,
  ficha técnica e informações de laudo cadastradas pela loja.
- Atendimento automático dentro do anúncio, histórico da conversa na sessão,
  perguntas rápidas e registro de preferência. O contato com um funcionário
  continua no WhatsApp da loja, levando o contexto da conversa e do veículo.
- Simulador ao final do anúncio, aberto após login: entrada, prazo de 12 a 60
  meses, taxa mensal ajustável, parcela estimada, saldo financiado, juros e total.
  O cálculo usa a Tabela Price com taxa ilustrativa; não aprova crédito nem
  consulta bancos.
- Formulário institucional para contato, com encaminhamento da mensagem à loja.
- Login único de cliente ou funcionário, identificado pelas credenciais, com
  visual próprio de cada modelo. O painel só aparece para a equipe autenticada.
- Demonstração com dados guardados no navegador e separados por loja. Não há
  autenticação real hospedada, cadastro real de clientes ou envio de e-mails.

## Modelo 1 — AutoElite Seminovos

### Experiência do visitante e cliente

- Abertura dividida entre apresentação/busca e vídeo; identidade azul.
- Vitrine em grade com cartões verticais e navegação compacta.
- Busca por texto e categoria: SUV, sedan, hatch, picape e esportivo.
- Ordenação por destaque, preço, ano ou quilometragem.
- Galeria, ficha, laudo informado, atendimento e financiamento no anúncio.
- O financiamento público fica no próprio anúncio. Não há página independente
  de serviços, avaliação de troca, favoritos ou comparador.
- Visualização 360° não está incluída na configuração deste modelo.

### Painel do lojista — cinco módulos

1. **Início e indicadores:** quantidade em estoque, vendas recentes, veículos
   parados e novos contatos; lista de pendências calculada a partir dos dados
   salvos nesta loja.
2. **Estoque de veículos:** cadastrar, editar, excluir, publicar/ocultar, registrar
   situação de venda e editar informações comerciais. Gerenciar fotos, capa e
   ordem da galeria; alterações atualizam a vitrine local.
3. **Contatos e WhatsApp:** consultar e filtrar contatos por situação, atualizar
   atendimento, registrar observações e acompanhar o histórico.
4. **Simulador de financiamento:** preparar estimativas durante o atendimento,
   usando os veículos do estoque.
5. **Contratos e termos:** emitir compra e venda, recibo de sinal e termo de
   vistoria; visualizar, imprimir/salvar PDF pelo navegador e compartilhar uma
   mensagem no WhatsApp. Os documentos básicos ficam salvos por loja.

## Modelo 2 — DriveNow Multimarcas

### Experiência do visitante e cliente

- Abertura cinematográfica, marca centralizada, identidade âmbar e apresentação
  editorial, com anúncios horizontais e fotografias amplas na página inicial.
- Estoque com pesquisa textual, filtro por marca e blindagem, além de ordenação
  por preço e ano.
- Página **Serviços**, reunindo financiamento, avaliação de troca e atendimento.
- Página independente de **financiamento**, além do simulador dentro do anúncio.
- **Avaliação do usado na troca:** formulário com identificação do cliente,
  dados do veículo, ano, quilometragem, blindagem, interesse e observações;
  registra um contato e prepara a mensagem para negociação no WhatsApp. Não
  calcula uma oferta automática de compra.
- Atendimento/concierge no site, também disponível no anúncio. A lógica de
  atendimento embutida é compartilhada com os demais modelos.
- Não inclui favoritos, comparador, TCO, dossiê ampliado ou visualizador 360°.

### Painel do lojista — nove módulos

Inclui os cinco módulos do AutoElite e acrescenta:

6. **Clientes (CRM):** cadastrar e pesquisar clientes, consultar contatos,
   converter um contato em cliente e iniciar a emissão de documento com os
   dados do cliente selecionado.
7. **Precificador FIPE:** informar uma referência de preço, custo de preparação
   e margem desejada; calcular teto de compra, venda sugerida e lucro previsto.
   Mantém histórico na tela; o valor FIPE é preenchido manualmente.
8. **Financeiro e margens:** lançar, editar e excluir gastos por veículo;
   acompanhar aquisição, custos e resultado estimado ou realizado, conforme os
   valores cadastrados e a situação da venda. Exclusivo do proprietário.
9. **Métricas do site:** páginas visualizadas, anúncios abertos, cliques no
   WhatsApp e ranking de interesse, com períodos de 7, 30 e 90 dias. Os eventos
   são deste navegador; não são visitantes únicos nem tráfego consolidado.

## Modelo 3 — Enterprise Veículos

### Experiência do visitante e cliente

- Vídeo panorâmico, identidade ciano, faixa horizontal de filtros na inicial,
  cartões amplos em duas colunas e atalhos de favoritos/comparação.
- Estoque com busca por modelo/marca, filtros de marca e categoria, ordenação
  por preço, quilometragem ou recomendação; filtros laterais na página completa.
- Financiamento em página própria e no anúncio; formulário de veículo na troca.
- **Favoritos:** salvar/remover veículos e consultar a lista pessoal após login,
  com separação por conta e loja no navegador.
- **Comparador:** selecionar até três veículos, consultar dados lado a lado,
  remover escolhas e iniciar financiamento do veículo escolhido.
- **Visualizador 360°:** incluído neste modelo para anúncios com sequência
  orbital cadastrada; não gera imagens 360° a partir de uma foto comum.
- **TCO no anúncio:** estimar despesas anuais/mensais com combustível, seguro,
  IPVA e revisões, ajustando uso mensal e preço do combustível. As premissas
  são ilustrativas e não substituem cotações reais.
- **Dossiê do veículo:** exibir histórico, procedência, proprietários anteriores,
  revisão e origem a partir dos dados cadastrados; campos ausentes são indicados.
- **Interesse em condição de preço:** informar contato e valor desejado,
  registrar o interesse e levar a mensagem ao WhatsApp. Não há monitoramento
  automático de preço nem envio de notificações.
- **Consultor virtual:** tela de conversa com sugestões de veículos por temas
  e perguntas rápidas. A implementação atual usa respostas programadas locais;
  não está conectada a um serviço de inteligência artificial.
- O botão **Falar com a equipe** foi retirado do cabeçalho. O atendimento do
  anúncio e os demais contatos existentes continuam disponíveis.

### Painel do lojista — dezesseis módulos

Inclui os nove módulos do DriveNow e acrescenta:

10. **Consignação completa:** tela com dados do consignante, remuneração,
    taxas, diárias de guarda, vigência e prazo de repasse.
11. **Contratos avançados e troca:** telas de consignação, compra e venda com
    veículo na troca e aditivos, com previsão de testemunhas e impressão.
12. **DRE e comissões:** demonstrativo de estoque próprio/consignado, vendas,
    comissões e relatório bancário em texto. Exclusivo do proprietário.
13. **Precificador de mercado e leilão:** formulário com referência FIPE,
    concorrentes inseridos manualmente, histórico de leilão, liquidez,
    preparação e margem.
14. **Funil de vendas e giro:** visualização de etapas de conversão, tempo de
    resposta e veículos parados.
15. **Estúdio de Stories:** prévia de três layouts verticais, modos de preço e
    enquadramento; tela de status da integração com Instagram.
16. **Auditoria e LGPD:** telas para visualizar registros, consultar dados de
    um titular e solicitar anonimização. Exclusivo do proprietário.

Esses sete módulos adicionais têm limites importantes na versão publicada,
descritos abaixo.

## Permissões reais do menu

| Perfil | AutoElite | DriveNow | Enterprise |
| --- | --- | --- | --- |
| Visitante/cliente | Sem painel | Sem painel | Sem painel |
| Atendente | 5 módulos | 7 módulos | 9 módulos |
| Gerente | 5 módulos | 8 módulos | 13 módulos |
| Proprietário | 5 módulos | 9 módulos | 16 módulos |

- Atendente tem contratos básicos e financiamento nas três edições.
- No DriveNow, CRM e precificador FIPE também ficam disponíveis ao atendente;
  métricas ficam para gerente/proprietário, e financeiro para proprietário.
- No Enterprise, atendente também acessa precificador de mercado e Stories.
  Consignação, contratos avançados e funil ficam para gerente/proprietário.
- Financeiro por veículo, DRE/comissões e auditoria/LGPD ficam para proprietário.
- Dentro do estoque, excluir veículos fica para gerente/proprietário. O atalho
  do CRM para iniciar documento com o cliente selecionado também fica para
  gerente/proprietário; o atendente emite documentos pelo módulo básico.

## Limites encontrados nos recursos avançados

- **Consignação:** a lista é demonstrativa; salvar retorna sucesso sem persistir
  uma nova consignação no modo estático.
- **Contratos avançados:** o retorno local é uma minuta mínima de demonstração,
  sem preencher o instrumento completo com os dados do formulário.
- **DRE/comissões e funil:** apresentam conjuntos de números de exemplo, sem
  consolidar automaticamente as alterações do estoque, contatos e despesas
  locais. O relatório bancário usa esses mesmos dados de exemplo.
- **Precificador avançado:** o cálculo local é simplificado e não incorpora
  todos os parâmetros que aparecem no formulário, incluindo preços dos
  concorrentes, custo de preparação e margem configurada.
- **Stories:** a prévia visual existe, mas o botão de download apenas abre um
  aviso; ainda não gera o arquivo de imagem. Publicação no Instagram não está
  configurada.
- **Auditoria/LGPD:** os retornos locais são exemplos, sem auditoria persistente
  ou anonimização efetiva dos cadastros locais.
- **Exportação para portais:** o botão depende de `/api/tier3/portals/export`,
  indisponível no GitHub Pages.
- **Consultor Enterprise:** além das respostas programadas, ainda contém textos
  herdados de DriveNow e afirmações genéricas de consumo, garantia e aprovação
  de laudos. Essas afirmações não são verificações do veículo consultado.

## Por que as diferenças parecem pequenas

As três versões compartilham navegação, anúncio, atendimento, financiamento,
login e grande parte do painel. Para um visitante, o DriveNow acrescenta
principalmente serviços e formulário de troca. O Enterprise oferece mais
diferenças de escolha do veículo: favoritos, comparação, 360°, TCO e dossiê.

As maiores diferenças de quantidade ficam no painel de proprietário. Vários
recursos exclusivos desse painel ainda são telas demonstrativas ou integrações
pendentes; devem ser apresentados com esse limite, em vez de como operações
completas já conectadas ao negócio.

## Referências no código

- `sites/*/src/App.jsx`: páginas efetivamente acessíveis em cada modelo.
- `sites/*/src/pages/HomePage.jsx`: estrutura das páginas iniciais.
- `packages/merchant-core/src/utils/merchantAccess.js`: permissões por modelo/cargo.
- `packages/merchant-core/src/components/layout/MerchantSidebar.jsx`: nomes do menu.
- `packages/merchant-core/src/services/apiClient.js`: respostas estáticas e integrações.
- `packages/merchant-core/src/components/common/VehicleAdServices.jsx`: atendimento
  e financiamento compartilhados nos anúncios.
