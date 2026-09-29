let oldPurchases = [
    {
        id: 1,
        date: "2024-06-01",
        supplier: "Supplier A",
        item: "Gold Bar",
        weight: 100,
        rate: 5000,
        totalAmount: 500000,
        party: "Party A",
        voucher: "VCH001",
    },

];

export const getbullionPurchases = () => Promise.resolve(oldPurchases);

export const addbullionPurchase = (data) => {
  data.id = oldPurchases.length + 1;
  oldPurchases.push(data);
  return Promise.resolve(data);
};

export const deletebullionPurchase = (id) => {
  oldPurchases = oldPurchases.filter((p) => p.id !== id);
  return Promise.resolve();
};

export const updatebullionPurchase = (data) => {
  oldPurchases = oldPurchases.map((p) => (p.id === data.id ? data : p));
  return Promise.resolve(data);
};