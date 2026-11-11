# Três propostas de site

As edições mantêm seus recursos e o mesmo estoque por loja, mas têm estruturas
próprias de navegação e apresentação:

- **AutoElite — vitrine direta:** navegação compacta, abertura dividida entre
  busca e vídeo, e seis veículos em uma grade de três colunas no computador.
- **DriveNow — showroom editorial:** marca centralizada, abertura cinematográfica
  e coleção em sequência. Fotos amplas e fichas horizontais dão espaço a cada
  veículo. O estoque também usa essa apresentação.
- **Enterprise — vitrine panorâmica:** vídeo largo na abertura, seguido por uma
  base com título, acesso à vitrine, comparação e favoritos. Os filtros ficam em
  uma faixa horizontal e os veículos aparecem em duas colunas mais amplas. A
  página de estoque mantém os filtros laterais. Os dois contextos usam a mesma
  lógica de busca; a inicial limita a apresentação a seis resultados.

No celular, os conteúdos se empilham, os filtros ficam antes dos resultados e
os menus podem ser percorridos horizontalmente. A visualização 360° continua
incluída somente no modelo 3. Atendimento e financiamento permanecem no anúncio.

A animação tem mais espaço nas três aberturas. No AutoElite, ocupa a maior
coluna no computador e aparece primeiro no celular. No Enterprise, ocupa uma
faixa panorâmica própria e o título fica abaixo, deixando a animação livre.
Legendas menores e uma camada de escurecimento mais leve preservam os detalhes
do vídeo. No DriveNow, o título e o texto ocupam menos área da abertura cinematográfica.
A animação continua acompanhando a rolagem, respeita a preferência por movimento
reduzido e suspende as atualizações quando um anúncio está aberto.

As miniaturas e a descrição no portal acompanham essas composições. Na inicial
do Enterprise, comparação e favoritos aparecem somente na base do vídeo; no
estoque, permanecem na lateral dos filtros, sem repetir os mesmos atalhos na tela.

O painel do lojista é carregado sob demanda nos três modelos, com indicação de
carregamento. Seus módulos não precisam ser baixados para abrir a vitrine.

As três vitrines começam como visitante. **Entrar** oferece acesso de cliente
e acesso separado da equipe. Ferramentas pessoais solicitam login no contexto
atual e o Painel do Lojista aparece apenas para perfis da equipe. Os acessos
fictícios estão descritos em [Acessos de demonstração](painel-demonstracao.md).

## Sobre Nós e Contato

- **DriveNow:** composição editorial com foto panorâmica, narrativa em capítulos,
  valores em lista e canais de contato em uma faixa aberta. O formulário tem
  os dados pessoais em uma coluna e a mensagem em outra, como uma carta à loja.
- **Enterprise:** navegação pelas seções da página, história e fotografia lado
  a lado, etapas de compra e uma central de contato. Canais, horários e endereço
  ficam em painéis expansíveis ao lado do formulário, que começa pelo assunto.

As páginas mantêm os dados de contato em um único lugar e o rodapé compacto.
O encaminhamento ao WhatsApp exige o envio explícito do formulário. A interface
informa que a mensagem foi preparada; o cliente continua no WhatsApp para enviá-la.
Os formulários validam nome, telefone e mensagem e registram o contato na própria
loja quando há armazenamento disponível. A foto permanece identificada como
ilustrativa, com crédito. O modelo 1 mantém sua composição atual.

## Inicialização e GitHub Pages

Os arquivos publicados do primeiro modelo responderam com sucesso durante a
investigação. O teste dos módulos compilados anteriores também inicializou a
loja e abriu um anúncio; a falha relatada não foi reproduzida nesse cenário.
Foi identificado que o HTML do AutoElite deixava uma página branca enquanto
aguardava o JavaScript. Agora há fundo consistente, indicação imediata de
carregamento e acesso ao portal. A divisão manual de React/ícones em um arquivo
adicional foi removida; o Vite gerencia as dependências de inicialização.

Os três modelos possuem recuperação visível para erros de renderização, sem
apagar dados locais. O vídeo também aceita a API antiga de MediaQueryList e
mantém a imagem estática quando matchMedia não está disponível.

`npm run check:runtime`, após o build, executa os módulos ES de produção em DOM
simulado, verifica a inicialização e exerce anúncios e navegação. Essa checagem
também integra a publicação no GitHub Actions. Ela complementa os testes de
dados e renderização; não mede fluidez nem substitui a inspeção visual manual.
