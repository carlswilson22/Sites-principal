# Sites-principal — portal e modelos de sites para lojas de veículos

Repositório do portal de apresentação e dos modelos **AutoElite Seminovos**,
**DriveNow Multimarcas** e **Enterprise Veículos**.

A publicação atual é uma demonstração estática, com dados locais no navegador.
O servidor Node/SQLite existente no repositório não é executado pelo GitHub Pages.
A implantação de uma loja com dados reais precisa ter seu escopo definido.

- [Documentação organizada](docs/README.md)
- [Base técnica para o futuro contrato](docs/base-para-contratacao.md)
- [Funcionalidades atuais de cada modelo](docs/funcionalidades-dos-modelos.md)
- [Desenvolvimento e verificações](docs/desenvolvimento-local.md)
- [Atribuições e licenças de terceiros](NOTICE)

Para iniciar, instale as dependências com Node.js 22 e `npm install`, execute
`npm run dev` e abra `http://localhost:5173/Sites-principal/`.

## Ver a loja completa rodando (stack Astro guardada)

> Atenção: `npm run demo` ainda sobe os apps Astro (`sites/loja` e `sites/painel`), que estão guardados sem uso. A apresentação oficial são os protótipos: `npm run dev`. O `demo` será reescrito para servir os protótipos em modo real.

```
npm install
npm run demo                 # pacote Premium
npm run demo -- --tier 2     # Expert (1 = Basic)
npm run demo -- --color "#0f6cbd" --name "Minha Loja" --open
```

Sobe a API, o site público e o painel com dados fictícios e fotos de exemplo, e mostra os endereços e os logins.
Os dados ficam só na memória: ao parar (Ctrl+C) tudo some. Na primeira vez, o site e o painel são compilados sozinhos.
Comandos de teste: `npm run test:loja`, `npm run test:painel`, `npm run test:merchant` e, na pasta `server`, `node --test tests/*.mjs`.
