# Segurança e privacidade — medidas existentes e limites

Atualizado em **17/11/2026**, referência `3f3961d`.
Este documento descreve a implementação examinada e pontos para preparar a
instalação do cliente. **Não é certificação de conformidade LGPD, auditoria
independente de segurança ou política de privacidade final da loja.**

## Demonstração publicada

GitHub Pages serve arquivos estáticos. Contas de teste e permissões estão no
JavaScript; os dados de estoque, contatos, CRM, documentos e amostras ficam no
navegador. Não usar a demonstração para dados pessoais ou operações reais.

- Cadastro público cria cliente; painel é reservado aos perfis de equipe na
  interface. Isso não constitui uma barreira de autorização em servidor.
- Senhas cadastradas localmente são derivadas com scrypt e salt; nome, e-mail,
  documentos e outros registros locais não recebem criptografia integral.
- Sessões demonstrativas duram quatro horas em `sessionStorage`; registros
  persistentes usam `localStorage`. Limpar o navegador pode apagá-los.
- Separação por chave de loja/conta organiza os dados locais, mas não substitui
  isolamento de infraestrutura ou controle de acesso de produção.
- O seletor de cargo aparece somente para funcionário autenticado no modo demo;
  precisa permanecer indisponível em uma instalação operacional.

## Mecanismos presentes no servidor separado

O servidor não está hospedado no GitHub Pages. As medidas abaixo descrevem seu
código e não devem ser atribuídas à publicação estática.

| Mecanismo | Implementação examinada | Limite |
| --- | --- | --- |
| Senhas | scrypt com salt aleatório e comparação usando `timingSafeEqual` | Não garante ausência de vulnerabilidades em todo o fluxo |
| Sessões | Tokens de 32 bytes aleatórios, registros no SQLite e prazo de 24 horas | Revisar implantação, revogação e proteção do token; a API também retorna token no JSON |
| Cookie | `HttpOnly`, `SameSite=Strict`, `Max-Age=86400` | O código atual não adiciona `Secure`; ajustar para HTTPS de produção |
| Tentativas de login | Limite em memória por combinação IP/e-mail, janela de 15 minutos | Não é proteção distribuída nem controle de todo o tráfego |
| Permissões | Autenticação e verificações de nível/cargo em rotas específicas | Homologar cada endpoint e ação; menu oculto não basta |
| Cifragem | AES-256-GCM para campos específicos de CPF/endereço de clientes e CPF/dados bancários de consignantes | Não cifra todo o banco, todo dado pessoal ou os registros locais do frontend |
| Mascaramento | Helpers e respostas de algumas rotas mascaram CPF/dados bancários | Exportações e outras rotas podem decifrar; revisar finalidade/permissão por operação |
| Sanitização | Utilitário `sanitizeLogData` filtra certas chaves quando chamado | Não é aplicado universalmente; não garante ausência de dados pessoais em logs |
| Auditoria | Registros em tabelas e trilhas locais de amostra | Não há armazenamento imutável ou prova criptográfica de integridade da trilha |

`DATA_ENCRYPTION_KEY` é a variável efetivamente usada para cifragem. O código
possui uma chave padrão de desenvolvimento; ela precisa ser substituída por
segredo exclusivo antes de dados reais. Definir armazenamento, recuperação e
rotação da chave, considerando a leitura dos dados já cifrados. Não copiar a
chave padrão para contrato, documentação comercial ou ambiente de produção.

O seed gera exemplos e contas; a inicialização de produção precisa ser ajustada.
CORS atualmente reflete a origem da requisição e o leitor de JSON não impõe
limite explícito de tamanho. Esses pontos exigem revisão antes da operação real,
conforme o [guia de implantação](manuais-de-integracao.md).

## Exportação e anonimização

No Enterprise demonstrativo, essas ações operam sobre **clientes de exemplo**
e geram arquivo/trilha local. Não abrangem automaticamente cadastro público,
CRM, contatos, documentos, publicações ou cópias já exportadas.

No servidor há rotas de exportação e alteração de campos do cliente. Auditoria
e anonimização verificam o cargo de proprietário; a exportação de titular
verifica sessão, mas não impõe essa mesma restrição de cargo. Essa diferença
precisa ser corrigida/homologada na implantação antes de tratar dados reais.
A existência das rotas não comprova cobertura de todas as informações
relacionadas ao titular ou irreversibilidade da anonimização. Documentos,
contatos, integrações e backups precisam ser inventariados e tratados conforme
a finalidade e as obrigações aplicáveis.

Não prometer apagamento total automático, atendimento integral de todos os
direitos por um botão ou um prazo legal de retenção único para todos os dados.

## Definições para a futura operação

As decisões sobre finalidade, necessidade, base legal, agentes de tratamento,
direitos do titular e medidas de segurança devem considerar a operação real.
A LGPD prevê esses princípios e responsabilidades; papéis de controlador e
operador dependem das atividades exercidas. Referências oficiais:
[LGPD — texto atualizado](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html)
e [guia da ANPD sobre agentes de tratamento](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-para-definicoes-dos-agentes-de-tratamento-de-dados-pessoais-e-do-encarregado).

Para a preparação contratual, registrar como **A definir**:

- Responsabilidades da loja, desenvolvedor, hospedagem e fornecedores.
- Inventário de dados, finalidades, bases de tratamento e avisos de privacidade.
- Canal de titulares, identificação do solicitante e procedimento de atendimento.
- Perfis, concessão/revogação de acesso e revisão periódica de permissões.
- Prazos de retenção por categoria, critérios de eliminação e exceções aplicáveis.
- Tratamento de dados enviados ao WhatsApp, serviços de IA e demais terceiros.
- Processo de incidente, responsáveis, registros e comunicações aplicáveis.
- Monitoramento, atualizações e verificações de segurança na implantação.

O campo `consent_lgpd` gravado pela API não prova, por si só, uma coleta válida
de consentimento. Definir o fluxo de transparência e a base adequada a cada
finalidade; não confundir um valor no banco com conformidade da operação.

## Backup, disponibilidade e retenção

Não há rotina automatizada de backup, restauração testada, disponibilidade
contratada ou expurgo periódico comprovados nesta implementação. O arquivo
SQLite depende de armazenamento persistente e proteção da infraestrutura.

Frequência, retenção, responsáveis, cópias fora do ambiente principal e teste de
restauração serão definidos. Separar bancos por loja pode ser uma opção de
implantação, mas não existe isolamento absoluto garantido apenas pelo uso de SQLite.
Não atribuir prazos de seis meses ou cinco anos indistintamente à auditoria,
contratos e cadastros sem análise do dado e da obrigação aplicável.

## Minutas e documentação da loja

Contratos, recibos e termos gerados no painel são minutas referenciais, sem
assinatura eletrônica integrada. Conteúdo, condições comerciais, garantias e
uso pretendido precisam de revisão adequada ao negócio antes da assinatura.
O desenvolvimento de modelos jurídicos personalizados e o apoio especializado
serão delimitados na contratação; não estão presumidos por este documento.

A [base para contratação](base-para-contratacao.md) organiza essas definições.
Referências oficiais consultadas em 17/11/2026; esta revisão não implementou
alterações no sistema nem resolveu tecnicamente os pontos aqui registrados.
