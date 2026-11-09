/* NOTJUST List - service worker: receives push notifications while the app is closed.
   The push itself carries nothing; this asks the guest list script what's new, using the
   key this phone already has (kept in IndexedDB), and shows it. No personal data lives here. */
const ENDPOINT = "https://script.google.com/macros/s/AKfycbzezos-3isBv-jjVhDLWC-BQgry-fOSSzVqJ54uS6CjPT5HDeGW6JwTzRxVne_Tty9C/exec";

self.addEventListener("install", () => self.skipWaiting());

/* Always open the latest version of the app (skip the browser's 10-minute cache for the page itself) */
self.addEventListener("fetch", e => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request.url, { cache: "no-store", credentials: "same-origin" }).catch(() => fetch(e.request)));
});
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

function getKey() {
  return new Promise(resolve => {
    try {
      const open = indexedDB.open("notjust-app", 1);
      open.onupgradeneeded = () => open.result.createObjectStore("kv");
      open.onerror = () => resolve("");
      open.onsuccess = () => {
        const req = open.result.transaction("kv").objectStore("kv").get("key");
        req.onsuccess = () => resolve(req.result || "");
        req.onerror = () => resolve("");
      };
    } catch (_) { resolve(""); }
  });
}

self.addEventListener("push", e => {
  e.waitUntil((async () => {
    let title = "\u2726 Nueva petici\u00f3n", body = "Alguien se ha apuntado a la guest list.", pending = null;
    try {
      const key = await getKey();
      if (key) {
        const r = await fetch(ENDPOINT, { method: "POST", body: new URLSearchParams({ action: "notif", key: key }) }).then(x => x.json());
        if (!r.error) { title = r.title; body = r.body; pending = r.pending; }
      }
    } catch (_) {}
    if (pending !== null && self.navigator.setAppBadge) {
      try { pending ? await self.navigator.setAppBadge(pending) : await self.navigator.clearAppBadge(); } catch (_) {}
    }
    await self.registration.showNotification(title, { body: body, icon: "icon-192.png", badge: "icon-192.png", data: { url: "./" } });
  })());
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of wins) { if ("focus" in w) return w.focus(); }
    return self.clients.openWindow("./");
  })());
});
