// index.html 응답에 COOP/COEP 헤더를 덧붙여 crossOriginIsolated 상태로 만드는 서비스 워커.
// GitHub Pages는 응답 헤더를 설정할 수 없어서 이 방식으로 SharedArrayBuffer(WASM 멀티스레드)를 켭니다.
// COEP는 'credentialless'를 사용: CDN(jsdelivr/unpkg/Hugging Face) 리소스에 CORP 헤더가 없어도 쿠키 없이 불러올 수 있음.
// 문서(navigate) 요청만 다루고, 그 외 요청은 건드리지 않음.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.mode !== "navigate") return;
  event.respondWith((async () => {
    const res = await fetch(req);
    if (!res || res.status === 0 || res.type === "opaqueredirect") return res;
    const headers = new Headers(res.headers);
    headers.set("Cross-Origin-Opener-Policy", "same-origin");
    headers.set("Cross-Origin-Embedder-Policy", "credentialless");
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  })());
});
