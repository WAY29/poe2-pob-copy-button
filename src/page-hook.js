(() => {
  const DEBUG = false;
  const log = DEBUG ? console.log.bind(console, "[PoB-Copy hook]") : () => {};
  const MESSAGE_SOURCE = "pob-copy";

  const emit = (url, body) => {
    try {
      if (!url || typeof url !== "string") return;
      if (!url.includes("/api/trade2/fetch/")) return;
      log("intercepted fetch:", url, "body len:", body ? body.length : 0);
      window.postMessage({ source: MESSAGE_SOURCE, url, body }, "*");
    } catch (e) {}
  };

  const origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function (...args) {
      let targetUrl = null;
      try {
        const target = args[0] instanceof Request ? args[0].url : args[0];
        targetUrl = String(target);
      } catch (e) {}
      const responsePromise = origFetch.apply(this, args);
      if (targetUrl && targetUrl.includes("/api/trade2/fetch/")) {
        responsePromise.then((response) => {
          try {
            const cloned = response.clone();
            cloned.text().then((body) => emit(targetUrl, body));
          } catch (e) {}
        });
      }
      return responsePromise;
    };
  }

  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    try {
      if (typeof url === "string" && url.includes("/api/trade2/fetch/")) {
        this.__pobCopyUrl = url;
      }
    } catch (e) {}
    return origOpen.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function (...args) {
    try {
      if (this.__pobCopyUrl) {
        this.addEventListener(
          "load",
          () => {
            try {
              let body = null;
              if (this.responseType === "" || this.responseType === "text") {
                body = this.responseText;
              } else if (this.responseType === "json") {
                body = JSON.stringify(this.response);
              }
              emit(this.__pobCopyUrl, body);
            } catch (e) {}
          },
          { once: true }
        );
      }
    } catch (e) {}
    return origSend.apply(this, args);
  };
})();
