import { Trash,Pencil } from "lucide-react";

export default function BullionPurchaseTable({ data, onDelete, onUpdate }) {
  return (
    <div className="bg-white border rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Voucher NO</th>
            <th className="p-3 text-left">Party</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Total Amount</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-3">{p.voucher}</td>
              <td className="p-3">{p.party}</td>
              <td className="p-3">{p.date}</td>
              <td className="p-3">₹{p.totalAmount}</td>

              <td className="p-3">
                <div className="flex gap-2">
                <Pencil size={16} className="text-blue-500 cursor-pointer"  onClick={() => onUpdate(p.id)} />
                <Trash
                  size={16}
                  className="text-red-500 cursor-pointer"
                  onClick={() => onDelete(p.id)}
                />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}