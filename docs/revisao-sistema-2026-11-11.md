# Revisão do sistema — 11/11/2026

Revisão do portal, dos três modelos, do núcleo do painel e da API existente.
Foram examinados os caminhos de importação, duplicações de implementação,
permissões, formulários, armazenamento, navegação e arquivos de produção.
A inspeção visual no navegador fica com o usuário, conforme combinado.

## Problemas corrigidos

| Área | Problema encontrado | Correção |
| --- | --- | --- |
| Hero dos três modelos | Vídeo muito escurecido; painéis dos modelos 1 e 3 pequenos | Painéis maiores, legendas menores e sobreposição mais leve; composição própria de cada modelo preservada |
| Atendimento no painel | Documentos básicos restritos ao gerente e ao nível 2 | Contratos e Termos em Operação Diária para os três perfis nas três edições; regra equivalente na API |
| Documentos | Emissores divergentes no servidor e navegador | Um emissor compartilhado, com texto escapado e identificadores únicos |
| Termo de vistoria | Checklist preenchido com aprovação automática | Campos de conforme/ressalva para conferência |
| Acesso pela rede local | Registros e contratos dependiam de `crypto.randomUUID`, indisponível em alguns contextos HTTP | Geração compatível com ausência dessa API; cenário HTTP incluído na verificação de produção |
| Favoritos do modelo 3 | JSON com estrutura inválida podia derrubar a página | Normalização, remoção de IDs duplicados e recuperação de preferências antigas |
| Seleções do modelo 3 | Contadores incluíam veículos indisponíveis; estes também ocupavam o limite do comparador | Contagem e limite baseados no catálogo disponível |
| Comparação do modelo 3 | Modal antigo sem uso e dois acessos simultâneos à comparação no estoque | Arquivo antigo removido; estoque usa o controle lateral, enquanto destaques/favoritos mantêm a barra |
| Contato do AutoElite | Dois registros da mesma solicitação em repositórios diferentes | Formulário compartilhado, com captura por loja, validação e bloqueio de reenvio sem alteração dos dados |
| Alerta de preço | Confirmação de notificação automática inexistente; passo de R$ 500 invalidava preços iniciais | Contato registrado na loja; confirmação explica continuação manual no WhatsApp; valor validado em centavos |
| Modais sobrepostos | Alerta e dossiê sem gestão de foco, rolagem ou Esc; anúncio recebia teclas por baixo | Gestão compartilhada de diálogos; Esc fecha apenas o modal superior |
| Dossiê | Histórico positivo fixo e alegação de consulta oficial sem integração | Exibição dos dados cadastrados, pendências e ausência de informação |
| Financiamento da API | Taxa zero substituída por 1,49% | Zero explícito respeitado e coberto por teste |
| Inicialização | Todos os módulos do painel faziam parte da carga inicial da vitrine | Entrada compartilhada e carregamento do painel sob demanda |
| Demonstração estática | Módulos avançados tentavam consultar API ausente antes de usar seus dados de exemplo | Consultas opcionais centralizadas; modo estático usa o adaptador local diretamente |
| Verificações da API | Testes dependiam de banco pré-existente; cópias de documentos tinham expectativas diferentes | Execução isolada em memória, preparação dos dados do lote 2 e validação do emissor compartilhado |

As cópias pequenas de `Footer` e `AutomatchLogo` por modelo são adaptadores:
elas usam `StoreFooter` e `StoreLogo` compartilhados com os dados de cada loja.
Não representam conteúdo repetido na página. Foram mantidas para preservar os
caminhos dos modelos. Fotos equivalentes nas pastas públicas também pertencem
a builds independentes; removê-las sem adaptar a publicação quebraria seus URLs.

## Verificações

- Testes do núcleo: permissões, galerias, fotos locais, seleção de veículos,
  financiamento, contatos, contratos, persistência, isolamento por loja e
  tratamento de dados inválidos.
- Testes da API em SQLite em memória: sessão, perfis, níveis, documentos básicos
  emitidos pelo atendente nos três níveis, criptografia, cálculos e adaptadores.
- Renderização do portal, iniciais, páginas institucionais, anúncios do catálogo,
  anúncios novos, atendimento, simuladores e 16 módulos do painel.
- Execução dos módulos ES compilados em DOM simulado: dez cenários, incluindo
  inicialização, anúncios, formulários, filtros, comparação, diálogos sobrepostos,
  preferências inválidas/antigas, armazenamento inválido e acesso HTTP local.
- Percurso dos menus de atendente, gerente e proprietário: 77 acessos nos três
  modelos, além da repetição do modelo 1 em HTTP local. Verificação de menu sem
  itens duplicados e emissão dos três tipos de documento pelo atendente.
- Compilação dos quatro sites e verificação dos arquivos publicados após o deploy.

Resultado local: **55 testes do núcleo e 32 testes da API aprovados**, além da
renderização e dos dez cenários de execução dos arquivos compilados. Com o painel
sob demanda, o arquivo JavaScript inicial passou de aproximadamente 467 para
282 kB no AutoElite, de 467 para 281 kB no DriveNow e de 501 para 316 kB no
Enterprise (tamanhos minificados antes da compressão). São medidas dos arquivos;
não representam uma medição do tempo de carregamento ou dos quadros do vídeo.

Essas verificações não medem alinhamento em pixels, fluidez de vídeo ou
desempenho em um aparelho real. A leitura do código e os testes dos fluxos
cobertos não equivalem a comprovar todas as integrações externas.

## Pendências encontradas nos módulos avançados

Estes pontos preexistentes foram identificados na análise e exigem implementação
própria; abrir a tela com sucesso não significa que sua operação esteja concluída:

1. **Estúdio de Stories:** `StoryStudioView.jsx` usa veículo/fotos fixos e o
   botão de download apenas mostra uma mensagem. Faltam seleção do estoque,
   composição e exportação real da arte.
2. **Consignações:** o fallback de `apiClient.saveConsignment` informa sucesso
   sem persistir uma nova consignação local. Falta conectar o formulário à
   persistência da loja ou exigir resposta real da API antes de confirmar.
3. **Contratos avançados:** o fallback de `createAdvancedContract` retorna uma
   minuta mínima com código fixo. Não substitui o gerador completo do servidor.
4. **DRE e funil:** os adaptadores estáticos retornam exemplos fixos. Ainda não
   consolidam as vendas, despesas e contatos locais da loja nesses relatórios.
5. **Auditoria/LGPD:** o fallback de anonimização confirma uma ação sem alterar
   os dados; exportação e trilha usam exemplos. Ações reais precisam de integração
   com o servidor e confirmação da operação efetiva.
6. **Precificador de mercado:** o fallback local usa cálculo simplificado e não
   devolve todos os campos mostrados na tela, como margem pretendida e preparação.
   É necessário compartilhar o cálculo completo com o serviço do servidor.
7. **Instalação com API:** a persistência da vitrine/painel principal continua
   local e os adaptadores avançados ainda usam fallbacks em falhas da API.
   Publicação no GitHub Pages não executa o servidor Node/SQLite. Uma instalação
   centralizada precisa integrar esses fluxos e propagar erros reais da API.

Essas pendências foram registradas sem excluir módulos ou dados existentes.
