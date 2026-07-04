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
      const item = itemCache.get(itemId);
      const text = textBuilder.buildPobFullText(item);
      if (!text) {
        throw new Error("No valid mod lines");
      }
      await clipboard.copy(text);
      setButtonStatus(button, "ok");
    } catch (error) {
      setButtonStatus(button, "error");
    } finally {
      button._pobResetTimer = window.setTimeout(() => {
        setButtonStatus(button, "ready");
        button.disabled = false;
        button._pobResetTimer = null;
      }, resetDelayMs);
    }
  };

  const injectButton = (row) => {
    const left = row.querySelector(".left");
    if (!left) return;
    if (left.querySelector(`.${buttonClass}`)) return;

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
    row.setAttribute(processedAttr, "true");
  };

  const scanAndInject = (root = document) => {
    const rows = root.querySelectorAll(
      `div.row[data-id]:not([${processedAttr}])`
    );
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
  };

  return { start };
};
