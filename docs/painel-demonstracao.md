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

O botão **Entrar** abre a conta de cliente. Para testar:

| E-mail | Senha |
| --- | --- |
| `cliente@demo.invalid` | `Cliente@2026` |

**Preencher acesso de teste** apenas preenche o formulário; ainda é necessário
confirmar o login. A conta de cliente não mostra o Painel do Lojista.

## Equipe da loja

No login, escolha **Equipe da loja**. A entrada exige credenciais desse tipo de
acesso; a senha de cliente não autentica um funcionário. Contas de teste:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Atendente | `atendente@demo.invalid` | `Demonstracao@2026` |
| Gerente | `gerente@demo.invalid` | `Demonstracao@2026` |
| Proprietário | `proprietario@demo.invalid` | `Demonstracao@2026` |

Após entrar, **Painel do lojista** aparece no cabeçalho. Não há entrada rápida
por perfil, senha de funcionário preenchida ou seletor de cargos no painel.
Para conferir outro cargo, saia da sessão e entre com a outra conta.

As permissões dos módulos continuam em `merchantAccess.js`; Contratos e Termos
e o simulador permanecem disponíveis ao atendente nas três edições.

## Sessão e preferências

- Sessões demonstrativas ficam em `sessionStorage`, com validade de quatro horas,
  usando `store_access_<loja>`. Uma loja não restaura a sessão de outra.
- As chaves legadas `merchant_demo_user` e `merchant_user` não iniciam uma sessão.
- Favoritos ficam separados por loja e conta. Preferências antigas da demonstração
  são preservadas no navegador, mas não atribuídas a um novo visitante.
- Comparação começa vazia e pertence ao perfil conectado na sessão atual.
- Sair remove a sessão da loja, oculta dados pessoais e retira o acesso ao painel.

## Instalação futura do cliente

Conforme o escopo acordado, esta entrega simula o fluxo de acesso: não cria contas
reais, não envia e-mails e não utiliza um servidor de autenticação. Os builds
mantêm `VITE_MERCHANT_DEMO=true`. As credenciais e regras no JavaScript servem
para apresentação e não constituem uma barreira de segurança para dados reais.

Na instalação do cliente, será necessário integrar o login de clientes a um
servidor, validar permissões e sessões no servidor e persistir preferências por
conta. Ao desativar a demonstração, o login da equipe consulta a API existente;
o login de clientes informa a integração pendente, sem criar uma sessão fictícia.

## Verificação

`npm run test:merchant` cobre identidades, validade e isolamento de sessões,
regras de visitante/cliente e rejeição de acesso do cliente a módulos internos.
Após o build, `npm run check:runtime` verifica os fluxos nos arquivos compilados,
incluindo login no anúncio, cancelamento, retorno à ferramenta, favoritos,
saída e login individual em cada perfil da equipe.
