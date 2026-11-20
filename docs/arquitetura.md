# Arquitetura do sistema para concessionárias

**Status:** proposta para aprovação (Fase 2). Não é compromisso contratual.
**Data:** 17/11/2026.
**Base:** estudo do repositório Sites-principal (commit `3f3961d`) e pesquisa de APIs da Fase 1.

## 1. Decisões já tomadas

| Tema | Decisão |
| --- | --- |
| Modelo de implantação | Uma instalação por cliente, a partir de **um único código-base** |
| O que varia por cliente | Somente o front-end (identidade visual, conteúdo) e a configuração |
| O que nunca varia | O código do back-end. **Proibido fazer fork do back-end por cliente** |
| Hospedagem | Hostinger, em uma conta única da empresa (VPS) |
| Wix | Descartado |
| Contas de terceiros | Infraestrutura comum e IA na conta da empresa. Domínio, Meta/Instagram, WhatsApp e Google na conta do cliente |
| Cobrança de IA e consultas pagas | Franquia mensal incluída mais excedente repassado |
| Monitoramento | Painel central da empresa, com métricas agregadas de todas as instalações |

## 2. Visão geral

```
                     Hostinger (conta da empresa)
 ┌─────────────────────────────────────────────────────────────┐
 │ VPS                                                         │
 │  Caddy (HTTPS automático, roteia por domínio)               │
 │   ├─ cliente-a.com.br      → Front A (site)                 │
 │   ├─ api.cliente-a.com.br  → API (instância A) + SQLite A   │
 │   ├─ cliente-b.com.br      → Front B (site)                 │
 │   ├─ api.cliente-b.com.br  → API (instância B) + SQLite B   │
 │   └─ painel.empresa.com.br → Torre de controle (métricas)   │
 └─────────────────────────────────────────────────────────────┘
        │ backup diário             ▲ heartbeat e métricas
        ▼                           │ (sem dados pessoais)
  Armazenamento externo        cada instância envia
```

Cada cliente tem:
- uma instância da API, com **banco próprio** e **segredos próprios**;
- um front-end próprio, com a identidade visual dele;
- um painel do lojista, igual para todos, com logo e cores do cliente.

## 3. Estrutura do código-base

Hoje o `merchant-core` mistura lógica de negócio e telas React, e o servidor importa arquivos desse pacote. O alvo é separar em pacotes com responsabilidade única:

| Pacote | Conteúdo | Origem |
| --- | --- | --- |
| `apps/api` | Servidor, rotas, banco, segurança, integrações | `server/` |
| `packages/domain` | Regras puras: financiamento, precificação, consignação, comissão, contratos, exportação | `merchant-core/src/utils` |
| `packages/api-client` | SDK tipado que o front usa para falar com a API | `apiClient.js`, sem o modo demo híbrido |
| `apps/panel` | Painel do lojista, com tema por variáveis (logo e cores) | `merchant-core/src/pages` e `components` |
| `templates/storefront` | Modelos de site (os 3 atuais, evoluídos), copiados para um repositório por cliente | `sites/*` |
| `apps/control-tower` | Painel interno de monitoramento | novo |
| `tools/provision` | Script que cria uma nova instalação de cliente | novo |

**Contrato entre front e back:** uma especificação OpenAPI versionada (`/api/v1`). O SDK é gerado a partir dela, o que impede o front de depender de detalhes internos.

## 4. Back-end

### 4.1 Tecnologia recomendada

