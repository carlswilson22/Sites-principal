# Painel demonstrativo — lote 0

O projeto apresenta três modelos cumulativos para escolha comercial. O painel compartilha componentes React; o site público de cada modelo mantém sua identidade.

## Configuração

Os três builds da vitrine usam `VITE_MERCHANT_DEMO=true` por padrão na configuração Vite. Há um `.env.example` em cada modelo. Para desabilitar explicitamente o acesso demonstrativo, configure a variável de ambiente do processo de build como `false`. Isso não transforma os demais módulos existentes em uma instalação pronta para produção.

O acesso demonstrativo aceita os perfis `proprietario`, `gerente` e `atendente`, com endereços terminados em `@demo.invalid` e senha `Demonstracao@2026`. Os botões de acesso preenchem essas credenciais. Apenas dados fictícios devem ser usados. A sessão demonstrativa fica no sessionStorage, separada da sessão da API; não representa uma barreira de segurança.

Sem demonstração, o login consulta a API e propaga falhas. O perfil é consultado na sessão do servidor; o seletor de perfis não aparece. Sair solicita revogação ao servidor. Recuperação de senha não possui serviço de envio configurado e informa essa limitação.

## Estado de validação

- Node executado: 22.23.2.
- Os três builds individuais passaram, inclusive após a revisão final de textos.
- `node --test packages/merchant-core/tests/demo-auth.test.mjs`: 2 testes passaram, cobrindo ativação explícita e rejeição de credenciais demonstrativas inválidas.
- Validação manual em navegador e celular: pendente.
- Testes de API, CSRF, permissões e demais lotes: não executados nesta etapa.
- Nenhuma dependência instalada, nenhuma alteração no CI e nenhum deploy.

## Continuidade

O estoque e contatos ainda possuem armazenamento demonstrativo local e outros adaptadores ainda têm fallbacks legados, a revisar nos lotes seguintes. O backend existente permanece no repositório. Não usar esta vitrine para dados reais ou afirmar que integrações externas estão operacionais.

As seis alterações locais anteriores ao trabalho foram preservadas e não devem ser incluídas nos commits do lote 0. A integração à main e exclusão das branches serão feitas após os lotes aprovados e verificações finais, conforme autorização do usuário.
