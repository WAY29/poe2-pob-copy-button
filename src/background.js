(() => {
  const DEBUG = false;
  const log = DEBUG ? console.log.bind(console, "[PoB-Copy bg]") : () => {};
  const ENGLISH_ORIGINS = new Set([
    "https://pathofexile.com",
    "https://www.pathofexile.com",
  ]);

  const normalizeEnglishUrl = (input) => {
    let url;
    try {
      url = new URL(input);
    } catch (error) {
      return null;
    }
    if (!url.pathname.includes("/api/trade2/fetch/")) {
      return null;
    }
    if (!ENGLISH_ORIGINS.has(url.origin)) {
      url = new URL(url.pathname + url.search, "https://pathofexile.com");
    }
    return url.toString();
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || message.type !== "fetch-english") return;
    const englishUrl = normalizeEnglishUrl(message.url);
    log("fetch-english:", message.url, "→", englishUrl);
    if (!englishUrl) {
      sendResponse({ ok: false, error: "invalid_url" });
      return;
    }
    fetch(englishUrl, { credentials: "include" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Fetch failed: ${response.status}`);
        }
        return response.text();
      })
      .then((body) => {
        log("fetch OK, body len:", body.length);
        sendResponse({ ok: true, body });
      })
      .catch((e) => {
        console.error("[PoB-Copy bg] fetch error:", e);
        sendResponse({ ok: false, error: String(e) });
      });
    return true;
  });
})();
