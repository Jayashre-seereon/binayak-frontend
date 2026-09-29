import http from "@/api/axios";

export const getSales = async () => {
  const res = await http.get("/api/sales/get");
  return res.data?.sales ?? [];
};

export const getSaleById = async (id) => {
  const res = await http.get(`/api/sales/getById/${id}`);
  return res.data?.sale ?? null;
};

export const createSale = async (payload) => {
  const res = await http.post("/api/sales/create", payload);
  return res.data ?? null;
};

export const getSalePdf = async (id) => {
  try {
    const storeId = localStorage.getItem("selectedStoreId");
    const res = await http.get(`/api/sales/downloadPdf/${id}`, {
      params: storeId ? { storeId } : undefined,
      responseType: "blob",
    });
    if (res.data?.type && res.data.type !== "application/pdf") {
      const errorText = await res.data.text();
      throw new Error(JSON.parse(errorText)?.message || "Unable to download sale invoice PDF.");
    }
    return res.data;
  } catch (error) {
    const responseBlob = error?.response?.data;
    if (responseBlob instanceof Blob) {
      try {
        const errorText = await responseBlob.text();
        const message = JSON.parse(errorText)?.message;
        if (message) throw new Error(message);
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message !== error.message) throw parseError;
      }
    }
    throw error;
  }
};

export const getInventoryByBarcode = async (barcode) => {
  try {
    const res = await http.get(`/api/inventories/getByBarcode/${encodeURIComponent(barcode)}`);
    return res.data?.inventory ?? null;
  } catch (error) {
    return null;
  }
};

