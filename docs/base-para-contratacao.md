# Base técnica para preparação do contrato

**Situação:** documento preparatório, sem contratação formalizada.
**Atualizado em:** 17/11/2026.
**Produto:** modelos do repositório Sites-principal.
**Versão técnica examinada:** `3f3961dae0655117776e6f7d70fcdb45729ff1b1`.

Este documento organiza as decisões necessárias para redigir o contrato e seu
anexo técnico. As condições comerciais ainda não foram decididas. O inventário
do código descreve a demonstração atual e não representa, sozinho, uma promessa
de implantação de todos os módulos em produção.

## 1. Identificação e seleção

| Campo | Definição |
| --- | --- |
| Contratante, CNPJ/CPF e representante | A definir |
| Contratado, CNPJ/CPF e representante | A definir |
| Nome, marca e unidade da loja | A definir |
| Modelo: AutoElite / DriveNow / Enterprise | A definir |
| Modalidade: apresentação demonstrativa ou implantação operacional | A definir |
| Funcionalidades selecionadas e eventuais exclusões | A definir com a matriz abaixo |
| Personalizações de layout, conteúdo e identidade | A definir |
| Integrações externas e fornecedores escolhidos | A definir |
| Versão dos anexos e do código que comporão a entrega | A definir na formalização |

O portal apresenta três alternativas; selecionar uma delas não significa
contratar os três sites ou incluir o próprio portal no site final da loja.
Os nomes atuais dos modelos e os dados das lojas são exemplos substituíveis.

## 2. Documentos para compor o escopo

- [Inventário de funcionalidades](funcionalidades-dos-modelos.md): descrição das operações.
- [Matriz dos modelos e perfis](matriz-de-funcionalidades.md): distribuição dos recursos.
- [Propostas visuais](modelos-visuais.md): estrutura de cada alternativa.
- [Integrações e implantação](manuais-de-integracao.md): dependências técnicas.
- [Segurança e privacidade](politica-de-seguranca-lgpd.md): medidas e lacunas atuais.
- [Mídia](media/README.md) e [NOTICE](../NOTICE): materiais de terceiros e atribuições.

Ao converter estes documentos em anexo, marque os recursos escolhidos,
descreva o resultado esperado e fixe sua versão. A quantidade de telas do
painel não equivale a quantidade de integrações operacionais contratadas.

## 3. Situação demonstrada e implantação futura

| Área | O que existe hoje | O que delimitar na contratação |
| --- | --- | --- |
| Publicação | Portal e três sites estáticos no GitHub Pages | Site escolhido, ambiente de homologação e ambiente final |
| Contas e acesso | Cadastro/login local de demonstração; três perfis de equipe | Autenticação de clientes/equipe em servidor, recuperação e gestão de acesso |
| Estoque, CRM e contatos | Persistência no navegador, separada por loja | Banco central, sincronização, mídia, importação e acesso entre dispositivos |
| Financiamento | Estimativa Price com três bancos ilustrativos no anúncio | Condições reais, custos, eventual integração bancária e autorizações |
| Atendimento | Assistente automático local e encaminhamento explícito ao WhatsApp | Canais, número da loja e eventual atendimento humano dentro do site |
| Instagram | Arte PNG e simulação local com histórico | Conta real, permissões, hospedagem da mídia, atualização e teste do adaptador |
| DRE e funil Enterprise | Relatórios com números de exemplo | Fontes, fórmulas, conciliação e consolidação efetiva dos dados |
| LGPD Enterprise | Exportação/anonimização de clientes de exemplo | Atendimento real ao titular em todas as bases, documentos e backups aplicáveis |
| Documentos emitidos pelo painel | Minutas básicas e avançadas conforme o modelo | Textos comerciais/jurídicos da loja, campos, revisão e forma de assinatura |

O servidor Node/SQLite está no repositório, mas não está hospedado no GitHub
Pages nem conectado a todos os fluxos locais. Desativar a demonstração ou
informar credenciais de APIs não conclui uma implantação operacional.

## 4. Limites a preservar na apresentação ao cliente

- Condição A, B e C aparecem como exemplos de cálculo, sem nome de instituição.
  A loja define os nomes e as taxas reais. Não existe parceria bancária,
  consulta bancária, aprovação de crédito ou oferta vinculante. Os cálculos não representam CET ou proposta de banco.
- Fotos, preços, laudos, histórico e indicadores são dados de demonstração.
  Exibir um laudo cadastrado não significa consultar órgão oficial ou certificar o veículo.
- O giro 360° padrão pertence ao Enterprise e exige uma sequência própria do
  veículo. Não é produzido automaticamente a partir de uma única foto.
- Favoritos vêm no DriveNow (Expert) e no Enterprise (Premium); a comparação
  pertence ao Enterprise e é pública. Favoritos exigem conta. O simulador no anúncio exige login nos três modelos.
- WhatsApp abre o canal externo por escolha do visitante. Não há agendamento
  de visitas, aprovação financeira, pagamento ou assinatura eletrônica integrada.
- CSV de catálogo é exportação de arquivo; publicação direta em portais e
  compatibilidade com formatos de terceiros precisam de escopo específico.
