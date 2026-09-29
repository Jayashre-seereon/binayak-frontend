let purchases = [];

export const getPurchases = () => Promise.resolve(purchases);

export const addPurchase = (data) => {
  data.id = purchases.length + 1;
  purchases.push(data);
  return Promise.resolve(data);
};

export const deletePurchase = (id) => {
  purchases = purchases.filter((p) => p.id !== id);
  return Promise.resolve();
};