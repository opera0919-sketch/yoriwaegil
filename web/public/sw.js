/* RecipeBox 서비스워커 — 홈화면 설치 + 오프라인 앱 셸.
   - 페이지(navigate): 네트워크 우선, 실패 시 캐시 (배포 직후에도 최신 유지)
   - 해시된 정적 자산·폰트 CDN: 캐시 우선 (파일명에 해시가 있어 불변)
   - Supabase API 호출은 가로채지 않음 (데이터 오프라인 폴백은 앱이 localStorage로 처리) */
const CACHE = "rb-shell-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  const isHashedAsset = url.origin === self.location.origin && url.pathname.includes("/assets/");
  const isFontCdn = url.hostname === "cdn.jsdelivr.net";
  const isIcon = url.origin === self.location.origin && /\/(icon-\d+\.png|manifest\.webmanifest)$/.test(url.pathname);
  if (isHashedAsset || isFontCdn || isIcon) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          })
      )
    );
  }
});
