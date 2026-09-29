export default function PurchaseRegisterTable({ data }) {
    return (
        <div className="bg-white border rounded mt-4 overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Voucher</th>
                        <th className="p-3 text-left">Party</th>
                        <th className="p-3 text-left">Category</th>
                        <th className="p-3 text-left">Items</th>
                        <th className="p-3 text-left">Amount</th>
                        <th className="p-3 text-left">Gross Wt.</th>
                        <th className="p-3 text-left">Net Wt.</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id} className="border-t">
                            <td className="p-3">{item.date}</td>    
                            <td className="p-3">{item.voucher}</td>
                            <td className="p-3">{item.party}</td>
                            <td className="p-3">{item.category}</td>
                            <td className="p-3">{item.items}</td>
                            <td className="p-3">₹{item.amount.toLocaleString()}</td>
                            <td className="p-3">{item.grosswt}</td>
                            <td className="p-3">{item.netwt}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
