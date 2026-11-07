/**
 * Service Worker para Web Push Notifications do Painel do Lojista (Nível 2 e 3 - I3).
 * 
 * NOTA TÉCNICA E LIMITAÇÃO IOS (Apple Web Push):
 * No ecossistema Apple iOS (Safari), as notificações Web Push só são suportadas
 * a partir do iOS 16.4 e EXIGEM que a aplicação seja previamente adicionada à Tela de Início
 * (modo Standalone / PWA Add to Home Screen) com concessão de permissão explícita pelo usuário.
 */

self.addEventListener('push', (event) => {
  let data = {
    title: 'Novo Contato Recebido!',
    body: 'Um cliente acabou de enviar uma proposta pelo site.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    url: '/painel-lojista'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: { url: data.url },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Ver Contato no Painel' },
      { action: 'close', title: 'Dispensar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/painel-lojista';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
