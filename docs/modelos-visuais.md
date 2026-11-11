# Três propostas de site

As edições mantêm seus recursos e o mesmo estoque por loja, mas têm estruturas
próprias de navegação e apresentação:

- **AutoElite — vitrine direta:** navegação compacta, abertura dividida entre
  busca e vídeo, e seis veículos em uma grade de três colunas no computador.
- **DriveNow — showroom editorial:** marca centralizada, abertura cinematográfica
  e coleção em sequência. Fotos amplas e fichas horizontais dão espaço a cada
  veículo. O estoque também usa essa apresentação.
- **Enterprise — exploração interativa:** abertura compacta, filtros laterais,
  resultados em duas colunas e acesso a comparação e favoritos junto da busca.
  O estoque e a vitrine compartilham os mesmos filtros; a inicial limita a
  apresentação a seis resultados.

No celular, os conteúdos se empilham, os filtros ficam antes dos resultados e
os menus podem ser percorridos horizontalmente. A visualização 360° continua
incluída somente no modelo 3. Atendimento e financiamento permanecem no anúncio.

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
