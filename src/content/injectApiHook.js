export const injectApiHook = () => {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("page-hook.js");
  script.async = false;
  document.documentElement.appendChild(script);
  script.addEventListener("load", () => script.remove());
  script.addEventListener("error", () => script.remove());
};
