// Fluentic AI Service Worker — bara för notification click-handling.
// Vi har ingen Push API ännu (kräver VAPID + backend) — det här är ren UX-glasyr
// som låter notiser fokusera/öppna rätt tab när användaren klickar.

self.addEventListener("install", (event) => {
  // Aktivera direkt utan att vänta på reload
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Ta över alla öppna klienter direkt
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // URL från notisens data, fallback hem
  const targetUrl = event.notification.data?.url || "/";
  const fullUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Försök hitta en redan öppen tab på Fluentic — fokusera och navigera
      for (const client of allClients) {
        if (client.url.startsWith(self.location.origin)) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(fullUrl);
            } catch (e) {
              // Vissa browsers blockerar navigate — strunta i det
            }
          }
          return;
        }
      }

      // Annars öppna ny tab
      if (self.clients.openWindow) {
        await self.clients.openWindow(fullUrl);
      }
    })(),
  );
});
