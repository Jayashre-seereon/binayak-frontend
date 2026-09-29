import http from "@/api/axios";

const getStoreId = () =>
  localStorage.getItem("selectedStoreId") ||
  JSON.parse(localStorage.getItem("selectedStore") || "null")?.id ||
  JSON.parse(localStorage.getItem("storeUser") || "null")?.storeId ||
  null;

export const getTransfers = async () => {
  const res = await http.get("/api/inventory-transfer/get");
  return res.data?.transfers ?? [];
};

export const getTransferById = async (id) => {
  const res = await http.get(`/api/inventory-transfer/getById/${id}`);
  return res.data?.transfer ?? null;
};

export const createTransfer = async (payload) => {
  const storeId = getStoreId();
  const res = await http.post(
    "/api/inventory-transfer/create",
    {
      ...payload,
      fromStoreId: payload.fromStoreId ?? storeId ?? undefined,
    },
    {
    params: storeId ? { storeId } : undefined,
    }
  );
  return res.data?.transfer ?? null;
};

export const updateTransfer = async (id, payload) => {
  const storeId = getStoreId();
  const res = await http.put(
    `/api/inventory-transfer/update/${id}`,
    payload,
    {
    params: storeId ? { storeId } : undefined,
    }
  );
  return res.data?.transfer ?? null;
};

export const cancelTransfer = async (id, payload = {}) => {
  const storeId = getStoreId();
  const res = await http.put(
    `/api/inventory-transfer/cancel/${id}`,
    {
      ...payload,
      storeId: payload.storeId ?? storeId ?? undefined,
    },
    {
      params: storeId ? { storeId } : undefined,
    }
  );
  return res.data?.transfer ?? null;
};

export const receiveTransfer = async (id, payload = {}) => {
  const storeId = getStoreId();
  const res = await http.put(
    `/api/inventory-transfer/receive/${id}`,
    {
      ...payload,
      toStoreId: payload.toStoreId ?? storeId ?? undefined,
    },
    {
      params: storeId ? { storeId } : undefined,
    }
  );
  return res.data?.transfer ?? null;
};

export const getInventories = async () => {
  const storeId = getStoreId();
  const res = await http.get("/api/inventories/get", {
    params: storeId ? { storeId } : undefined,
  });
  return res.data?.inventories ?? [];
};

export const getStores = async () => {
  const res = await http.get("/api/stores/get");
  return res.data?.stores ?? [];
};
