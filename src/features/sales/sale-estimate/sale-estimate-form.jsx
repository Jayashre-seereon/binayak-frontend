import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";

export default function SalesForm({ open, setOpen, onSave, defaultValues }) {

  const [form, setForm] = useState({
    party: "",
    date: "",
    voucher: "SL-001",
  });

  const [items, setItems] = useState([]);

  // LOAD EDIT DATA
  useEffect(() => {
    if (defaultValues) {
      setForm(defaultValues);
      setItems(defaultValues.items || []);
    }
  }, [defaultValues]);

  const addRow = () => {
    setItems([
      ...items,
      { product: "", item: "", purity: "", grossWt: 0, rate: 0, amount: 0 },
    ]);
  };

  const deleteRow = (i) => {
    setItems(items.filter((_, index) => index !== i));
  };

  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;

    updated[i].amount =
      Number(updated[i].grossWt || 0) *
      Number(updated[i].rate || 0);

    setItems(updated);
  };

  const total = items.reduce(
    (sum, i) => sum + Number(i.amount || 0),
    0
  );

  const submit = () => {
    onSave({ ...form, items, total });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!w-[95vw] !max-w-[1300px] h-[90vh] p-0">

        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Sales Entry</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto h-[calc(90vh-130px)]">

          {/* HEADER */}
          <div className="grid grid-cols-3 gap-4 border p-4 rounded">

            <Input placeholder="Party" />
            <Input type="date" />
            <Input value={form.voucher} readOnly />

          </div>

          {/* ITEMS */}
          <div className="border rounded">

            <div className="flex justify-between p-3 border-b">
              <h2>Items</h2>
              <Button onClick={addRow}>+ Add Row</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1000px] text-sm">

                <thead className="bg-gray-50">
                  <tr>
                    <th>Product</th>
                    <th>Item</th>
                    <th>Purity</th>
                    <th>Gross Wt</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((row, i) => (
                    <tr key={i} className="border-t">

                      <td>
                        <Input
                          value={row.product}
                          onChange={(e) => updateItem(i, "product", e.target.value)}
                        />
                      </td>
                      <td>
                        <Input
                          value={row.item}
                          onChange={(e) => updateItem(i, "item", e.target.value)}
                        />
                      </td>
                      <td>
                        <Input
                          value={row.purity}
                          placeholder="e.g. 22K (916)"
                          onChange={(e) => updateItem(i, "purity", e.target.value)}
                        />
                      </td>

                      <td>
                        <Input onChange={(e)=>updateItem(i,"grossWt",e.target.value)} />
                      </td>

                      <td>
                        <Input onChange={(e)=>updateItem(i,"rate",e.target.value)} />
                      </td>

                      <td>{row.amount}</td>

                      <td>
                        <Trash
                          size={16}
                          className="text-red-500 cursor-pointer"
                          onClick={() => deleteRow(i)}
                        />
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>

          {/* TOTAL */}
          <div className="flex justify-end">
            <div className="border p-4 w-60">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save</Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}