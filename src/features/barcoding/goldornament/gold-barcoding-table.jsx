import { Pencil, Trash } from "lucide-react";

export default function BarcodeTable({ data, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Store Name</th>
            <th className="p-3 text-left">Tag No</th>
            <th className="p-3 text-left">Metal &amp; Purity</th>
            <th className="p-3 text-left">Weight</th>
            <th className="p-3 text-left">HUID</th>
            <th className="p-3 text-left">Barcode</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="p-3">{b.storeName || "-"}</td>
              <td className="p-3">{b.tagNo || "-"}</td>
              <td className="p-3">{b.metalPurity || "-"}</td>
              <td className="p-3">{b.weight || "-"}</td>
              <td className="p-3">{b.huidNo || "-"}</td>
              <td className="p-3 font-mono text-xs">{String(b.barcode ?? "-")}</td>

              <td className="p-3 flex gap-2">
                <Pencil size={16} className="text-blue-500 cursor-pointer" />
                <Trash
                  size={16}
                  className="text-red-500 cursor-pointer"
                  onClick={() => onDelete(b.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
