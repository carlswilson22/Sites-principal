# Experiência dos anúncios e informações da loja

Atualizada em **17/11/2026**, referência `3f3961d`.

## Organização do anúncio

Os três modelos usam conteúdo compacto em ordem vertical:

1. Identificação do veículo, foto principal e miniaturas.
2. Resumo de ano, quilometragem, câmbio e combustível.
3. Atendimento e financiamento em linhas expansíveis.
4. Informações adicionais e ferramentas da edição; cada conteúdo aparece
   imediatamente abaixo do botão correspondente.
5. Rodapé com preço e um único WhatsApp: **Tenho interesse**.

As seções adicionais começam fechadas. Abrir atendimento, financiamento ou
ferramenta fecha a seção anteriormente aberta. A expansão leva ao conteúdo;
fechar ou clicar novamente devolve foco e rolagem à linha correspondente,
respeitando movimento reduzido. Trocar de seção não deve devolver o usuário
indevidamente à seção anterior.

Galeria ampliada, opcionais, ficha e laudo são públicos. O chat é automático e
funciona no anúncio. Financiamento solicita login no mesmo contexto. O
comparador Enterprise pode abrir o anúncio com a simulação solicitada.
Financiamento e TCO preservam valores ao recolher; fechar 360° interrompe sua
animação. Cada galeria usa as imagens cadastradas para o veículo escolhido.

Financiamento tem três bancos/taxas ilustrativos, entrada, prazo e resumo;
detalhamento de custos começa recolhido. Taxa manual fica no simulador
independente e no painel. Não há aprovação ou contratação bancária.

Enterprise acrescenta 360°, TCO, dossiê e interesse em condição de preço nas
linhas de ferramentas. O interesse em preço não cria outro WhatsApp no rodapé
nem dispara notificações. O giro exige sequência própria. Nos modelos 1 e 2,
`features.vehicle360` começa desativado.

## Catálogo e informações da loja

Cards mostram combustível, motor e potência além de ano, quilometragem e preço,
conforme os dados disponíveis. O acesso é **Visualizar anúncio**. As iniciais
exibem até seis veículos publicados e não vendidos, priorizando destaques;
não criam anúncios para preencher a vitrine.

Indicadores genéricos de carros entregues, perícia, pré-análise de crédito e
quantidade disponível foram retirados das iniciais.

**Sobre Nós e Contato** reúne apresentação, história, transparência/confiança,
foto ilustrativa e dados da loja. Contatos ficam em um bloco, com rodapé
compacto nessa página. Sem faixa vazia adicional ou divisórias entre seções.
A composição varia por modelo. A antiga rota `visitas` leva à página
institucional; visitas são combinadas com a equipe no WhatsApp, sem agendamento
pelo site.

## Medidas de desempenho e navegação

- Galeria inicial com altura contida e miniaturas compactas; fotos distantes
  da faixa visível carregam ao se aproximarem dela.
- Imagem principal prioritária; decodificação assíncrona das imagens.
- Chat, galeria ampliada e ferramentas carregados sob demanda.
- Simulador fechado não monta inicialmente seus controles; preserva estado
  depois da primeira abertura.
- Vídeo da inicial suspende atualizações com diálogos abertos e respeita
  preferência por movimento reduzido.
- Sem desfoque de tela inteira no anúncio. Diálogos sobrepostos conservam
  bloqueio de rolagem até o último fechar; somente o superior captura Tab.

Essas medidas reduzem montagem e trabalho de renderização. Não representam
meta de tempo de carregamento ou fluidez medida em todos os dispositivos.

## Conferência manual

Em computador e celular, para cada modelo:

1. Abrir veículos diferentes e conferir capa, miniaturas, setas e galeria ampliada.
2. Trocar entre ficha, chat e simulador; conferir uma seção aberta por vez e
   retorno ao botão correto ao fechar.
3. Entrar/cadastrar pelo simulador, alternar banco, entrada e prazo; recolher
   e reabrir para conferir a conservação dos valores e do veículo.
4. Conversar no chat e registrar preferência. Conferir que o encaminhamento
   externo depende de uma ação explícita.
5. No Enterprise, repetir com 360°, TCO, dossiê, condição de preço e comparador.
6. Conferir a página institucional e a ausência de contatos duplicados.

Testes de estrutura e execução cobrem fluxos específicos. Alinhamento,
legibilidade, fluidez e desempenho em aparelho real exigem inspeção manual,
conforme as condições de homologação que forem acordadas.
