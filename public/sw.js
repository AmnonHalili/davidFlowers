self.addEventListener('push', function (event) {
    if (event.data) {
        try {
            const data = event.data.json();
            const options = {
                body: data.body || 'הזמנה חדשה התקבלה!',
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                vibrate: [200, 100, 200, 100, 200, 100, 200],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: '2',
                    url: data.url || '/admin/orders',
                },
                requireInteraction: true, // keeps notification on screen until user interacts
                tag: 'new-order', // Optional: groups notifications together
            };
            event.waitUntil(self.registration.showNotification(data.title || 'התראה חדשה', options));
        } catch (e) {
            console.error('Push event payload could not be parsed as JSON', e);
            // Fallback for simple text payload
            event.waitUntil(self.registration.showNotification(event.data.text(), {
                icon: '/icon-192x192.png',
                vibrate: [200, 100, 200],
            }));
        }
    }
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click received.');

    event.notification.close();

    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                // If a window is already open, focus it and navigate
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
