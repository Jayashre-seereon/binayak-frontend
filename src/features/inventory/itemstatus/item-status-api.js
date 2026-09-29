const itemStatusData = [
  {
    barcode: "BC-001",
    item: "Choker Necklace",
    status: "Available",
    counter: "A",
    price: 250000,
    lastUpdated: "2026-04-01",
  },
  {
    barcode: "BC-002",
    item: "Solitaire Ring",
    status: "Sold",
    counter: "A",
    price: 85000,
    lastUpdated: "2026-03-28",
  },
  {
    barcode: "BC-003",
    item: "Broad Bangle",
    status: "In Repair",
    counter: "B",
    price: 120000,
    lastUpdated: "2026-03-25",
  },
];

export const getItemStatus = async (barcode) => {
  const item = itemStatusData.find(
    (d) => d.barcode.toLowerCase() === barcode.toLowerCase()
  );

  return new Promise((resolve) => {
    setTimeout(() => resolve(item || null), 500);
  });
};