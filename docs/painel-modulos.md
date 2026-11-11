# Módulos do painel — entrega na branch `feature/painel-lojista-modulos`

## Financeiro por veículo

Disponível ao proprietário nos Modelos 2 e 3. Usa os veículos cadastrados no estoque da própria loja.

- Permite cadastrar, editar e remover aquisição e outros gastos.
- Mantém os lançamentos ao trocar de veículo ou recarregar a página.
- Calcula custos em centavos e só apresenta resultado quando há aquisição registrada.
- Usa o preço anunciado para estimativas. Um resultado realizado exige veículo vendido e valor efetivo informado em `actual_sale_price`, `sold_price` ou `actualSalePrice`.
- Informa falhas de armazenamento sem fechar o formulário ou remover os dados anteriores.

O cadastro do valor efetivo da venda pela interface será tratado em uma próxima entrega.

## Métricas do site

Disponível ao gerente e ao proprietário nos Modelos 2 e 3. Registra visualizações de páginas, abertura de anúncios e ações de WhatsApp na vitrine.

- Filtros de 7, 30 e 90 dias.
- Ranking dos veículos por anúncios abertos e ações de WhatsApp.
- Separação dos registros por loja.
- Registra somente tipo de interação, página, identificador do veículo e data; não copia mensagens, nomes ou telefones.
- Mantém até 10 mil eventos dos últimos 90 dias.

Os números pertencem ao navegador utilizado. Não são visitantes únicos nem um relatório consolidado entre dispositivos. Métricas opcionais não bloqueiam a navegação se o armazenamento falhar.

## Contatos e contratos

- Contatos guardam histórico de situações e observações, com data.
- O atendimento permanece aberto quando o salvamento falha.
- A seleção acompanha alterações de outras abas e fecha se o contato for removido.
- Dados inválidos não são substituídos nas operações de atualização.
- Alterar manualmente o comprador de um contrato remove o vínculo com o cliente anterior e limpa sua identificação.

## Inspeção manual

### Atendimento e financiamento

- AutoElite Seminovos, DriveNow Multimarcas e Enterprise Veículos usam seus nomes no cabeçalho, rodapé e painel.
- Visitas ficam na navegação superior. O atendimento fica dentro do anúncio. O rodapé contém os dados da loja; não há botão de voltar ao topo.
- O anúncio tem atendimento contextual e, no final, um simulador expansível com o próprio veículo selecionado. Abrir a simulação pelo comparador também abre esse anúncio, sem trocar para a página de financiamento.
- O simulador do painel está disponível aos três perfis nas três edições. Menu e rota usam as mesmas regras de acesso; as restrições dos demais módulos foram mantidas.
- O chat é um assistente automático baseado no catálogo publicado. Responde sobre veículos, orçamento, financiamento, endereço e horários. A conversa fica na sessão do navegador, separada por loja.
- Preferências e pedidos de visita são registrados como contatos no painel local. Datas inválidas são rejeitadas e visitas ficam aguardando confirmação. O registro não equivale a uma reserva ou envio para outro dispositivo.
- A transferência para um funcionário no WhatsApp é uma ação explícita do usuário. O chat não representa uma pessoa conectada nem envia mensagens automaticamente.
- A comunicação centralizada entre cliente e funcionário ainda depende de um serviço no servidor; esta entrega mantém a arquitetura de persistência local existente.

Na conferência manual, abra um anúncio, expanda o simulador e ajuste entrada, prazo e taxa. Confira o chat e registre um pedido de visita; depois, no perfil atendente, confira o contato e abra o simulador do painel. Repita nos três modelos.

1. Execute `npm run dev` e abra um modelo pelo portal.
2. No painel do Modelo 2 ou 3, use o perfil proprietário e abra **Financeiro & Margens**. Registre a aquisição e outro gasto; alterne entre veículos e recarregue para verificar a persistência.
3. Em **Contatos & WhatsApp**, altere uma situação e escreva uma observação. Reabra o contato para conferir o histórico.
4. Volte à vitrine, abra um anúncio e depois consulte **Métricas do Site**. Altere o período e confira o ranking.

Os módulos desta entrega usam armazenamento local, como o estoque e o CRM existentes. A persistência centralizada depende da integração com o servidor.
