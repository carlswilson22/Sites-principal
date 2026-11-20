# Documento de requisitos

**Status:** proposta para aprovação (Fase 3). Pode virar anexo técnico do contrato depois de revisado.
**Data:** 17/11/2026.
**Relacionados:** [arquitetura](arquitetura.md), [matriz de funcionalidades](matriz-de-funcionalidades.md), [base para contratação](base-para-contratacao.md).

## 1. Como ler este documento

- Cada requisito tem um **código** (por exemplo `SP-03`) para ser citado no contrato.
- **Pacote** indica a partir de qual pacote o item é entregue: **Basic (1), Expert (2) ou Premium (3)**. Os pacotes são cumulativos e têm conteúdo padronizado e fixo.
- Os modelos de demonstração (AutoElite, DriveNow, Enterprise) correspondem a Basic, Expert e Premium.
- Qualquer módulo fora do pacote contratado pode ser comprado **avulso** (ver seção 2.1). Não há pacote com itens removidos: o padrão dos três pacotes se mantém.
- A lista final de módulos de cada cliente (pacote mais avulsos) fica no anexo do contrato dele.
- Valores marcados **A definir** dependem de decisão comercial ou de negociação.

## 2. Pacotes

| Pacote | Foco | Resumo |
| --- | --- | --- |
| 1 Basic | Vitrine e atendimento | Site com estoque, anúncio, contatos e simulação. Painel com 5 módulos |
| 2 Expert | Gestão da loja | Tudo do 1, mais clientes, precificação, financeiro por veículo, métricas, troca e serviços. Painel com 9 módulos |
| 3 Premium | Gestão completa | Tudo do 2, mais consignação, contratos avançados, DRE, mercado e leilão, funil, Stories, auditoria e LGPD, e recursos de comparação no site. Painel com 16 módulos |

## 2.1 Módulos avulsos

Qualquer cliente, em qualquer pacote, pode contratar módulos avulsos. Cada módulo avulso tem preço próprio (**A definir**) e passa a valer na instalação do cliente sem alterar o código: é ativado pela empresa fornecedora. O proprietário da loja não consegue ativar módulos sozinho.

| Módulo avulso | Códigos | Já incluso em |
| --- | --- | --- |
| Descrição por IA | PN-19, IN-04 | Nenhum pacote (**sempre avulso**) |
| Comparador de veículos | SP-16 | Premium |
| Visualizador 360° | SP-17 | Premium |
| Calculadora de custo total (TCO) | SP-18 | Premium |
| Dossiê do veículo | SP-19 | Premium |
| Favoritos | SP-15 | Expert e Premium |
| Pedido de aviso por condição de preço | SP-20 | Premium |
| Consultor virtual | SP-21 | Premium |
| Clientes (CRM), Precificador FIPE, Financeiro por veículo, Métricas do site | PN-06 a PN-09 | Expert e Premium |
| Consignação, Contratos avançados, DRE, Mercado e leilão, Funil, Stories, Auditoria e LGPD | PN-10 a PN-16 | Premium |
| Consulta de placa, Instagram, WhatsApp Cloud API | IN-06 a IN-08 | Nenhum (integrações com custo de terceiros) |

Os módulos essenciais (início, estoque, contatos, equipe, configurações e contas de clientes) fazem parte de todos os pacotes e não podem ser removidos.

## 3. Site público

