# Acessos de demonstração

Os três modelos começam como **visitante**, sem uma conta conectada e sem
favoritos ou veículos pré-selecionados para comparação. Navegação, catálogo,
anúncios, informações da loja, atendimento e WhatsApp ficam públicos.

## Cliente

Ao usar uma ferramenta pessoal, o site abre o login e mantém a página atual.
Cancelar preserva a navegação; entrar retoma a ação solicitada.

- Nos três modelos: simulação de financiamento dentro do anúncio.
- Nos modelos 2 e 3: página de financiamento e avaliação do usado na troca.
- No modelo 3: favoritos, comparação e interesse em condição de preço.

O botão **Entrar** abre um único formulário para clientes e funcionários. O
perfil é identificado pelas credenciais autenticadas, sem selecionar um tipo
de acesso ou cargo. Para testar uma conta de cliente, digite:

| E-mail | Senha |
| --- | --- |
| `cliente@demo.invalid` | `Cliente@2026` |

Não há preenchimento automático nem botões para experimentar uma conta
fictícia. A conta de cliente não mostra o Painel do Lojista.

O formulário segue a identidade de cada site: azul e cantos arredondados no
AutoElite, tons âmbar e acabamento editorial no DriveNow, ciano e linhas de
interface no Enterprise. Os campos têm ícones, rótulos visíveis e controle
para mostrar ou ocultar a senha. O login mantém o anúncio aberto ao fundo.

As abas **Fazer login** e **Criar conta** organizam o formulário.
O cadastro está habilitado nos três modelos, com nome, e-mail, senha de 8 a 128
caracteres e confirmação. Após salvar, inicia uma sessão de cliente e retoma
a ferramenta solicitada. E-mails duplicados e os acessos reservados à equipe
são rejeitados. Não é possível escolher um cargo no cadastro.

As contas de demonstração são locais a este navegador e a esta loja. A senha
é armazenada como hash scrypt com salt individual; o cálculo é carregado sob
demanda e também funciona no acesso HTTP pela rede local. Nome e e-mail ficam
no cadastro local, enquanto senha e confirmação não são guardadas em texto
aberto. Sair permite entrar novamente usando a conta cadastrada; limpar os
dados do navegador remove essas contas.

**Esqueceu a senha?** orienta entrar em
contato com a loja ou, para funcionários, com o administrador. As telas não
exibem credenciais de teste nem enviam ou prometem um e-mail. Autenticação em
servidor, sincronização entre dispositivos e recuperação por e-mail ficam para
a instalação do cliente.

No Enterprise, o coração ao lado da conta aparece também para visitantes,
solicitando login ou cadastro antes de abrir a lista. Após entrar, mostra a
quantidade de favoritos e mantém as escolhas da conta. **Comparar escolhas**
é público: visitantes podem selecionar até três veículos e comparar sem login.
**Comparar escolhas** e **Meus favoritos** ficam na página de estoque; os atalhos foram retirados da
abertura e de Serviços. Os outros modelos não exibem o coração, pois não
possuem favoritos.

## Equipe da loja

No mesmo formulário **Entrar**, digite o e-mail e a senha de funcionário.
O perfil autenticado libera apenas os módulos permitidos; a senha de cliente
não autentica um funcionário. Contas de teste:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Atendente | `atendente@demo.invalid` | `Demonstracao@2026` |
| Gerente | `gerente@demo.invalid` | `Demonstracao@2026` |
| Proprietário | `proprietario@demo.invalid` | `Demonstracao@2026` |

Após entrar, **Painel do lojista** aparece no cabeçalho. Não há entrada rápida
por perfil, senha de funcionário preenchida ou seletor de cargos no painel.
Para conferir outro cargo, saia da sessão e entre com a outra conta.
Não há botão de acesso separado para a equipe. O cadastro público não atribui
cargos de funcionários, e a recuperação desse acesso orienta procurar o
administrador da loja.

As permissões dos módulos continuam em `merchantAccess.js`; Contratos e Termos
e o simulador permanecem disponíveis ao atendente nas três edições.

## Sessão e preferências

- Sessões demonstrativas ficam em `sessionStorage`, com validade de quatro horas,
  usando `store_access_<loja>`. Uma loja não restaura a sessão de outra.
- Contas cadastradas ficam em `localStorage`, em `demo_customer_accounts_<loja>`.
  A restauração da sessão confere a identidade no cadastro local e não atribui
  permissões de funcionário a uma conta de cliente.
- As chaves legadas `merchant_demo_user` e `merchant_user` não iniciam uma sessão.
- Favoritos ficam separados por loja e conta. Preferências antigas da demonstração
  são preservadas no navegador, mas não atribuídas a um novo visitante.
- Comparação começa vazia e pertence ao perfil conectado na sessão atual.
- Sair remove a sessão da loja, oculta dados pessoais e retira o acesso ao painel.

## Instalação futura do cliente

Conforme o escopo acordado, esta entrega simula o fluxo de acesso: o cadastro é
local, não envia e-mails e não utiliza um servidor de autenticação. Os builds
mantêm `VITE_MERCHANT_DEMO=true`. As credenciais e regras no JavaScript servem
para apresentação e não constituem uma barreira de segurança para dados reais.

Na instalação do cliente, será necessário integrar o login de clientes a um
servidor, validar permissões e sessões no servidor e persistir preferências por
conta. Ao desativar a demonstração, o login da equipe consulta a API existente;
o mesmo endpoint deverá ser ampliado para clientes. O formulário aceita apenas
perfis de cliente ou equipe reconhecidos na resposta da API, sem criar uma
sessão fictícia quando a API falha.

## Amostras das ferramentas Enterprise

- Estúdio de Stories usa os veículos e as fotos do estoque da loja. Os três
  layouts alteram a prévia e o arquivo PNG de 1080 × 1920; há opções de preço,
  foto de abertura e enquadramento. O compartilhamento usa o arquivo gerado.
- Publicar Story grava uma publicação na conta de exemplo local, com arte,
  legenda, horário e histórico. Ver publicação abre a versão salva em uma janela
  com a arte e a legenda, inclusive ao reabrir a mesma publicação. Nenhuma
  conta externa recebe o conteúdo neste modo.
- Consignações registram os dados e recalculam comissão, diárias, repasse e
  vencimento. Contratos avançados usam o veículo selecionado, geram minutas
  completas, mantêm numeração e permitem vincular aditivos a minutas emitidas.
- O precificador usa os concorrentes, a liquidez, os custos e a margem informados.
  As regras de cálculo e o gerador de minutas são compartilhados com o servidor.
- A exportação do catálogo gera um CSV com os veículos do estoque, sem depender
  de um endpoint no GitHub Pages. O relatório bancário também gera um arquivo.
- Exportação e anonimização operam sobre clientes de exemplo, com arquivo JSON
  e trilha de auditoria. Esses registros não alteram o cadastro de clientes.
- As amostras ficam em `store_tool_samples_<loja>` no navegador. Falhas de
  armazenamento são informadas e dados inválidos são preservados. Fora do modo
  de demonstração, estas ações consultam a API e não geram sucesso fictício se
  o servidor falhar.

### Verificação dos fluxos

`npm run test:merchant` cobre identidades, validade e isolamento de sessões,
regras de visitante/cliente e rejeição de acesso do cliente a módulos internos.
Após o build, `npm run check:runtime` verifica os fluxos nos arquivos compilados,
incluindo cadastro e login no anúncio, confirmação de senha, e-mail duplicado,
credenciais incorretas, cancelamento, retorno à ferramenta, favoritos no
cabeçalho, saída e login individual em cada perfil da equipe.
