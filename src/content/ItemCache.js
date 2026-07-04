import { log, warn } from "./debug.js";

export const createItemCache = () => {
  const items = new Map();

  const storeResults = (data) => {
    if (!data || !Array.isArray(data.result)) {
      warn("storeResults: invalid data", data);
      return;
    }
    let count = 0;
    data.result.forEach((entry) => {
      if (!entry || !entry.id || !entry.item) return;
      items.set(entry.id, entry.item);
      count++;
    });
    log("stored", count, "items, cache size:", items.size);
  };

  const get = (itemId) => items.get(itemId);

  return { storeResults, get };
};
