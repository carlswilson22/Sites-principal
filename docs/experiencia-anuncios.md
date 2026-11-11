# Experiência do anúncio e recursos por edição

O visualizador 360° é incluído somente no modelo 3. Os modelos 1 e 2 começam
com `dealershipInfo.features.vehicle360: false`. O recurso consta na lista de
ferramentas à la carte do portal e pode ser configurado na implantação de uma
loja que o contratar. Ativá-lo também exige um conjunto próprio de imagens por
veículo; fotos de outro carro nunca são usadas como substitutas.

Os cards mostram combustível, motor e potência, além do ano, quilometragem e
preço já existentes. A transmissão abreviada sai do resumo. O acesso se chama
“Visualizar anúncio”, e a ação de interesse no anúncio se chama “Tenho interesse”.

O atendimento e o simulador ficam depois dos detalhes do veículo. “Tirar dúvidas”
abre o chat no próprio modal. Conversas são separadas por loja e
veículo; respostas, pedidos de visita e encaminhamento ao funcionário mantêm o
veículo de interesse. O chat pode abrir o simulador, que é a última seção do
conteúdo. O cabeçalho não tem mais atalho para a página de atendimento.

## Quatro informações na página inicial

1. Carros entregues com sucesso: histórico de atendimento da loja.
2. Veículos periciados: sinal de procedência e acesso à documentação.
3. Pré-análise de crédito: informa a possibilidade de atendimento financeiro,
   sem prometer aprovação ou prazo. A interface informa “Sob análise”.
4. Veículos disponíveis: quantidade calculada a partir do estoque publicado,
   excluindo vendidos e ocultos.

A escolha é uma decisão de UX apoiada na relevância de transparência, clareza
financeira e redução de atrito descrita pela
[pesquisa Drivers of Car Shopping Satisfaction, da Cox Automotive](https://www.coxautoinc.com/press-releases/cox-automotive-unveils-key-insights-into-successful-car-deals-in-new-study-drivers-of-car-shopping-satisfaction/).
O estudo trata do mercado dos EUA; serve como referência de experiência, não
como fonte de indicadores das lojas deste projeto. Os exemplos de entregas e
perícia continuam demonstrativos, configurados em `homeHighlights`; precisam
ser substituídos por dados comprovados em uma implantação comercial.
