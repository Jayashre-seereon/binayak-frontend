import http from "./axios";

export const getPurchases = async () => {
  const res = await http.get("/api/purchases/get");
  return res.data?.purchases ?? [];
};

export const getPurchaseById = async (id) => {
  const res = await http.get(`/api/purchases/getById/${id}`);
  return res.data?.purchase ?? null;
};

export const getPurchaseItemsByPurchaseId = async (purchaseId) => {
  const res = await http.get(`/api/purchases/itemsByPurchase/${purchaseId}`);
  return res.data?.purchaseItems ?? [];
};

export const getOldGoldPurchasesByPhone = async (phone) => {
  const res = await http.get("/api/purchases/old-gold/by-phone", {
    params: { phone },
  });

  return res.data?.purchases ?? [];
};