| Item | Recomendação | Motivo |
| --- | --- | --- |
| Linguagem | Node.js (versão LTS ativa) | Já usada, a equipe conhece |
| Framework | Fastify | Validação de entrada, rate limit, CORS e cabeçalhos de segurança prontos. Hoje há `http` puro, sem validação |
| Banco | SQLite, um arquivo por cliente, via `better-sqlite3` | O volume de uma concessionária é pequeno. Backup e entrega ao cliente são simples. O `node:sqlite` embutido ainda é experimental |
| Migrações | Arquivos SQL numerados, aplicados na inicialização, com backup antes | Hoje o schema é `CREATE IF NOT EXISTS` e não evolui com segurança |
| Acesso ao banco | Camada de repositórios | Isola o SQL e permite migrar para Postgres no futuro |
| Validação | Esquemas por rota (JSON Schema ou Zod) | Hoje não há validação |
| Testes | Testes de API em banco em memória, mais testes de contrato OpenAPI | Os 32 testes atuais viram a base |

**Alternativa:** Postgres (por exemplo Supabase). Só compensa se virar multi-tenant ou se o volume crescer. Não recomendo agora.

### 4.2 Módulos e flags

O tier 1/2/3 corresponde aos pacotes **Basic, Expert e Premium**, com conteúdo fixo. Sobre qualquer pacote, a empresa pode ativar **módulos avulsos** por cliente (`store_settings.addons`), sem criar modelo novo nem alterar o código. A IA não faz parte de nenhum pacote e é sempre avulsa. O proprietário da loja não consegue ativar módulos: só a empresa, com a chave `ADMIN_API_KEY`.

Exemplo de configuração por cliente (tabela `store_settings`, editável no painel pelo proprietário e por você):

```json
{
  "store": { "name": "...", "cnpj": "...", "whatsapp": "...", "hours": {} },
  "package": "basic",
  "addons": ["compare", "viewer360", "tco", "ai"],
  "quotas": { "ai_calls_month": 200, "plate_queries_month": 20 },
  "integrations": { "ai": "on", "email": "on", "instagram": "off" }
}
```

### 4.3 Autenticação e acesso

- Dois grupos de contas: equipe (proprietário, gerente, atendente) e clientes do site. Hoje só existe a equipe no banco.
- Sessão salva só o **hash** do token (hoje o token puro é a chave da tabela).
- Cookie `HttpOnly`, `Secure` e `SameSite=Lax`. Front e API no mesmo domínio raiz (`www.` e `api.`), o que evita problemas de cookie entre sites.
- CORS com lista de origens permitidas, vinda da configuração. Hoje reflete qualquer origem.
- Recuperação de senha por e-mail, com link de uso único e prazo curto.
- Rate limit em login, cadastro, recuperação e no envio público de leads.
- Cadastro e desligamento de funcionários pelo proprietário.
- Verificação de cargo em **todas** as rotas, via política central (hoje é feita rota a rota, e algumas ficaram sem).

### 4.4 Dados: o que muda no schema

O banco atual cobre cerca da metade do que o front usa. Acréscimos necessários:

| Necessidade | Novas estruturas |
| --- | --- |
| Veículo completo | Opcionais, destaque, preço original, tags, ficha técnica |
| Mídia | Tabela de mídia (foto, capa, ordem, quadros 360°) com arquivo no servidor |
| Laudo e dossiê | Campos estruturados com a origem registrada (`informado_pela_loja`) |
| Leads | Mensagem, responsável e histórico. Origens alinhadas com o front |
| Clientes do site | Contas de cliente, favoritos, alerta de preço, avaliação de troca |
| Configuração | `store_settings` e `integrations` (tokens cifrados) |
| Métricas | Eventos de acesso (página, anúncio aberto, clique no WhatsApp) no servidor |
| Consumo | `usage_events` (IA, consultas pagas) para a franquia |
| Auditoria | Cobertura de todas as ações sensíveis |

### 4.5 Dados reais, sem números inventados

As rotas de funil, DRE, analytics e relatório bancário passam a calcular **somente a partir dos dados da loja**. Quando não há dado suficiente, respondem "sem dados". Os valores fixos (receita de R$ 580 mil, índice "A+") são removidos. Em demonstração, os dados fictícios vêm do **seed**, nunca do código das rotas.

### 4.6 Mídia

