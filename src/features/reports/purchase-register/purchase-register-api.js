const registerPurchaseReport = [
    {
        id: 1,
        date: "2026-03-09",
        voucher: "PR-001",
        party: "ABC Suppliers",
        category: "Gold",
        items: 10,
        amount: 500000,
        grosswt: 100.0,
        netwt: 95.0,
        
    },
    {
        id: 2,
        date: "2026-03-08",
        voucher: "PR-002",
        party: "XYZ Distributors",
        category: "Silver",
        items: 5,
        amount: 250000,
        grosswt: 10.0,
        netwt: 9.0,
        
    },
]

export const getPurchaseRegisterReport = () => {
    return Promise.resolve(registerPurchaseReport);
}