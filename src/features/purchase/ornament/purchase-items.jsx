import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emptyItem = () => ({
  hsnCode: "711319",
  huidNo: "",
  grossWt: 0,
  stoneWt: 0,
  netWt: 0,
  purity: "",
  pureWt: 0,
  pcs: 1,
  metalCost: 0,
  stoneCost: 0,
  other: 0,
});

export default function PurchaseItems({ items, setItems }) {
  const addRow = () => {
    setItems([...items, emptyItem()]);
  };

  const update = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // auto calc
    updated[index].netWt =
      Number(updated[index].grossWt || 0) - Number(updated[index].stoneWt || 0);

    setItems(updated);
  };

  const removeRow = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="flex justify-between p-3 border-b">
        <h2 className="font-semibold">Items</h2>
        <Button onClick={addRow}>+ Add Row</Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2">HSN/SAC</th>
              <th className="p-2">HUID No.</th>
              <th className="p-2">Gross Wt</th>
              <th className="p-2">Stone Wt</th>
              <th className="p-2">Net Wt</th>
              <th className="p-2">Purity</th>
              <th className="p-2">Pure Wt</th>
              <th className="p-2">Pcs</th>
              <th className="p-2">Metal Cost</th>
              <th className="p-2">Stone Cost</th>
              <th className="p-2">Other</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {items.map((row, i) => (
              <tr key={i} className="border-t">
                <td><Input value={row.hsnCode || "711319"} onChange={(e) => update(i, "hsnCode", e.target.value)} /></td>
                <td><Input value={row.huidNo || ""} placeholder="HUID" onChange={(e) => update(i, "huidNo", e.target.value)} /></td>
                <td><Input onChange={(e) => update(i, "grossWt", e.target.value)} /></td>
                <td><Input onChange={(e) => update(i, "stoneWt", e.target.value)} /></td>
                <td className="text-center">{row.netWt}</td>
                <td><Input onChange={(e) => update(i, "purity", e.target.value)} /></td>
                <td>{row.pureWt}</td>
                <td><Input defaultValue={1} onChange={(e) => update(i, "pcs", e.target.value)} /></td>
                <td><Input onChange={(e) => update(i, "metalCost", e.target.value)} /></td>
                <td><Input onChange={(e) => update(i, "stoneCost", e.target.value)} /></td>
                <td><Input onChange={(e) => update(i, "other", e.target.value)} /></td>
                <td>
                  <button onClick={() => removeRow(i)} className="text-red-500">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}