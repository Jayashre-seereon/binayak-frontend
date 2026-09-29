let mrpBarcodes = [];

export const getMrpBarcodes = () => Promise.resolve(mrpBarcodes);

export const addMrpBarcode = (data) => {
  data.id = mrpBarcodes.length + 1;
  mrpBarcodes.push(data);
  return Promise.resolve(data);
};

export const deleteMrpBarcode = (id) => {
  mrpBarcodes = mrpBarcodes.filter((b) => b.id !== id);
  return Promise.resolve();
};