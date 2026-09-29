export default function StockTable({ data }) {
  return (
    <div className="bg-white border rounded overflow-x-auto">

      <table className="w-full text-sm">

        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Barcode</th>
            <th className="p-3 text-left">Item</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Purity</th>
            <th className="p-3 text-left">Gross Wt (gm)</th>
            <th className="p-3 text-left">Net Wt (gm)</th>
            <th className="p-3 text-left">Counter</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t">

              <td className="p-3">{item.barcode}</td>
              <td className="p-3">{item.item}</td>
              <td className="p-3">{item.category}</td>
              <td className="p-3">{item.product}</td>
              <td className="p-3">{item.purity}</td>
              <td className="p-3">{item.grossWt}</td>
              <td className="p-3">{item.netWt}</td>
              <td className="p-3">{item.counter}</td>

              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    item.status === "Available"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {item.status}
                </span>
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}