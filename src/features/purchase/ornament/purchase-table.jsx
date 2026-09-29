import { Trash } from "lucide-react";

export default function PurchaseTable({ data, onDelete }) {
  return (
    <div className="bg-white border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Voucher</th>
            <th className="p-3 text-left">Party</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Total</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-3">{p.voucher}</td>
              <td className="p-3">{p.party}</td>
              <td className="p-3">{p.date}</td>
              <td className="p-3">₹{p.total}</td>

              <td className="p-3">
                <Trash
                  size={16}
                  className="text-red-500 cursor-pointer"
                  onClick={() => onDelete(p.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}