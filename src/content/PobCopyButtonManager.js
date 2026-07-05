import { log, warn, error } from "./debug.js";

export const createPobCopyButtonManager = ({
  itemCache,
  textBuilder,
  clipboard,
  labels,
  resetDelayMs,
  buttonClass,
  processedAttr,
}) => {
  const setButtonStatus = (button, status) => {
    button.dataset.status = status;
    button.textContent = labels[status] || labels.ready;
  };

  const handleCopy = async (row, button) => {
    const itemId = row.getAttribute("data-id");
    if (!itemId) {
      setButtonStatus(button, "error");
      return;
    }

    if (button._pobResetTimer) {
      clearTimeout(button._pobResetTimer);
      button._pobResetTimer = null;
    }

    setButtonStatus(button, "loading");
    button.disabled = true;

    try {
      log("copying item:", itemId);
      const item = itemCache.get(itemId);
      if (!item) {
        warn("cache MISS for:", itemId);
        throw new Error("Item not in cache");
      }
      const text = textBuilder.buildPobFullText(item);
      if (!text) {
        warn("buildPobFullText returned empty for:", itemId);
        throw new Error("No valid mod lines");
      }
      log("text built, length:", text.length);
      await clipboard.copy(text);
      setButtonStatus(button, "ok");
    } catch (e) {
      error("copy failed:", e);
      setButtonStatus(button, "error");
    } finally {
      button._pobResetTimer = window.setTimeout(() => {
        setButtonStatus(button, "ready");
        button.disabled = false;
        button._pobResetTimer = null;
      }, resetDelayMs);
    }
  };

  const hasButton = (row) => {
    const left = row.querySelector(".left");
    return left && left.querySelector(`.${buttonClass}`);
  };

  const injectButton = (row) => {
    const left = row.querySelector(".left");
    if (!left) return;
    if (hasButton(row)) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = buttonClass;
    button.title = "Copy full item text for PoB Create Custom";
    setButtonStatus(button, "ready");
    button.addEventListener("click", () => handleCopy(row, button));

    const verifiedStatus = row.querySelector(".verifiedStatus");
    if (verifiedStatus && verifiedStatus.parentNode) {
      button.classList.add("pob-copy-btn--below-verified");
      verifiedStatus.insertAdjacentElement("afterend", button);
    } else {
      left.insertBefore(button, left.firstChild);
    }
    row.removeAttribute(processedAttr);
  };

  const scanAndInject = (root = document) => {
    const rows = root.querySelectorAll("div.row[data-id]");
    rows.forEach((row) => injectButton(row));
  };

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches?.("div.row[data-id]")) {
          injectButton(node);
        } else if (node.querySelectorAll) {
          scanAndInject(node);
        }
      });
    }
  });

  const start = () => {
    scanAndInject();
    observer.observe(document.body, { childList: true, subtree: true });
    // fallback rescan for SPA re-renders that don't trigger addedNodes
    setInterval(scanAndInject, 2000);
  };

  return { start };
};
