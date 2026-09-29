let brandedBarcodes = [];

export const getBrandedBarcodes = () => Promise.resolve(brandedBarcodes);

export const addBrandedBarcode = (data) => {
  data.id = brandedBarcodes.length + 1;
  brandedBarcodes.push(data);
  return Promise.resolve(data);
};

export const deleteBrandedBarcode = (id) => {
  brandedBarcodes = brandedBarcodes.filter((b) => b.id !== id);
  return Promise.resolve();
};