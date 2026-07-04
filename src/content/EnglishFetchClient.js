export const createEnglishFetchClient = ({ itemCache, englishOrigins }) => {
  const inFlightEnglishFetches = new Set();

  const isEnglishOrigin = (origin) => englishOrigins.has(origin);

  const getFallbackQueryId = () => {
    const url = new URL(window.location.href);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart !== "poe2") {
      return lastPart;
    }
    const queryParam = url.searchParams.get("query");
    if (queryParam) return queryParam;
    if (url.hash) {
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      const hashQuery = hashParams.get("query");
      if (hashQuery) return hashQuery;
    }
    return null;
  };

  const buildEnglishFetchUrl = (sourceUrl) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(sourceUrl, window.location.href);
    } catch (error) {
      return null;
    }
    const outUrl = new URL(parsedUrl.pathname, "https://pathofexile.com");
    parsedUrl.searchParams.forEach((value, key) => {
      outUrl.searchParams.set(key, value);
    });
    const fallbackQueryId = getFallbackQueryId();
    if (!outUrl.searchParams.get("query") && fallbackQueryId) {
      outUrl.searchParams.set("query", fallbackQueryId);
    }
    if (!outUrl.searchParams.get("realm")) {
      outUrl.searchParams.set("realm", "poe2");
    }
    return outUrl.toString();
  };

  const fetchEnglishData = (sourceUrl) => {
    const englishUrl = buildEnglishFetchUrl(sourceUrl);
    if (!englishUrl || inFlightEnglishFetches.has(englishUrl)) return;
    if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
      return;
    }
    inFlightEnglishFetches.add(englishUrl);
    try {
      chrome.runtime.sendMessage(
        { type: "fetch-english", url: englishUrl },
        (response) => {
          if (!chrome?.runtime || chrome.runtime.lastError) {
            inFlightEnglishFetches.delete(englishUrl);
            return;
          }
          if (response?.ok && typeof response.body === "string") {
            try {
              const data = JSON.parse(response.body);
              itemCache.storeResults(data);
            } catch (error) {
              console.error("[PoB-Copy fetch] re-fetch parse error:", error);
            }
          }
          inFlightEnglishFetches.delete(englishUrl);
        }
      );
    } catch (error) {
      console.error("[PoB-Copy fetch] sendMessage error:", error);
      inFlightEnglishFetches.delete(englishUrl);
    }
  };

  const handleApiMessage = (url, bodyText) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(url, window.location.href);
    } catch (error) {
      console.error("[PoB-Copy fetch] URL parse error:", error);
      return;
    }
    const englishOrigin = isEnglishOrigin(parsedUrl.origin);
    console.log("[PoB-Copy fetch] handleApiMessage:", "origin:", parsedUrl.origin, "isEnglish:", englishOrigin, "hasBody:", !!bodyText);
    if (bodyText && englishOrigin) {
      try {
        const data = JSON.parse(bodyText);
        itemCache.storeResults(data);
        console.log("[PoB-Copy fetch] cached from English origin, items:", data?.result?.length);
      } catch (error) {
        console.error("[PoB-Copy fetch] parse error:", error);
      }
    }
    if (!englishOrigin) {
      console.log("[PoB-Copy fetch] non-English origin, triggering re-fetch");
      fetchEnglishData(parsedUrl.toString());
    } else if (!bodyText) {
      console.log("[PoB-Copy fetch] English origin but no body, re-fetching");
      fetchEnglishData(parsedUrl.toString());
    }
  };

  return { handleApiMessage };
};
