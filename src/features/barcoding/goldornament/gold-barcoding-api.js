let barcodes = [];

export const getBarcodes = () => Promise.resolve(barcodes);

export const addBarcode = (data) => {
  data.id = barcodes.length + 1;
  barcodes.push(data);
  return Promise.resolve(data);
};

export const updateBarcode = (data) => {
  barcodes = barcodes.map((b) => (b.id === data.id ? data : b));
  return Promise.resolve(data);
};

export const deleteBarcode = (id) => {
  barcodes = barcodes.filter((b) => b.id !== id);
  return Promise.resolve();
};