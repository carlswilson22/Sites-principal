# Integrações e configuração de ambiente

Atualizado em **17/11/2026**, referência `3f3961d`. Guia técnico de preparação;
a ativação operacional dos serviços depende do escopo do cliente.

## Publicação atual e servidor

O GitHub Pages publica HTML/CSS/JavaScript do portal e dos três modelos.
Não executa `server/src/index.js` nem hospeda o SQLite. A demonstração usa
`VITE_MERCHANT_DEMO=true`, contas e persistência local no navegador.

O servidor Node 22 existe separadamente. Estoque, CRM e outras partes do
frontend ainda usam repositórios locais; desligar a demonstração não conecta
todos esses fluxos ao banco. A API de equipe existe, mas cadastro de cliente
e recuperação de senha por e-mail precisam de implementação operacional.
A rota de recuperação atual retorna mensagem, sem serviço de envio de e-mail.

Em `apiClient.js`, a base atual é `http://localhost:3001/api` no localhost e
`/api` nos demais hosts. Não há suporte documentado a uma variável
`VITE_API_URL`; uma implantação deve ajustar código/proxy e testar cookies,
origem e HTTPS. Não reutilizar as contas geradas pelo seed em produção.

## Variáveis efetivamente lidas

| Variável | Leitor e finalidade | Observação |
| --- | --- | --- |
| `VITE_MERCHANT_DEMO` | Frontend: seleciona demonstração explicitamente | Incorporada ao build; não protege dados reais |
| `PORT` | Servidor: porta, padrão 3001 | Definir no ambiente do processo |
| `MERCHANT_TIER` | Servidor: nível 1/2/3 | AutoElite/DriveNow/Enterprise; homologar autorizações |
| `DATA_DIR` | SQLite: diretório dos dados | Padrão `server/data`; precisa de persistência e acesso restrito |
| `DATABASE_PATH` | SQLite: arquivo alternativo | Se definido, substitui o caminho padrão do banco |
| `DATA_ENCRYPTION_KEY` | Servidor: chave AES-256-GCM | 32 bytes em hexadecimal; gerar por instalação e guardar fora do código |
| `GEMINI_API_KEY` | Adaptador de descrições | Somente no servidor; integração não ativada no Pages |
| `INSTAGRAM_ACCESS_TOKEN` | Adaptador Instagram | Somente no servidor; manter privado |
| `INSTAGRAM_ACCOUNT_ID` | Adaptador Instagram | Identificador da conta a homologar |
| `GITHUB_REPOSITORY` | Build: nome do repositório para base das URLs | Fornecido pelo GitHub Actions na publicação |

`CRYPTO_SECRET_KEY`, `DEMO_MODE` e chaves `VAPID_*` não são lidas pelos módulos
atuais. Não apresentá-las como configuração funcional. Não há carregador
automático de `.env` no ponto de entrada do servidor. Para desenvolvimento,
um arquivo **local não versionado** pode ser carregado explicitamente:

```powershell
node --env-file=server/.env server/src/index.js
```

Esse comando executa o seed de dados de exemplo se aplicável. Use apenas em
ambiente de desenvolvimento preparado para esses dados. Para a instalação real,
definir inicialização sem contas fictícias e carregar variáveis pelo serviço de
hospedagem. Nunca colocar segredos em variáveis `VITE_*`, commits ou anexos do contrato.

## Situação dos serviços externos

| Serviço | Implementação atual | Preparação para operação real |
| --- | --- | --- |
| Instagram | PNG, conta/publicação/histórico fictícios locais; adaptador HTTP separado | Conta autorizada, permissões vigentes, mídia acessível, atualização do adaptador e teste real |
| IA de descrição | Adaptador opcional; texto programado sem chave ou em falha | Revisão do modelo/endpoint, segurança dos dados enviados, custos e validação humana do texto |
| FIPE | Interface de referência manual; adaptador de valores fixos com cache em memória | Fonte autorizada/atualizada, competência dos valores e tratamento de indisponibilidade |
| Bancos | Três nomes/taxas ilustrativos no anúncio; cálculo local Price | Contratação/autorizações, condições reais e API caso incluída no escopo |
| WhatsApp | Abertura de mensagem preparada pelo visitante | Número real da loja; não equivale à API de mensagens ou chat humano interno |
| Portais | Arquivo CSV local; servidor possui exportação CSV/JSON | Formato aceito pelo destino, credenciais/condições e desenvolvimento para envio direto |
| Web Push | Não há fluxo completo de inscrição, entrega e Service Worker nesta implementação | Implementar e homologar se selecionado; não basta informar chaves VAPID |
| E-mail | Sem envio operacional de recuperação ou formulário | Provedor, templates, URLs, entrega e fluxo de recuperação a implementar |

### Instagram

No modo demonstrativo, publicar grava arte, legenda e horário no navegador;
**Ver publicação** abre o registro salvo. Nenhuma conta externa recebe conteúdo.
No adaptador real, a ausência de token/conta retorna `nao_configurado`;
presença de variáveis não comprova autorização ou publicação bem-sucedida.

O código atual referencia Graph API `v19.0`. Isso é uma descrição do código,
**não uma recomendação de versão vigente**. Antes de ativar, revisar a versão,
fluxo, permissões e exigências atuais do fornecedor, hospedagem da arte e
tratamento de falhas. A simulação local e suas imagens não comprovam essa etapa.

### IA e FIPE

O adaptador de IA referencia `gemini-1.5-flash`; validar compatibilidade e
substituir/atualizar conforme o serviço escolhido antes da integração.
Seu texto automático pode afirmar perícia/documentação sem verificação:
revisar a geração para que se limite aos fatos comprovados da loja.
O assistente do anúncio e o consultor Enterprise são programados localmente.

O cache do adaptador FIPE não implementa expiração de 24 horas, apesar de
comentário antigo no código. Não há chamada externa nesse adaptador;
valores de exemplo não constituem consulta oficial ou referência atualizada.

### Exportação de catálogo

A exportação CSV da demonstração gera um arquivo a partir do estoque local.
Na API existem `GET /api/tier3/portals/export?format=csv` e `format=json`.
Esses formatos não são universais nem comprovam importação por OLX, Webmotors
ou qualquer outro portal. Não há publicação automática nesses serviços.

## Checklist de implantação a contratar

1. Definir modelo, módulos, unidades, usuários e serviços externos escolhidos.
2. Integrar persistência central, clientes/equipe, mídia e recuperação de acesso.
3. Revisar autenticação, autorização de cada operação, CORS, tamanho dos payloads,
   validação de entradas, HTTPS, cookies e gestão de segredos.
4. Configurar banco durável, backup/restauração, monitoramento e responsabilidades.
5. Substituir dados fictícios, contas de teste, taxas e conteúdos ilustrativos.
6. Homologar integrações reais, custos, limites, erros e revogação de acesso.
7. Registrar versão entregue e resultados de homologação com o cliente.

Nenhuma dessas etapas é considerada contratada automaticamente. Veja a
[base para contratação](base-para-contratacao.md) e as
[medidas e limites de segurança](politica-de-seguranca-lgpd.md).
