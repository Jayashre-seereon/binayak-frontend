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

export default function MrpForm({ open, setOpen, onSave }) {
  const [form, setForm] = useState({
    refVoucher: "",
    party: "",
    product: "",
    packCode: "",
    barcode: "",
    item: "",
    pcs: 1,
    grossWt: 0,
  });

  const [items, setItems] = useState([]);

  // ✅ AUTO ADD FIRST ROW
  useEffect(() => {
    if (open && items.length === 0) {
      setItems([
        {
          item: "",
          design: "",
          purity: "",
          grade: "",
          grossWt: 0,
          stoneWt: 0,
          netWt: 0,
          pureWt: 0,
          making: 0,
          stone: 0,
          other: 0,
          size: "",
          pcs: 1,
          narration: "",
        },
      ]);
    }
  }, [open]);

  const addRow = () => {
    setItems([
      ...items,
      {
        item: "",
        design: "",
        purity: "",
        grade: "",
        grossWt: 0,
        stoneWt: 0,
        netWt: 0,
        pureWt: 0,
        making: 0,
        stone: 0,
        other: 0,
        size: "",
        pcs: 1,
        narration: "",
      },
    ]);
  };

  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;

    updated[i].netWt =
      Number(updated[i].grossWt || 0) -
      Number(updated[i].stoneWt || 0);

    updated[i].pureWt = updated[i].netWt * 0.916;

    setItems(updated);
  };

  const submit = () => {
    onSave({ ...form, items });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!w-[95vw] !max-w-[1300px] h-[90vh] p-0 overflow-hidden">

        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>MRP Barcoding</DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <div className="p-6 overflow-y-auto h-[calc(90vh-130px)] space-y-6">

          {/* SECTION 1 WITH LABELS */}
          <div className="grid grid-cols-4 gap-4 border p-4 rounded">

            <div>
              <label className="text-xs">Ref Voucher</label>
              <Input className="mt-1 h-9" />
            </div>

            <div>
              <label className="text-xs">Party</label>
              <Input className="mt-1 h-9" />
            </div>

            <div>
              <label className="text-xs">Product</label>
              <Input className="mt-1 h-9" />
            </div>

            <div>
              <label className="text-xs">Pack Code</label>
              <Input className="mt-1 h-9" />
            </div>

            <div>
              <label className="text-xs">Barcode</label>
              <Input className="mt-1 h-9" />
            </div>

            <div>
              <label className="text-xs">Item</label>
              <Input className="mt-1 h-9" />
            </div>

            <div>
              <label className="text-xs">Pcs</label>
              <Input className="mt-1 h-9" />
            </div>

            <div>
              <label className="text-xs">Gross Wt</label>
              <Input className="mt-1 h-9" />
            </div>
                <div>
              <label className="text-xs">Brand</label>
              <Input className="mt-1 h-9" />
            </div>
            <div>
              <label className="text-xs">MRP Value</label>
              <Input className="mt-1 h-9" />
            </div>
            <div>
              <label className="text-xs">Purchase Amount</label>
              <Input className="mt-1 h-9" />
            </div>
          </div>

          {/* ITEMS */}
          <div className="border rounded">

            <div className="flex justify-between p-3 border-b">
              <h2>Items</h2>
              <Button onClick={addRow}>+ Add Row</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1300px] text-sm border-separate border-spacing-y-2">

                <thead className="bg-gray-50">
                  <tr className="">
                    <th>Item</th>
                    <th>Design</th>
                    <th>Purity</th>
                    <th>Grade</th>
                    <th>Gross</th>
                    <th>Stone</th>
                    <th>Net</th>
                    <th>Pure</th>
                    <th>Making</th>
                    <th>Stone</th>
                    <th>Other</th>
                    <th>Size</th>
                    <th>Pcs</th>
                    <th>Note</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody className="">
                  {items.map((row, i) => (
                    <tr key={i} className="border-t">

                      <td><Input className="h-8 w-28" /></td>
                      <td><Input className="h-8 w-28" /></td>
                      <td><Input className="h-8 w-20" /></td>
                      <td><Input className="h-8 w-20" /></td>

                      <td>
                        <Input className="h-8 w-20" onChange={(e)=>updateItem(i,"grossWt",e.target.value)} />
                      </td>

                      <td>
                        <Input className="h-8 w-20" onChange={(e)=>updateItem(i,"stoneWt",e.target.value)} />
                      </td>

                      <td>{row.netWt}</td>
                      <td>{row.pureWt}</td>

                      <td><Input className="h-8 w-20" /></td>
                      <td><Input className="h-8 w-20" /></td>
                      <td><Input className="h-8 w-20" /></td>

                      <td><Input className="h-8 w-20" /></td>
                      <td><Input className="h-8 w-16" /></td>
                      <td><Input className="h-8 w-32" /></td>

                      <td>
                        <Trash
                          size={16}
                          className="text-red-500 cursor-pointer"
                          onClick={() => {
                            setItems(items.filter((_, index) => index !== i));
                          }}
                        />
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-white">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save</Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}