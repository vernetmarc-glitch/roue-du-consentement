/* Kiff Kiff — ancienne adresse. Le jeu vit maintenant sur kiff-kiff.fr.
 * Ce service worker remplace l’ancien : il ne garde plus rien en cache, et continue d’afficher
 * les avertissements des parties dont l’autre téléphone connaît encore l’ancienne adresse.
 * Un toucher ouvre la page de passage, qui emporte les parties vers kiff-kiff.fr. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.map((c) => caches.delete(c)))).then(() => self.clients.claim()));
});
const PARTIE = /^[a-z2-9]{12}$/;
function avis(m) {
  if (m.k === 'kiff') return 'Un kiff kiff vous attend !';
  if (m.k === 'arrivee') return 'Ton invitation est acceptée : la partie commence.';
  if (m.ph === 'review') return 'Une proposition t’attend.';
  if (m.ph === 'reconfirm') return 'Du nouveau : c’est à toi de répondre.';
  return 'C’est à toi de jouer.';
}
self.addEventListener('push', (e) => {
  let m = {};
  try { m = e.data ? e.data.json() : {}; } catch (err) { m = {}; }
  const room = PARTIE.test(m.r || '') ? m.r : '';
  e.waitUntil(self.registration.showNotification('Kiff Kiff', {
    body: avis(m), icon: 'https://kiff-kiff.fr/icons/icon-192.png', badge: 'https://kiff-kiff.fr/icons/badge-96.png',
    tag: 'kk-' + (room || 'partie'), renotify: true, data: { r: room }
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const room = (e.notification.data && e.notification.data.r) || '';
  e.waitUntil(self.clients.openWindow(new URL(room ? './?jouer=' + room : './', self.registration.scope).href));
});
