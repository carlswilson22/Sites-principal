# Agenda, contatos e acompanhamento

Os três modelos compartilham a agenda e os contatos. Na página Agenda ou no anúncio, o visitante escolhe visita ou test drive, data e horário desejados, informa nome e WhatsApp e autoriza o contato. O pedido entra na lista de contatos e também aparece em Agenda no painel. Ele é uma **solicitação**: os horários são ilustrativos e a equipe deve confirmar disponibilidade com o cliente. Não há sincronização com Cal.com nem bloqueio de horários; o fluxo foi inspirado na experiência de agendamento da plataforma.

O formulário de contato e o simulador também geram contatos no mesmo lugar. A simulação é pública e registra veículo, entrada, prazo, condição e parcela estimada. Não é necessário criar conta para esses fluxos. No painel, a equipe registra a próxima ação e a data; ações vencidas aparecem em Atrasados, e ações futuras do dia em Hoje. Ao responder, é necessário mudar a situação do contato para Em atendimento, Ganho ou Perdido.

Na própria agenda, a equipe pode criar, editar, concluir, reabrir e excluir lembretes independentes, além de selecionar um contato e definir ou alterar sua próxima ação. Lembretes e ações aparecem agrupados por prazo; os pedidos de visita continuam separados. O servidor persiste os lembretes no banco da loja; na demonstração eles ficam somente no navegador. A agenda apresenta os compromissos no painel e não envia notificações automáticas de lembrete.

## Origem de marketing

Links podem usar `utm_source`, `utm_campaign` e `utm_medium`, por exemplo `?utm_source=instagram&utm_campaign=ofertas`. A atribuição fica na sessão do navegador e acompanha os novos contatos, inclusive os de financiamento e agenda. Sem UTM, o sistema tenta reconhecer Instagram, Google ou OLX pelo endereço de referência; caso contrário registra Direto. A lista do painel mostra quantos contatos e quantos ganhos foram atribuídos a cada canal. Isso é atribuição simples, não uma medição completa de conversões.

## Avisos no servidor

Quando o servidor da loja estiver em execução, o processo verifica os contatos novos a cada minuto e avisa cada proprietário ativo por e-mail depois de `LEAD_ALERT_MINUTES` minutos (padrão 60). O destaque no painel usa o mesmo prazo. O status Novo significa que a equipe ainda não registrou atendimento; a ferramenta não verifica mensagens externas no WhatsApp. O aviso de contato novo já existente continua independente.

O resumo é enviado a cada proprietário ativo a partir de segunda-feira às 8h no horário de São Paulo, com os contatos criados e veículos vendidos na semana anterior, o total atual de contatos novos e os veículos há pelo menos 60 dias em estoque. Caso o servidor esteja parado, o resumo é tentado quando voltar naquela semana. Envios concluídos são registrados para não repetir; falhas são tentadas novamente. Uma única instância do servidor deve executar o processo de avisos.

Para envio real, cadastrar o e-mail do proprietário, configurar `RESEND_API_KEY` e `EMAIL_FROM` no ambiente do servidor e mantê-lo em execução. Consulte `server/.env.example`. Sem provedor, remetente ou proprietário configurado não há envio.

## Demonstração publicada

No GitHub Pages, os modelos usam apenas o armazenamento local do navegador: contatos, solicitações e ações aparecem somente no mesmo navegador e dispositivo. A página estática não envia e-mails, compartilha dados com a loja ou confirma a disponibilidade. Para uso por uma loja real é necessário conectar e configurar o servidor e o provedor de e-mail, além de definir os dados e os horários da loja.