- Upload pela API, com validação de tipo e tamanho.
- Geração automática de versões otimizadas (miniatura, tamanho médio e grande, em WebP).
- Armazenamento no disco do VPS no início, atrás de uma interface `StorageAdapter`. Troca para Cloudflare R2 sem mexer no resto.
- 360°: o cliente envia a sequência de fotos. Não é gerado de uma foto só.

## 5. Integrações

Todas passam por adaptadores com a mesma regra: **ou funciona de verdade, ou informa `não configurado` ou `erro`. Nunca finge sucesso.**

| Adaptador | Fornecedor | Situação inicial | Observações |
| --- | --- | --- | --- |
| FIPE | API de terceiros (fipe.online / Parallelum) | Ligado | Cache mensal no banco. Entrada manual como alternativa |
| E-mail | Resend ou Brevo | Ligado | Domínio do cliente verificado (SPF e DKIM) |
| IA | Provedor a escolher (Claude, Gemini ou OpenAI) | Ligado, com franquia | Só gera rascunho. O prompt recebe apenas campos preenchidos e proíbe afirmar laudo, perícia ou crédito sem dado. Registra consumo |
| Placa e histórico | Fornecedor pago por consulta | Desligado | Adicional, com franquia |
| WhatsApp | Link `wa.me` | Ligado | Sem API |
| Instagram | Meta Graph API | Desligado | Conta do cliente. Adicional futuro |
| WhatsApp Cloud API | Meta | Desligado | Conta do cliente. Adicional futuro |
| Portais | Arquivo CSV/XML | Exportação manual | Integração direta só com aprovação do portal |

O modelo de IA fica em configuração. O `gemini-1.5-flash` atual já foi desligado pelo fornecedor, e a falha é escondida por um texto de reserva com afirmações inventadas. Esse comportamento será removido.

## 6. Franquia e repasse

Quando a franquia do mês acaba, o sistema avisa o proprietário e continua operando, cobrando o excedente, ou bloqueia o recurso. A escolha fica no contrato.

| Etapa | Comportamento |
| --- | --- |
| Uso normal | Consome a franquia incluída na mensalidade |
| 80% da franquia | Aviso no painel e por e-mail ao proprietário |
| 100% | Excedente passa a ser registrado, ou o recurso fica bloqueado |
| Fechamento do mês | Relatório de consumo na Torre de controle para você faturar |

**Decisão aprovada (17/11/2026):** ao esgotar a franquia, o sistema **continua funcionando** e o excedente é cobrado.

Escolhi franquia mais excedente (e não valor fixo por uso) porque dá ao cliente uma mensalidade previsível e protege sua margem quando o uso explode.

## 7. Front-end

### 7.1 Site público

| Ponto | Situação atual | Direção |
| --- | --- | --- |
| Página por veículo | O anúncio abre em **modal**, sem endereço próprio | Cada veículo ganha URL própria (`/carros/marca-modelo-ano-id`), com título, descrição e dados estruturados do Google (`Vehicle`) |
| Renderização | Aplicação de página única (SPA) | Renderização no servidor ou pré-renderização, para o Google e as redes sociais lerem o estoque |
| Dados | `localStorage` | Sempre a API, pelo SDK |
| Identidade visual | Três modelos prontos | Template por cliente, com tokens (cores, fontes, logo) e seções configuráveis |

Concessionária vive de busca no Google e de link compartilhado no WhatsApp. O modelo atual, sem URL por veículo, não atende isso.

> **Atualização de 19/11/2026:** o produto passa a ser os próprios protótipos (`sites/auto-dealership`, `sites/luxury-dealership`, `sites/popular-dealership`), ligados ao servidor em modo real (`VITE_MERCHANT_DEMO=false`). Os apps Astro `sites/loja` e `sites/painel` ficam guardados, sem uso e sem novos investimentos. Onde este documento os trata como o front do produto, vale a nota acima.

