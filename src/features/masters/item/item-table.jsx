import { Pencil, Trash } from "lucide-react";

const getLabel = (value) => {
  if (value == null) return "-";
  if (typeof value === "string" || typeof value === "number") return value;
  if (typeof value === "object") {
    return (
      value.name ||
      value.description ||
      value.id ||
      "-"
    );
  }
  return "-";
};

export default function ItemTable({ data, onEdit, onDelete }) {
  const getImageSrc = (item) => {
    const src = item?.imageUrl || item?.image || item?.photo || "";
    if (!src) return "";
    if (/^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:")) {
      return src;
    }
    return src.startsWith("/") ? src : `/${src}`;
  };

  return (
    <div className="bg-white rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Item Name</th>
            <th className="p-3 text-left">Reference Image</th>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Metal</th>
            <th className="p-3 text-left">Design</th>
            <th className="p-3 text-left">Purity</th>
            <th className="p-3 text-left">Grade</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
        {data.map((item, index) => (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{index + 1}</td>
              <td className="p-3 font-medium">{getLabel(item.name)}</td>
              <td className="p-3">
                {getImageSrc(item) ? (
                  <img
                    src={getImageSrc(item)}
                    alt={item.name || "Item"}
                    className="h-12 w-12 rounded border object-cover"
                  />
                ) : (
                  "-"
                )}
              </td>
              <td className="p-3">{getLabel(item.product?.name || item.product)}</td>
              <td className="p-3">{getLabel(item.product?.category?.name || "-")}</td>
              <td className="p-3">{getLabel(item.product?.metal?.name || "-")}</td>
              <td className="p-3">{getLabel(item.design?.name || item.design)}</td>
              <td className="p-3">
                {item.purity?.name || item.product?.purity?.name ? (
                  <span className="bg-amber-50 text-amber-800 text-xs px-2 py-0.5 rounded font-medium border border-amber-200">
                    {item.purity?.name || item.product?.purity?.name}
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-3">
                {item.product?.grade?.name ? (
                  <span className="bg-emerald-50 text-emerald-800 text-xs px-2 py-0.5 rounded font-medium border border-emerald-200">
                    {item.product.grade.name}
                    {item.product.grade.percentage ? ` (${item.product.grade.percentage}%)` : ""}
                  </span>
                ) : (
                  "-"
                )}
              </td>

              <td className="p-3">
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Pencil
                      size={16}
                      className="text-blue-500"
                      onClick={() => onEdit(item)}
                    />
                  </button>

                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Trash
                      size={16}
                      className="text-red-500"
                     onClick={() => onDelete(item)}
                    />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
