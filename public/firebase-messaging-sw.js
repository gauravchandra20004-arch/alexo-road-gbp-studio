// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

self.addEventListener('push', function(event) {
  if (event.data) {
    const payload = event.data.json();
    const title = payload.notification?.title || 'ALEXO Road Map Notification';
    const options = {
      body: payload.notification?.body || 'New update available on your Google Business Profile.',
      icon: '/favicon.svg',
      badge: '/favicon.svg'
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});
