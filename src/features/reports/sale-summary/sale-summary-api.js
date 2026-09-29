const salesData = [
  {
    id: 1,
    date: "2026-03-09",
    voucher: "SL-001",
    customer: "Walk-in",
    category: "Gold",
    items: 2,
    amount: 125000,
  },
  {
    id: 2,
    date: "2026-03-08",
    voucher: "SL-002",
    customer: "Rajesh Jewellers",
    category: "Silver",
    items: 5,
    amount: 285000,
  },
  {
    id: 3,
    date: "2026-03-07",
    voucher: "SL-003",
    customer: "Priya",
    category: "Gold",
    items: 1,
    amount: 48000,
  },
];

export const getSalesReport = () => {
  return Promise.resolve(salesData);
};