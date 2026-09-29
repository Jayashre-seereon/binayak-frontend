let diamondBarcodes = [];

export const getDiamondBarcodes = () => Promise.resolve(diamondBarcodes);

export const addDiamondBarcode = (data) => {
  data.id = diamondBarcodes.length + 1;
  diamondBarcodes.push(data);
  return Promise.resolve(data);
};

export const updateDiamondBarcode = (data) => {
  diamondBarcodes = diamondBarcodes.map((b) =>
    b.id === data.id ? data : b
  );
  return Promise.resolve(data);
};

export const deleteDiamondBarcode = (id) => {
  diamondBarcodes = diamondBarcodes.filter((b) => b.id !== id);
  return Promise.resolve();
};