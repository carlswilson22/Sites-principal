# Desenvolvimento local e verificações

Atualizado em **17/11/2026**. Ambiente de referência: Node.js 22, como na
publicação automatizada do repositório. Executar comandos a partir da raiz.

## Instalar e iniciar

```powershell
npm install
npm run dev
```

Abrir `http://localhost:5173/Sites-principal/` e usar os cartões. O comando
inicia o portal e os três modelos com atualização automática. Para outro
aparelho na mesma rede, usar o endereço **Network** exibido no terminal;
as aplicações compartilham endereço/porta pública, com servidores internos
restritos ao computador.

Encerrar uma execução antiga com `Ctrl+C`. A porta é fixa: se ocupada, o
comando informa erro. Alternativa: `npm run dev -- --port 5183`. `Ctrl+C`
encerra as quatro aplicações iniciadas pelo comando.

## Conferir desenvolvimento e publicação

Com o desenvolvimento aberto:

```powershell
npm run check:dev
```

Confere portal, modelos, uma imagem por modelo e conexões de atualização.
Para outra porta: `npm run check:dev -- http://localhost:5183/Sites-principal/`.

Para validação do código e da versão compilada:

```powershell
npm run test:merchant
npm run test:server
npm run check:ui
npm run build
npm run check:runtime
npm run preview
```

A prévia abre em `http://127.0.0.1:4173/Sites-principal/`. `check:runtime`
usa os arquivos compilados; por isso precisa de build anterior. O GitHub Actions
executa testes de núcleo/API, UI, build e runtime antes de publicar `dist`.

Os testes verificam cenários específicos. Não comprovam integrações externas,
segurança integral, aparência em pixels ou desempenho em todo dispositivo.
A conferência visual é manual. Uma revisão apenas documental pode validar
links, correspondência com o código e integridade das atribuições, sem refazer
o build como evidência de alterações que não atingem a aplicação.

## Demonstração e operação real

A publicação é estática e usa `VITE_MERCHANT_DEMO=true`. O servidor Node/SQLite
não inicia com `npm run dev`, build ou preview. Contas e registros locais
não sincronizam entre dispositivos; limpar o navegador pode apagá-los.

[Acessos de teste](painel-demonstracao.md) não são credenciais de produção.
Não incluir segredos no frontend, repositório ou documentação comercial.
A configuração do servidor e suas pendências estão em
[integrações](manuais-de-integracao.md). Modelo 2 corresponde à pasta
`sites/luxury-dealership`; modelo 3, à pasta `sites/popular-dealership`.
Esses nomes internos legados não representam a marca comercial da loja.
