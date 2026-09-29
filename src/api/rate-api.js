import http from "./axios";

// GET ALL
export const getRates = async () => {
  const res = await http.get("/api/rates/get");
  return res.data;
};

// GET BY ID
export const getRateById = async (id) => {
  const res = await http.get(`/api/rates/getbyId/${id}`);
  return res.data;
};

// CREATE
export const addRate = async (data) => {
  const res = await http.post("/api/rates/create", data);
  return res.data;
};

// UPDATE
export const updateRate = async (id, data) => {
  const res = await http.put(`/api/rates/update/${id}`, data);
  return res.data;
};

// DELETE
export const deleteRate = async (id) => {
  const res = await http.delete(`/api/rates/delete/${id}`);
  return res.data;
};