const SalesRegisterData = [
  {
    id: 1,
    date: "2026-03-09",
    voucher: "PR-001",
    supplier: "ABC Bullion",
    category: "Gold",
    items: 3,
    amount: 225000,
  },
  {
    id: 2,
    date: "2026-03-08",
    voucher: "PR-002",
    supplier: "Sharma Metals",
    category: "Silver",
    items: 10,
    amount: 185000,
  },
  {
    id: 3,
    date: "2026-03-07",
    voucher: "PR-003",
    supplier: "Global Gold Ltd",
    category: "Gold",
    items: 2,
    amount: 98000,
  },
];

export const getSalesRegeReport = () => {
  return Promise.resolve(SalesRegisterData);
};