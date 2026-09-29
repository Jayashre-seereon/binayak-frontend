import { Pencil, Eye, Trash } from "lucide-react";

export default function SalesTable({ data, onEdit, onDelete }) {
  return (
    <div className="bg-white border rounded">

      <table className="w-full text-sm">

        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Voucher</th>
            <th className="p-3 text-left">Party</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Items</th>
            <th className="p-3 text-left">Total</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((s) => (
            <tr key={s.id} className="border-t">

              <td className="p-3">{s.voucher}</td>
              <td className="p-3">{s.party}</td>
              <td className="p-3">{s.date}</td>
              <td className="p-3">{s.items?.length}</td>
              <td className="p-3">{s.total || 0}</td>

              <td className="p-3 flex gap-3">

                {/* VIEW */}
                <Eye className="text-gray-500 cursor-pointer" size={16} />

                {/* EDIT */}
                <Pencil
                  className="text-blue-500 cursor-pointer"
                  size={16}
                  onClick={() => onEdit(s)}
                />

                {/* DELETE */}
                <Trash
                  className="text-red-500 cursor-pointer"
                  size={16}
                  onClick={() => onDelete(s.id)}
                />

              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}