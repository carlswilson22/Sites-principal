# Desenvolvimento local

Na raiz do projeto, execute `npm run dev`. O comando inicia o portal e os três modelos com atualização automática do código.

Abra `http://localhost:5173/Sites-principal/` e use os cartões para acessar cada modelo. Para testar em outro dispositivo na mesma rede, use o endereço **Network** mostrado no terminal. Todos os modelos usam o mesmo endereço e a mesma porta pública; os servidores internos ficam restritos ao computador.

Se o servidor antigo estiver aberto, encerre-o com `Ctrl+C` antes de executar novamente `npm run dev`. A porta pública é fixa: se estiver ocupada, o comando informa o erro. Para escolher outra, execute `npm run dev -- --port 5183`.

Com o servidor aberto, `npm run check:dev` verifica o portal, as páginas dos modelos, uma foto de cada modelo e as conexões de atualização automática. Para outra porta ou endereço, use `npm run check:dev -- http://localhost:5183/Sites-principal/`.

`Ctrl+C` no terminal do desenvolvimento encerra as quatro aplicações.

Para conferir a versão de publicação, execute `npm run build` e depois `npm run preview`. A prévia usa `http://127.0.0.1:4173/Sites-principal/`.
