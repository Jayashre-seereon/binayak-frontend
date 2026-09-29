import http from "@/api/axios";

export const getStock = async () => {
  const res = await http.get("/api/inventories/get");
  return res.data?.inventories ?? [];
};

export const getStockById = async (id) => {
  const res = await http.get(`/api/inventories/getById/${id}`);
  return res.data?.inventory ?? res.data?.data ?? null;
};

export const createStock = async (purchaseItemId) => {
  const res = await http.post("/api/inventories/create", {
    purchaseItemId,
  });
  return res.data?.inventory ?? null;
};

export const updateStock = async (id, data) => {
  const res = await http.put(`/api/inventories/update/${id}`, data);
  return res.data?.inventory ?? null;
};

export const updateStockStatus = async (id, status) => {
  const res = await http.put(`/api/inventories/status/${id}`, { status });
  return res.data?.inventory ?? null;
};

export const deleteStock = async (id) => {
  const res = await http.delete(`/api/inventories/delete/${id}`);
  return res.data;
};

export const getStockLabelPdf = async (id) => {
  const res = await http.get(`/api/inventories/label/${id}`, {
    responseType: "blob",
  });

  return res.data;
};

export const getStockLabelsBulkPdf = async (ids) => {
  const res = await http.post(
    "/api/inventories/labels/bulk",
    { ids },
    { responseType: "blob" }
  );
  return res.data;
};