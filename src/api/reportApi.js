import http from "@/api/axios";

export const getSalesReport = async (params = {}) => {
  const res = await http.get("/api/sales/report", {
    params,
  });
  return res.data;
};

export const getPurchaseReport = async (params = {}) => {
  const res = await http.get("/api/purchases/report", {
    params,
  });
  return res.data;
};

export const exportSalesReportExcelApi = async (params = {}) => {
  const res = await http.get("/api/sales/report/export-excel", {
    params,
    responseType: "blob",
  });
  return res.data;
};

export const exportPurchaseReportExcelApi = async (params = {}) => {
  const res = await http.get("/api/purchases/report/export-excel", {
    params,
    responseType: "blob",
  });
  return res.data;
};