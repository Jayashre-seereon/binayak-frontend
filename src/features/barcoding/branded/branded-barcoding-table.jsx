import { Trash } from "lucide-react";

export default function BrandedTable({ data, onDelete }) {
  return (
    <div className="bg-white border rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Barcode</th>
            <th className="p-3 text-left">Brand</th>
            <th className="p-3 text-left">Item</th>
            <th className="p-3 text-left">Gross Wt</th>
            <th className="p-3 text-left">Pcs</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="p-3">{b.barcode}</td>
              <td className="p-3">{b.brand}</td>
              <td className="p-3">{b.item}</td>
              <td className="p-3">{b.grossWt}</td>
              <td className="p-3">{b.pcs}</td>

              <td className="p-3">
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