- IA generativa, consulta FIPE atualizada e notificações Web Push não devem
  ser descritas como serviços já ativados na demonstração.
- Ferramentas de segurança e privacidade não constituem certificação de
  conformidade legal. Os limites estão no documento específico.

## 5. Itens comerciais e de entrega em aberto

| Item | Definição |
| --- | --- |
| Preço, forma de pagamento, parcelas e tributos | A definir |
| Etapas, prazo e evento de início da contagem | A definir |
| Conteúdo e credenciais a fornecer e respectivos prazos | A definir |
| Domínio, titularidade e renovação | A definir |
| Hospedagem, banco, armazenamento e custos recorrentes | A definir |
| APIs, contas de terceiros, limites e cobrança por uso | A definir |
| Importação inicial: origem, volume e formato dos dados | A definir |
| Quantidade de unidades, usuários, veículos e volume de mídia | A definir |
| Navegadores, dispositivos e requisitos de acessibilidade para homologação | A definir |
| Suporte: canal, horário, prazo de resposta e duração | A definir |
| Manutenção corretiva, evolutiva e atualizações de dependências | A definir |
| Backup: responsável, frequência, retenção e teste de restauração | A definir |
| Disponibilidade, monitoramento e tratamento de incidentes | A definir |
| Treinamento e documentação de entrega | A definir |
| Licença de uso, entrega do código, exclusividade e direitos sobre personalizações | A definir, respeitando direitos de terceiros |
| Encerramento, exportação/migração de dados e revogação de acessos | A definir |
| Procedimento, prazo e responsáveis pelo aceite | A definir |

Não há SLA, hospedagem, manutenção contínua ou cessão de direitos presumidos
por este arquivo. Esses itens precisam ser redigidos de acordo com a negociação.

## 6. Responsabilidades a distribuir no contrato

Registrar quem fornece, valida e mantém cada item:

| Item | Responsável e evidência esperada |
| --- | --- |
| Marca, textos, contatos, endereço e horários | A definir; conteúdo final validado |
| Fotos, vídeos e direitos de uso | A definir; origem/autorização registrada |
| Preço, estoque, situação de venda, ficha e laudos | A definir; dados conferidos pela loja |
| Contas externas e credenciais | A definir; credenciais entregues por canal reservado |
| Infraestrutura, certificados, implantação e monitoramento | A definir; ambiente identificado |
| Cadastro e desligamento de funcionários | A definir; perfis e permissões aprovados |
| Privacidade, bases de tratamento, retenção e solicitações de titulares | A definir conforme a operação real |
| Minutas comerciais emitidas pela loja | A definir; versão dos textos aprovada para o uso pretendido |
| Testes e homologação visual/funcional | A definir; roteiro e registro dos resultados |

## 7. Roteiro proposto para critérios de aceite

Aplicar apenas aos itens selecionados e no ambiente contratado. Critérios de
desempenho quantitativos precisam indicar dispositivo, rede, dados e limites
acordados; não há métricas ou promessa de velocidade fixadas neste documento.

| Verificação | Resultado a demonstrar |
| --- | --- |
| Navegação e identidade | Páginas escolhidas acessíveis, nome/marca corretos e layout conferido em computador/celular |
| Estoque e anúncio | Cadastro/edição/publicação refletidos no catálogo; fotos e dados do veículo correto |
| Persistência | Dados preservados após sair/reentrar; entre dispositivos se houver banco central contratado |
| Contas e perfis | Visitante/cliente sem painel; equipe apenas com módulos permitidos; saída revoga acesso conforme a implantação |
| Financiamento | Veículo, banco/taxa ilustrativa, entrada e prazo coerentes; estimativa identificada e sem aprovação prometida |
| Atendimento | Conversa contextual; mensagem encaminhada ao número correto somente por ação do usuário |
| Documentos | Dados e veículo corretos, prévia legível, impressão e histórico conforme o módulo |
| Recursos Enterprise selecionados | Comparação, favoritos, 360°, cálculos e ferramentas conforme o escopo e dados disponíveis |
| Serviços externos selecionados | Operação real comprovada na conta de homologação, erros tratados e autorizações registradas |
| Dados e operação | Ausência de credenciais/dados fictícios no ambiente final; políticas e rotinas acordadas verificadas |

Definir na formalização como registrar inconformidades, prazos para correção,
reteste e aceite. Para novas solicitações, registrar impacto em escopo, custo
e prazo antes de incorporá-las à entrega.

## 8. Checklist para redigir o contrato depois

- [ ] Escolher modelo, unidade e modalidade de entrega.
- [ ] Selecionar módulos e personalizações; registrar exclusões e dependências.
- [ ] Definir implantação, serviços externos e custos recorrentes.
- [ ] Preencher condições comerciais e responsabilidades.
- [ ] Ajustar privacidade, direitos de uso e minutas à operação da loja.
- [ ] Fixar versão dos anexos, ambiente e critérios de aceite.
- [ ] Revisar o instrumento contratual conforme a negociação e o uso pretendido.

O preenchimento desta base ainda não substitui o contrato entre as partes.