**Escolha da base do site: Astro (decidido em 17/11/2026 após teste; substituída em 19/11/2026, veja a nota acima).** Mesma página de veículo, 300 requisições: Astro 88 MB de memória e 1,4 ms (mediana); Next.js 154 MB e 4,1 ms. Ambos entregam título e dados estruturados do Google.
- **Opção A (escolhida):** Astro com renderização no servidor e componentes React reaproveitados. Leve em memória, o que importa para várias instalações no mesmo VPS.
- **Opção B:** Next.js. Mais conhecido, mais pesado por instância.

Recomendo um protótipo curto de uma página de veículo nas duas opções antes de fechar.

### 7.2 Painel do lojista

Um painel único para todos os clientes, com **tema por cliente** (logo, cor principal, nome). Os módulos aparecem conforme a lista habilitada. Não há um painel diferente por cliente.

### 7.3 Demonstração de vendas

**Aprovado em 17/11/2026.** A demonstração deixa de ser uma cópia com `localStorage` e passa a ser uma **instalação real** com dados fictícios (`DEMO=true`), reiniciada todo dia. Isso elimina o código duplo (modo demo x modo API), e o cliente vê o produto de verdade. O portal continua como vitrine.

## 8. Implantação na Hostinger

| Item | Decisão |
| --- | --- |
| Produto | VPS Linux (a partir do KVM 1), em uma conta da empresa |
| Isolamento | Um contêiner Docker por instalação, com seu banco, segredos e limite de memória |
| Proxy | Caddy, com HTTPS automático por domínio |
| Capacidade | Estimativa de 5 a 8 clientes pequenos por KVM 1. **A validar em teste de carga** |
| Crescimento | Novo VPS quando o anterior passar de uns 70% de uso |
| Segredos | Arquivo `.env` por cliente, fora do repositório, com chave de cifragem **diferente por cliente** |
| Segurança do servidor | Chaves SSH, firewall, atualizações automáticas e `fail2ban`. Responsabilidade da empresa |

O VPS é uma máquina sem gerenciamento. Atualização do sistema operacional, firewall e backups são trabalho nosso e devem estar no preço da mensalidade.

### 8.1 Provisionamento de um novo cliente

Um script cria, em minutos: pasta, banco, segredos, contêineres, rota do Caddy e usuário proprietário inicial, com troca de senha obrigatória. Em produção, **o seed fictício não roda**.

### 8.2 Atualizações

- Uma versão única do sistema, com número de versão.
- A atualização roda primeiro em um cliente piloto e na demonstração, depois nos demais.
- Cada atualização faz backup antes de migrar o banco e permite voltar atrás.

### 8.3 Backup

| Item | Regra |
| --- | --- |
| Banco | Cópia consistente do SQLite todo dia, mais replicação contínua (Litestream) para armazenamento externo |
| Mídia | Cópia incremental diária |
| Retenção | A definir no contrato |
| Teste | Restauração testada periodicamente, com registro |

## 9. Torre de controle

É o painel interno da empresa para ver todas as instalações em um só lugar.

| Mostra | Exemplo |
| --- | --- |
| Saúde | Online ou fora do ar, versão instalada, último backup, espaço em disco |
| Uso comercial | Leads por dia, acessos ao site, cliques no WhatsApp, veículos publicados |
| Consumo | IA e consultas pagas contra a franquia |
| Erros | Taxa de erro e últimos incidentes |

**Regra de privacidade:** cada instalação envia à Torre apenas **números agregados**, nunca nome, telefone ou mensagem de lead. Os dados pessoais ficam na instalação de cada cliente. Se a empresa precisar ver um lead para dar suporte, usa um **acesso de suporte autorizado pelo cliente e registrado em auditoria**. Isso mantém a empresa fora do papel de quem concentra dados pessoais de todas as lojas, o que evita um risco de LGPD e simplifica o contrato.

Ferramentas sugeridas: Uptime Kuma para disponibilidade, e a Torre própria para as métricas de negócio.

## 10. Segurança: correções obrigatórias

Itens encontrados no estudo e que entram como requisito de qualquer instalação real:

