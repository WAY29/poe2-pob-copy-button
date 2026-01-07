export const createItemCache = () => {
  const items = new Map();

  const storeResults = (data) => {
    if (!data || !Array.isArray(data.result)) return;
    data.result.forEach((entry) => {
      if (!entry || !entry.id || !entry.item) return;
      items.set(entry.id, entry.item);
    });
  };

  const get = (itemId) => items.get(itemId);

  return { storeResults, get };
};
