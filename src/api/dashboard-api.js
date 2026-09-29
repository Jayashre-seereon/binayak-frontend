import http from "./axios";

export const getDashboardSummary = async ({ period = "this_month", storeId } = {}) => {
  const res = await http.get("/api/dashboard/summary", {
    params: { period, storeId },
  });
  return res.data?.data || null;
};
