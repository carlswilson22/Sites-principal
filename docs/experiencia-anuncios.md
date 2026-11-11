# Experiência do anúncio e informações da loja

O visualizador 360° é incluído somente no modelo 3. Os modelos 1 e 2 começam
com `dealershipInfo.features.vehicle360: false`. A configuração continua
permitindo ativação por loja, com imagens próprias do veículo. O portal não
exibe mais a seção de ferramentas à la carte.

Os cards mostram combustível, motor e potência, além de ano, quilometragem e
preço. O acesso se chama “Visualizar anúncio”, e a ação de interesse se chama
“Tenho interesse”.

O atendimento e o simulador ficam depois dos detalhes do veículo. “Tirar dúvidas”
abre o chat no próprio anúncio. As conversas são separadas por loja e veículo.
O chat pode abrir o simulador, que é a última seção do conteúdo. Combinar uma
visita exige uma ação explícita para conversar com o lojista pelo WhatsApp;
não há formulário de pedido de visita no site.

## Navegação institucional

Os três modelos têm “Sobre Nós e Contato” no menu superior, com apresentação,
endereço, horários, canais de contato e uma foto local de um veículo do catálogo.
A foto é identificada como ilustrativa e mantém os créditos. A antiga rota
interna `visitas` encaminha para essa página.

Os indicadores de carros entregues, veículos periciados, pré-análise de crédito
e veículos disponíveis foram removidos das páginas iniciais e de sua configuração.

## Desempenho dos anúncios

- O chat só é montado após ser solicitado e tem carregamento separado de código.
- O simulador fechado não monta os controles nem executa seus cálculos. Após a
  primeira expansão, preserva os valores ao recolher. A abertura pelo comparador
  mantém o simulador expandido no veículo escolhido.
- As miniaturas fora da faixa visível só recebem imagens ao se aproximarem dela.
  Todas as fotos continuam acessíveis pelos botões e pelas setas da galeria.
- As imagens usam decodificação assíncrona. A foto principal tem prioridade alta.
- Os anúncios não aplicam desfoque de tela inteira. A animação do banner deixa
  de atualizar o vídeo enquanto um diálogo está aberto, retomando ao fechar o último.
- O foco inicial evita medir cada campo do anúncio. Diálogos sobrepostos mantêm
  o bloqueio de rolagem até o último fechar e somente o superior captura Tab.

## Conferência manual

Abra os três modelos e confira “Sobre Nós e Contato” no computador e no celular.
Em cada anúncio, navegue pelas fotos, role a faixa de miniaturas e abra/recolha
chat e simulador. Confira a preservação dos campos e a seleção do veículo.
No chat, “Visitar a loja” deve oferecer continuar no WhatsApp, sem pedir data
ou período. No modelo 3, confira também o visualizador 360° e os diálogos sobrepostos.

Os testes de renderização verificam estrutura e montagem sob demanda. A fluidez
em um dispositivo real depende da conferência manual; não foi medida por esses testes.
