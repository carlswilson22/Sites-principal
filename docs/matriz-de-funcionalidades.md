# Matriz de Funcionalidades do Painel do Lojista

Esta matriz estabelece a distribuição rigorosa e cumulativa dos recursos do Painel do Lojista entre os 3 modelos de concessionária da plataforma.

---

## 1. Tabela Comparativa Geral por Nível

| Código | Funcionalidade | Modelo 1 (AutoElite)<br>`Tier 1: Básico` | Modelo 2 (DriveNow)<br>`Tier 2: Pro` | Modelo 3 (Apex Luxury)<br>`Tier 3: Enterprise` | Perfil Mínimo (RBAC) | Resposta no Backend se Nível Inferior |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **E1** | Acesso: Login, Logout, Recuperação e Sessão | ✅ | ✅ | ✅ | Atendente | `200 OK` |
| **E2** | Início: 4 Indicadores e Lista de Pendências | ✅ | ✅ | ✅ | Atendente | `200 OK` |
| **E3** | Estoque: CRUD de Veículos, Busca, Filtros e Dias em Pátio | ✅ | ✅ | ✅ | Atendente | `200 OK` |
| **E4** | Fotos: Até 20 Fotos por Carro, Capa e Reordenação | ✅ | ✅ | ✅ | Atendente | `200 OK` |
| **E5** | Ficha do Anúncio: Descrição Editável, Destaques e Itens de Série | ✅ | ✅ | ✅ | Atendente | `200 OK` |
| **E6** | Contatos: Captura de Formulário e WhatsApp com Situação | ✅ | ✅ | ✅ | Atendente | `200 OK` |
| **I1** | Descrição por IA a partir de Dados Estruturados & Ficha de Custos | ❌ *(Bloqueado)* | ✅ | ✅ | Atendente | `404 Not Found` |
| **I2** | CRM Avançado: Clientes com LGPD Criptografada & Linha do Tempo | ❌ *(Bloqueado)* | ✅ | ✅ | Atendente | `404 Not Found` |
| **I3** | Avisos no Celular: Notificações Web Push (PWA) | ❌ *(Bloqueado)* | ✅ | ✅ | Atendente | `404 Not Found` |
| **I4** | Simulador de Financiamento: Tabela Price com Juros Compostos | ❌ *(Bloqueado)* | ✅ | ✅ | Gerente | `404 Not Found` |
| **I5** | Métricas do Site: Visualizações, Cliques no WhatsApp e Ranking 7/30/90d | ❌ *(Bloqueado)* | ✅ | ✅ | Gerente | `404 Not Found` |
| **I6** | Precificador Simples FIPE com Cache e Cálculo de Margem Compra/Venda | ❌ *(Bloqueado)* | ✅ | ✅ | Atendente | `404 Not Found` |
| **I7** | Contratos Básicos: Compra/Venda, Recibo de Sinal e Vistoria Simples | ❌ *(Bloqueado)* | ✅ | ✅ | Gerente | `404 Not Found` |
| **I8** | Financeiro Básico: Lançamento de Gastos por Carro e Lucro Realizado | ❌ *(Bloqueado)* | ✅ | ✅ | **Proprietário** | `403 Forbidden` / `404 Not Found` |
| **A1** | Consignação Completa: Diárias de Guarda, Repasse Líquido e Alertas | ❌ *(Bloqueado)* | ❌ *(Bloqueado)* | ✅ | Gerente | `404 Not Found` |
| **A2** | Contratos Avançados: Consignação, Troca, Termo Aditivo e Testemunhas | ❌ *(Bloqueado)* | ❌ *(Bloqueado)* | ✅ | Gerente | `404 Not Found` |
| **A3** | Financeiro Completo: DRE Próprio vs. Consignado, Comissões e Banco 12M | ❌ *(Bloqueado)* | ❌ *(Bloqueado)* | ✅ | **Proprietário** | `403 Forbidden` / `404 Not Found` |
| **A4** | Precificador Completo: Concorrência Manual, Leilão e Liquidez Regional | ❌ *(Bloqueado)* | ❌ *(Bloqueado)* | ✅ | Atendente | `404 Not Found` |
| **A5** | Funil de Vendas: Taxa de Conversão em Escada e Alerta de Carros > 60d | ❌ *(Bloqueado)* | ❌ *(Bloqueado)* | ✅ | Gerente | `404 Not Found` |
| **A6** | Gerador de Artes para Story: Proporção 9:16 (1080x1920) e Opções de Preço | ❌ *(Bloqueado)* | ❌ *(Bloqueado)* | ✅ | Atendente | `404 Not Found` |
| **A7** | Publicação no Instagram: Meta Graph API (com fallback de transparência) | ❌ *(Bloqueado)* | ❌ *(Bloqueado)* | ✅ | Gerente | `404 Not Found` |
| **A8** | Governança & LGPD: Auditoria Imutável, Dossiê do Titular e Esquecimento | ❌ *(Bloqueado)* | ❌ *(Bloqueado)* | ✅ | **Proprietário** | `403 Forbidden` / `404 Not Found` |

---

## 2. Matriz de Perfis de Acesso (RBAC)

O sistema implementa o princípio do menor privilégio:

| Funcionalidade / Área | Atendente | Gerente | Proprietário |
| :--- | :---: | :---: | :---: |
| Visualizar Estoque e Detalhes | ✅ | ✅ | ✅ |
| Cadastrar / Editar Veículo | ✅ | ✅ | ✅ |
| Excluir Veículo do Estoque | ❌ | ✅ | ✅ |
| Atender Leads Atribuídos | ✅ | ✅ | ✅ |
| Visualizar Todos os Leads da Loja | ❌ | ✅ | ✅ |
| Gerar Descrições com IA | ✅ | ✅ | ✅ |
| Consultar Tabela FIPE e Precificador | ✅ | ✅ | ✅ |
| Emitir Contratos e Termos de Vistoria | ❌ | ✅ | ✅ |
| Gestão de Consignações | ❌ | ✅ | ✅ |
| Visualizar Gastos e Custos por Carro | ❌ | ❌ | ✅ |
| Visualizar Lucro Líquido e DRE da Loja | ❌ | ❌ | ✅ |
| Visualizar e Gerenciar Comissões da Equipe | ❌ | ❌ | ✅ |
| Visualizar Trilha de Auditoria | ❌ | ❌ | ✅ |
| Anonimizar Dados de Titulares (LGPD) | ❌ | ❌ | ✅ |
| Gerar Criativos de Stories 1080p | ✅ | ✅ | ✅ |
| Publicar Stories na Conta da Loja | ❌ | ✅ | ✅ |

---

## 3. Garantia de Bloqueio no Backend (`tierGate`)

O controle de recursos superiores **não é apenas cosmético**:
1. Se uma requisição HTTP for enviada a `/api/tier2/*` em uma instalação configurada como `MERCHANT_TIER=1`, o servidor intercepta a requisição via middleware `tierGate(2)` e retorna **status 404 (Not Found)**.
2. Se uma requisição for enviada a `/api/tier3/*` em instalações configuradas como `MERCHANT_TIER=1` ou `MERCHANT_TIER=2`, o middleware `tierGate(3)` retorna **status 404 (Not Found)**.
3. Se um usuário autenticado com perfil `atendente` tentar acessar endpoints de DRE financeiro ou auditoria restrita, o middleware `requireRole` retorna **status 403 (Forbidden)**.