1. Remover a chave de cifragem padrão. Falhar ao iniciar se `DATA_ENCRYPTION_KEY` não estiver definida.
2. Não executar seed em produção. Nenhuma conta com senha conhecida.
3. CORS com lista de origens. Cookie com `Secure`.
4. Limite de tamanho de corpo e validação de entrada em todas as rotas.
5. Rate limit em rotas públicas (leads, cadastro, recuperação) e correção da leitura de IP atrás do proxy.
6. Token de sessão salvo apenas como hash. Corrigir a comparação de data de expiração.
7. Autenticação e cargo exigidos em todas as rotas sensíveis (clientes, exportação LGPD, FIPE, custos).
8. Consentimento LGPD registrado com texto, data e versão, em vez de um valor fixo.
9. CNPJ e nome da loja lidos da configuração, não do código.
10. Atualização regular de dependências e verificação automática de vulnerabilidades.

## 11. Fora do escopo desta arquitetura

Assinatura eletrônica, pagamento on-line, aplicativo móvel, integração direta com bancos e publicação direta em portais. Podem virar adicionais depois, cada um com escopo próprio.

## 12. Ordem de implementação proposta

**Andamento (17/11/2026):** M1 e M2 concluídos no servidor, com 71 testes passando. Entregue: segurança base, migrações numeradas com backup automático, política central que nega por padrão, módulos por flag (a loja não consegue liberar módulos sozinha), configuração da loja, gestão da equipe, estoque completo com URL por veículo, upload de fotos e 360°, contas de clientes, favoritos, recuperação de senha, troca, métricas reais, franquia de consumo e comando de criação do proprietário. **Ainda não iniciados:** M0 (reorganizar em pacotes e OpenAPI), M3 (e-mail em homologação real), M4 (FIPE real e provedor de IA), M5 (site em Astro e painel) e M6 (provisionamento, backup externo, Torre de controle).

| Etapa | Entrega | Pronto quando |
| --- | --- | --- |
| M0 | Reorganizar o repositório em pacotes e criar a especificação OpenAPI | Testes atuais passando na nova estrutura |
| M1 | Segurança base (seção 10) e migrações | Todos os itens com teste |
| M2 | Novo schema, módulos por flag, configuração da loja, upload de mídia | Estoque completo cadastrado e lido pela API |
| M3 | Contas de cliente, recuperação de senha, e-mail | Fluxo completo com e-mail real em homologação |
| M4 | Integrações (FIPE, IA com franquia, consumo) | Consumo registrado e franquia aplicada |
| M5 | Template de site com URL por veículo, conectado ao SDK, e painel com tema | Um cliente piloto com dados reais |
| M6 | Provisionamento, backup, Torre de controle, demonstração real | Segundo cliente criado em menos de um dia, restauração testada |

## 13. Decisões em aberto

1. ~~Base do site~~ Decidido: Astro.
2. Confirmar SQLite por cliente com `better-sqlite3`.
3. Provedor de IA e de e-mail.
4. Onde guardar os backups externos.
5. ~~Regra de excedente~~ Decidido: o sistema continua e o excedente é cobrado.
6. Faixa de preço dos pacotes de módulos (decisão comercial, fora deste documento).

## 14. Riscos

| Risco | Mitigação |
| --- | --- |
| Muitos clientes em um VPS e uma falha derrubar vários | Limite de memória por contêiner, monitoramento, divisão por VPS |
| Cliente pedir mudança que exija alterar o back-end | Toda mudança entra no código-base como módulo com flag. Nunca um fork |
| Suporte e manutenção consumirem mais horas que o previsto | Preço da mensalidade baseado em horas, com escopo de suporte no contrato |
| Dado pessoal vazar por erro de configuração | Segredos por cliente, auditoria, testes de acesso por cargo |
| Dependência de uma única conta de hospedagem | Backup externo e script de provisionamento que recria tudo em outro provedor |
