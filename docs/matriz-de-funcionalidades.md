# Matriz de modelos e permissões

Atualizada em **17/11/2026**, referência `3f3961d`. Descreve a configuração
demonstrada; a seleção contratual será feita na [base técnica](base-para-contratacao.md).

## Site público

| Recurso | AutoElite (1) | DriveNow (2) | Enterprise (3) | Condição atual |
| --- | --- | --- | --- | --- |
| Vídeo, inicial, estoque, destaques e Sobre Nós e Contato | Sim | Sim | Sim | Conteúdo ilustrativo, apresentação própria |
| Anúncio, galeria, ficha e laudo cadastrado | Sim | Sim | Sim | Sem validação oficial externa |
| Atendimento automático no anúncio e WhatsApp | Sim | Sim | Sim | Respostas locais; funcionário no WhatsApp |
| Cadastro e login de cliente | Sim | Sim | Sim | Conta local neste navegador |
| Financiamento no anúncio com três bancos ilustrativos | Sim | Sim | Sim | Exige login; sem consulta/aprovação bancária |
| Serviços, financiamento independente e formulário de troca | Não | Sim | Sim | Referências manuais e registro de interesse |
| Favoritos | Não | Sim | Sim | Exige login; conta/loja local |
| Comparação de dois a três veículos | Não | Não | Sim | Pública, sem login |
| Visualizador 360° padrão | Não | Não | Sim | Exige sequência própria por veículo |
| TCO, dossiê e interesse em condição de preço | Não | Não | Sim | Estimativas/cadastro, sem notificações automáticas |
| Consultor virtual em tela própria | Não | Não | Sim | Respostas programadas, sem IA externa |

É possível configurar 360° em outras lojas, como personalização a definir;
não está incluído no padrão dos modelos 1 e 2.

## Módulos do painel

**T** = atendente; **G** = gerente; **P** = proprietário. Os perfis indicam
acesso à rota no frontend, desde que a edição inclua o módulo.

| Rota / módulo | AutoElite | DriveNow | Enterprise | Perfis | Operação na demonstração |
| --- | --- | --- | --- | --- | --- |
| `dashboard` — Início e indicadores | Sim | Sim | Sim | T/G/P | Dados locais |
| `inventory` — Estoque | Sim | Sim | Sim | T/G/P | Cadastro, edição, publicação e mídia locais |
| `leads` — Contatos e WhatsApp | Sim | Sim | Sim | T/G/P | Situações, observações e histórico |
| `financing` — Financiamento | Sim | Sim | Sim | T/G/P | Estimativa com taxa manual |
| `contracts` — Contratos e termos | Sim | Sim | Sim | T/G/P | Minutas básicas, histórico e impressão |
| `clients` — Clientes (CRM) | Não | Sim | Sim | T/G/P | Cadastros locais |
| `fipe` — Precificador FIPE | Não | Sim | Sim | T/G/P | Referência manual, custos e margem |
| `financial` — Financeiro e margens | Não | Sim | Sim | P | Gastos locais; resultado realizado exige valor de venda |
| `analytics` — Métricas do site | Não | Sim | Sim | G/P | Eventos do navegador, 7/30/90 dias |
| `consignments` — Consignação completa | Não | Não | Sim | G/P | Dados e cálculos persistidos localmente |
| `contracts_adv` — Contratos avançados | Não | Não | Sim | G/P | Minutas com dados, numeração e aditivos |
| `financial_full` — DRE e comissões | Não | Não | Sim | P | Números de exemplo |
| `market_pricing` — Mercado e leilão | Não | Não | Sim | T/G/P | Entradas manuais e cálculo |
| `funnel` — Funil e giro | Não | Não | Sim | G/P | Números de exemplo |
| `stories` — Estúdio de Stories | Não | Não | Sim | T/G/P | PNG e publicação fictícia local |
| `audit_lgpd` — Auditoria e LGPD | Não | Não | Sim | P | Clientes de exemplo, sem cobertura de todas as bases |

| Perfil | AutoElite | DriveNow | Enterprise |
| --- | --- | --- | --- |
| Atendente | 5 | 7 | 9 |
| Gerente | 5 | 8 | 13 |
| Proprietário | 5 | 9 | 16 |

Visitante/cliente não têm painel. Excluir veículo exige gerente/proprietário.
O atalho do CRM para emitir documento também é restrito a esses perfis;
atendente usa o módulo básico de contratos.

## Tela e autorização em servidor

Fonte: `packages/merchant-core/src/utils/merchantAccess.js`. No modo local,
as regras estão no navegador e não protegem dados reais. Não há segregação
comprovada de acesso somente a leads atribuídos; não oferecer essa garantia.

O servidor separado possui autenticação, verificações de nível e de cargo em
rotas específicas. Financiamento e contratos básicos são permitidos no nível 1,
embora implementados em `tier2Routes.js`. O prefixo da URL não define sozinho
a autorização.

O Estúdio abre para os três perfis no frontend; publicação real na API exige
gerente/proprietário. A rota de exportação de titular verifica sessão, mas
não aplica a restrição de proprietário que o menu de auditoria impõe. Esse
desalinhamento precisa de correção/homologação antes do uso de dados reais.
Simulação local não comprova essas autorizações. Homologar
cada operação e acesso por requisição direta no servidor da futura instalação.

## Serviços não ativados na publicação

Autenticação central de clientes, recuperação por e-mail, aprovação bancária,
FIPE atualizada, IA generativa conectada, Web Push, Instagram real e envio direto
a portais não estão operacionais na demonstração. Não há auditoria imutável
certificada ou conformidade LGPD garantida. Veja [integrações](manuais-de-integracao.md)
e [segurança/privacidade](politica-de-seguranca-lgpd.md).
