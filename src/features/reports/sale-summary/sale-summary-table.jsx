export default function ReportTable({ data }) {
  return (
    <div className="bg-white border rounded mt-4 overflow-x-auto">

      <table className="w-full text-sm">

        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Voucher</th>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Items</th>
            <th className="p-3 text-left">Amount</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-3">{item.date}</td>
              <td className="p-3">{item.voucher}</td>
              <td className="p-3">{item.customer}</td>
              <td className="p-3">{item.items}</td>
              <td className="p-3">₹{item.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}