| Código | Requisito | Pacote | Critério de aceite |
| --- | --- | --- | --- |
| SP-01 | Página inicial com apresentação da loja e até 6 veículos publicados e não vendidos, priorizando destaques | 1 | Veículos vendidos ou não publicados não aparecem |
| SP-02 | Estoque com busca por texto, filtros e ordenação por preço, ano, quilometragem e destaque | 1 | Filtros combinam entre si e o resultado bate com o cadastro |
| SP-03 | **Página própria por veículo**, com endereço (URL) único, galeria, ficha, opcionais e laudo informado pela loja | 1 | Link abre direto o anúncio e pode ser compartilhado |
| SP-04 | Dados para buscadores: título e descrição por página, mapa do site e dados estruturados do veículo | 1 | Validados por ferramenta de teste do Google antes da entrega |
| SP-05 | Botão "Tenho interesse" que abre o WhatsApp da loja com mensagem pronta, por ação do visitante | 1 | Número e mensagem corretos, por veículo |
| SP-06 | Formulário de contato que registra um lead no painel | 1 | Lead aparece no painel com origem e veículo |
| SP-07 | Atendimento automático no anúncio, com respostas programadas a partir do cadastro do veículo | 1 | Respostas não afirmam dado que não está cadastrado |
| SP-08 | Sobre Nós e Contato: história, endereço, horários, mapa e canais | 1 | Dados vêm da configuração da loja |
| SP-09 | Cadastro e login de cliente, com recuperação de senha por e-mail | 1 | Cliente recebe o e-mail e redefine a senha. Link vale uma vez |
| SP-10 | Simulador de financiamento no anúncio (Tabela Price), com entrada, prazo e taxa **configurável pela loja** | 1 | Resultado igual ao cálculo de referência. Aviso de que é estimativa, sem aprovação de crédito |
| SP-11 | Aviso de privacidade e registro de consentimento (texto, data e versão) nos formulários | 1 | Consentimento gravado junto ao lead |
| SP-12 | Página de serviços e página de financiamento independente | 2 | Conteúdo editável no painel |
| SP-13 | Avaliação do usado na troca: dados do cliente e do veículo, registro como lead | 2 | Registro com origem "avaliação de troca". Não calcula oferta automática |
| SP-14 | Atendimento em tela própria (concierge) | 2 | Acessível do menu |
| SP-15 | Favoritos (exige login) | 2 | Lista por conta, mantida entre dispositivos |
| SP-16 | Comparador de 2 a 3 veículos, público | 3 | Resumo de menor preço, menor quilometragem e ano mais recente |
| SP-17 | Visualizador 360° por veículo, a partir da sequência enviada pela loja | 3 | Indisponível quando não há sequência válida |
| SP-18 | Calculadora de custo total (TCO) com premissas ajustáveis | 3 | Premissas identificadas como estimativas |
| SP-19 | Dossiê do veículo com os dados cadastrados pela loja | 3 | Campos ausentes são indicados. Não certifica procedência |
| SP-20 | Pedido de aviso por condição de preço | 3 | Registra contato e valor desejado. Não monitora preço sozinho |
| SP-21 | Consultor virtual em tela própria | 3 | Sugestões a partir do estoque. Usa IA se o módulo estiver ativo |

## 4. Painel do lojista

**Perfis:** `P` proprietário, `G` gerente, `A` atendente. Quem não está listado não acessa. O proprietário acessa tudo o que o pacote incluir.

| Código | Módulo | Pacote | Perfis | O que entrega |
| --- | --- | --- | --- | --- |
| PN-01 | Início e indicadores | 1 | P G A | Estoque, vendas recentes, veículos parados, novos contatos e pendências, calculados dos dados reais |
| PN-02 | Estoque | 1 | P G A | Cadastro, edição, situação, publicação, informações comerciais, fotos, capa e ordem. Exclusão só para P e G |
| PN-03 | Contatos e WhatsApp | 1 | P G A | Lista, filtros, situação, temperatura, observações e histórico |
| PN-04 | Simulador de financiamento | 1 | P G A | Simulação durante o atendimento, com taxa manual |
| PN-05 | Contratos e termos | 1 | P G A | Compra e venda, recibo de sinal e termo de vistoria, com prévia, impressão e histórico |
| PN-06 | Clientes (CRM) | 2 | P G A | Cadastro com CPF e endereço cifrados, busca, conversão de lead em cliente |
| PN-07 | Precificador FIPE | 2 | P G A | Referência FIPE (consulta ou manual), custos de preparação e margem. Calcula teto de compra e venda sugerida |
| PN-08 | Financeiro por veículo | 2 | P | Lançamento de custos por veículo e margem prevista |
| PN-09 | Métricas do site | 2 | P G | Acessos, anúncios abertos e cliques no WhatsApp em 7, 30 e 90 dias |
| PN-10 | Consignação completa | 3 | P G | Consignante, comissão, taxas, diárias, vigência e repasse, com alertas de vencimento |
| PN-11 | Contratos avançados | 3 | P G | Consignação, compra e venda com troca e aditivos, com numeração e vínculo |
| PN-12 | DRE e comissões | 3 | P | Demonstrativo e comissão por vendedor, a partir dos dados reais |
| PN-13 | Mercado e leilão | 3 | P G A | Precificação com concorrentes informados à mão, leilão e liquidez |
| PN-14 | Funil e giro | 3 | P G | Etapas, conversão, tempo de resposta e estoque parado, a partir dos dados reais |
| PN-15 | Estúdio de Stories | 3 | P G A | Arte em PNG 1080x1920 com três layouts. Publicação real só com o adicional de Instagram |
| PN-16 | Auditoria e LGPD | 3 | P | Trilha de ações, exportação e anonimização de titular, em todas as bases da instalação |
| PN-17 | Usuários da equipe | 1 | P | Criar, desativar e trocar o cargo de funcionários |
| PN-18 | Configurações da loja | 1 | P | Dados da loja, horários, WhatsApp, taxas do simulador, logo e cores |
| PN-19 | Descrição por IA | **Avulso** | P G A | Rascunho de descrição do anúncio, sempre revisado por uma pessoa. Usa a franquia de IA |

Nos itens PN-12 e PN-14, **quando não houver dados suficientes, o painel mostra "sem dados"**. Não exibe números de exemplo.

## 4.1 Regras de contratos e documentos

- Os documentos são **minutas de referência** e trazem aviso legal. A loja deve submetê-las à revisão jurídica antes do uso.
- Dados da loja (nome, CNPJ, cidade) vêm da configuração, não do código.
- O sistema numera os contratos em sequência por instalação.
- Assinatura eletrônica **não está incluída** (ver seção 8).

## 5. Integrações e franquias

| Código | Integração | Pacote | Regra |
| --- | --- | --- | --- |
| IN-01 | WhatsApp por link | 1 | Incluído, sem API |
| IN-02 | E-mail transacional | 1 | Recuperação de senha e aviso de novo lead. Domínio do cliente configurado |
| IN-03 | FIPE | 2 | Consulta com cache mensal e entrada manual como alternativa. Mostra o mês de referência |
| IN-04 | IA para descrição e consultor | **Avulso** | Franquia mensal incluída no módulo avulso. Excedente cobrado. Só gera rascunho e não afirma laudo, perícia ou crédito sem dado cadastrado |
| IN-05 | Exportação do estoque | 3 | Arquivo CSV. Não é publicação direta em portais |
| IN-06 | Consulta de placa e histórico | Adicional | Pago por consulta, com franquia. A definir |
| IN-07 | Instagram | Adicional | Conta do cliente. Exige aprovação da Meta |
| IN-08 | WhatsApp Cloud API | Adicional | Conta do cliente. Custo por mensagem repassado |

**Regra geral:** cada integração informa claramente `não configurada` ou `erro`. Nenhuma simula sucesso.

**Franquia:** o painel mostra o consumo, avisa o proprietário aos 80% e, ao esgotar, o sistema continua e o excedente é cobrado.

## 6. Requisitos não funcionais

### 6.1 Segurança

Todos os itens da seção 10 da [arquitetura](arquitetura.md) são requisitos, em especial:

- NF-01: sem chave de cifragem padrão nem contas de teste em produção;
- NF-02: sessão com cookie seguro e token guardado em hash;
- NF-03: permissão por cargo verificada no servidor em toda rota sensível;
- NF-04: limite de tentativas em login e formulários públicos;
- NF-05: CPF, endereço e dados bancários cifrados em repouso;
- NF-06: validação de entrada e limite de tamanho em toda rota;
- NF-07: dependências com verificação automática de vulnerabilidades.

### 6.2 Privacidade e LGPD

- NF-08: cada cliente tem **banco e segredos próprios**, sem mistura com outras lojas.
- NF-09: consentimento registrado com texto, data e versão.
- NF-10: exportação e anonimização de titular cobrem **todas** as tabelas da instalação, e a lista do que não cobre (por exemplo backups) é informada ao cliente.
- NF-11: o monitoramento central recebe só dados agregados, sem dado pessoal. Acesso de suporte a leads só com autorização do cliente e registro em auditoria.
- NF-12: o contrato define papéis (controlador e operador), fornecedores que tratam dados e prazos de retenção. **A definir com assessoria jurídica.**

### 6.3 Disponibilidade, backup e suporte

| Código | Requisito | Valor |
| --- | --- | --- |
| NF-13 | Backup diário do banco e das fotos, em local externo | Retenção: **A definir** |
| NF-14 | Teste de restauração periódico, com registro | Frequência: **A definir** |
| NF-15 | Monitoramento de disponibilidade | Meta de disponibilidade: **A definir** |
| NF-16 | Suporte | Canal, horário e prazo de resposta: **A definir** |
| NF-17 | Atualizações e correções | Frequência e janela: **A definir** |

### 6.4 Desempenho e compatibilidade

- NF-18: o site funciona em computador e celular, nas duas últimas versões dos navegadores Chrome, Edge, Safari e Firefox. **Lista final a confirmar.**
- NF-19: metas de tempo de carregamento só serão assumidas depois de medidas em um dispositivo e rede definidos. **Não há meta numérica fixada neste documento.**
- NF-20: acessibilidade com nível a definir. Recomendação: seguir o nível AA do WCAG 2.1 nas telas principais.

## 7. Dados e implantação

| Código | Requisito |
| --- | --- |
| DI-01 | Importação inicial do estoque por planilha CSV. Formato e volume **a definir** |
| DI-02 | Exportação completa dos dados do cliente (banco e mídia) ao fim do contrato |
| DI-03 | Ambiente de homologação para o cliente validar antes da publicação |
| DI-04 | A instalação em produção **não contém** dados fictícios, contas de teste nem fotos de demonstração |
| DI-05 | Uma instalação nova é criada por script, com usuário proprietário inicial e troca de senha obrigatória |
| DI-06 | Demonstração de vendas separada: instalação real com dados fictícios, reiniciada todo dia |

## 8. Fora do escopo

Não fazem parte de nenhum pacote, e cada um exigiria escopo e preço próprios:

- aprovação de crédito ou integração direta com bancos;
- publicação direta em OLX, Webmotors, iCarros e Mercado Livre;
- assinatura eletrônica de contratos;
- pagamento on-line;
- aplicativo móvel;
- emissão fiscal;
- chat com atendente humano dentro do site;
- agendamento de visitas pelo site;
- certificação de conformidade com a LGPD.

## 9. O que o cliente precisa fornecer

Detalhado no briefing (Fase 5). Em resumo: dados da empresa, identidade visual, fotos e vídeos com direito de uso, estoque inicial, contatos de equipe, domínio, e contas das integrações que ficam no nome dele.

## 10. Critérios gerais de aceite

Aplicam-se aos módulos contratados, no ambiente de homologação:

1. O cadastro feito no painel aparece no site e permanece após sair e entrar.
2. Cada perfil acessa só os módulos permitidos, inclusive por requisição direta à API.
3. Os cálculos conferem com os valores de referência.
4. Cada integração contratada funciona com a conta de teste e trata erros de forma visível.
5. A instalação final não contém dados fictícios.
6. Backup e restauração foram executados com sucesso uma vez.

Procedimento de registro de falhas, prazo de correção e termo de aceite: **A definir no contrato.**

## 10.1 Situação de implementação (18/11/2026)

> **Atualização de 19/11/2026:** o produto passa a ser os próprios protótipos (`sites/auto-dealership`, `sites/luxury-dealership`, `sites/popular-dealership`), ligados ao servidor em modo real (`VITE_MERCHANT_DEMO=false`). Os apps Astro `sites/loja` e `sites/painel` ficam guardados, sem uso e sem novos investimentos. Onde este documento os trata como o front do produto, vale a nota acima.

Referência: servidor da instalação (back-end). O site novo (`sites/loja`) está construído para os três pacotes: vitrine, anúncio com endereço próprio, simulador, contato, conta do cliente, favoritos, Serviços, Troca Fácil e, no Premium, comparador, 360°, TCO, dossiê, pedido de condição de preço e consultor virtual. O painel novo (`sites/painel`) cobre o essencial: login com troca obrigatória da senha provisória, início com indicadores e primeiros passos, estoque (cadastro, edição, fotos reduzidas no navegador, venda, exclusão e importação de planilha), contatos e atendimento, configurações da loja (dados, horários, serviços, identidade, simulador, comissão) e equipe. Faltam no painel os módulos por pacote: CRM, precificador FIPE, financeiro por veículo, métricas, consignação, contratos, DRE e comissões, mercado e leilão, funil, Stories e auditoria/LGPD.

| Situação | Requisitos |
| --- | --- |
| **Pronto e testado no servidor** | IN-02 (e-mails de recuperação de senha, novo contato e franquia; exige provedor de e-mail configurado), importação de estoque, PN-10 (consignação, com validação e encerramento), PN-11 (contratos avançados com dados reais da loja), PN-13 (financeiro com preço de venda real e comissão configurável), SP-06, SP-09 (cadastro, login e recuperação de senha por e-mail), SP-10 (taxa configurável pela loja), SP-11 (consentimento com versão e data), SP-13, SP-15, SP-20; PN-01 a PN-05, PN-06, PN-09, PN-17, PN-18; IN-01; NF-01 a NF-06, NF-08, NF-09; DI-04, DI-05 |
| **Parcial** | PN-19 e IN-04 (IA: consumo e franquia prontos; falta escolher o provedor e ligar de verdade); PN-07 e IN-03 (FIPE: cálculo pronto, consulta real e cache mensal pendentes); PN-12 e PN-14 (calculam só dados reais, mas o funil ainda não usa as visitas registradas; a sugestão de desconto é regra fixa de 4% e 7%); PN-16 (anonimização cobre cadastro, contatos, conta no site e pedidos de troca; não cobre consignações nem o texto de contratos já emitidos, que seguem a guarda legal); NF-07 (sem verificação automática de dependências) |
| **Pendente** | SP-01 a SP-05, SP-07, SP-08, SP-12, SP-14, SP-16 a SP-19, SP-21 (dependem do site novo); PN-15 (Stories: a arte é gerada e baixada; a publicação real no Instagram exige conta comercial e token, e não foi testada); NF-11 (Torre de controle); NF-13 a NF-17 (backup externo, monitoramento, suporte); DI-01 a DI-03, DI-06 |

Lacunas encontradas nesta revisão e que entram no escopo:
1. **LGPD (NF-10):** a anonimização agora alcança cadastro, contatos, conta do site, favoritos e pedidos de troca; faltam consignações e a regra de retenção dos contratos emitidos.
2. **Retenção de dados:** falta definir por quanto tempo guardar métricas de acesso, leads sem contato e contas inativas.
3. **Aviso de franquia:** resolvido em 19/11/2026: e-mail ao proprietário (e cópia à empresa) aos 80% e ao esgotar, uma vez por mês. Também resolvidos: aviso de novo contato por e-mail e importação de estoque por planilha (API e linha de comando).

## 11. Decisões

Decididas em 17/11/2026:

1. **Nomes dos pacotes:** Basic, Expert e Premium.
2. **Distribuição dos módulos:** o padrão dos três pacotes é mantido. Quem quiser algo de outro pacote compra **avulso**, em qualquer pacote.
3. **Descrição por IA:** módulo avulso, fora de todos os pacotes.

Em aberto:

1. Preço de cada pacote e de cada módulo avulso (decisão comercial).
2. Metas de disponibilidade, suporte e retenção de backup.
3. Franquia de IA e de consultas incluída por módulo e preço do excedente.
