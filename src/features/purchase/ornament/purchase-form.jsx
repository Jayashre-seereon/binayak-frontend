import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function PurchaseForm({ open, setOpen, onSave }) {
  const [form, setForm] = useState({
    party: "",
    address: "",
    voucher: "PO-001",
    date: "",
  });

  const [items, setItems] = useState([]);

  const addRow = () => {
    setItems([
      ...items,
      {
        hsnCode: "711319",
        huidNo: "",
        grossWt: 0,
        stoneWt: 0,
        netWt: 0,
        purity: "",
        pureWt: 0,
        pcs: 1,
        metalRate: 0,
        metalCost: 0,
        stoneCost: 0,
        other: 0,
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

    updated[i].metalCost =
      updated[i].pureWt * Number(updated[i].metalRate || 0);

    setItems(updated);
  };

  const subtotal = items.reduce(
    (sum, i) =>
      sum +
      Number(i.metalCost || 0) +
      Number(i.stoneCost || 0) +
      Number(i.other || 0),
    0
  );

  const igst = subtotal * 0.03;
  const cgst = subtotal * 0.015;
  const sgst = subtotal * 0.015;
  const total = subtotal + igst + cgst + sgst;

  const submit = () => {
    onSave({ ...form, items, total });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!w-[95vw] !max-w-[1200px] h-[90vh] p-0 overflow-hidden">

        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Ornament Purchase
          </DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <div className="p-6 overflow-y-auto h-[calc(90vh-120px)] space-y-6">

          {/* SECTION 1 */}
          <div className="grid grid-cols-3 gap-6 border p-4 rounded">

            {/* Party Dropdown */}
            <div>
              <label className="text-sm w-full">Party Name</label>
              <Select
                onValueChange={(val) =>
                  setForm({ ...form, party: val })
                }
              >
                <SelectTrigger className="h-10 mt-1">
                  <SelectValue placeholder="Select Party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abc">ABC Jewellers</SelectItem>
                  <SelectItem value="xyz">XYZ Traders</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm">Address</label>
              <Input className="h-10 mt-1" />
            </div>

            <div>
              <label className="text-sm">Voucher</label>
              <Input className="h-10 mt-1" value={form.voucher} />
            </div>

            <div>
              <label className="text-sm">Purchase Type</label>
              <Input className="h-10 mt-1" placeholder="Ornament" />
            </div>

            <div>
              <label className="text-sm">Date</label>
              <Input type="date" className="h-10 mt-1" />
            </div>

            <div>
              <label className="text-sm">Upload</label>
              <Input type="file" className="h-10 mt-1" />
            </div>

          </div>

          {/* SECTION 2 */}
          <div className="border rounded">

            <div className="flex justify-between items-center p-3 border-b">
              <h2 className="font-medium">Items</h2>
              <Button onClick={addRow}>+ Add Row</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">HSN/SAC</th>
                    <th className="p-2 text-left">HUID No.</th>
                    <th className="p-2 text-left">Gross</th>
                    <th className="p-2 text-left">Stone</th>
                    <th className="p-2 text-left">Net</th>
                    <th className="p-2 text-left">Purity</th>
                    <th className="p-2 text-left">Rate</th>
                    <th className="p-2 text-left">Metal Cost</th>
                    <th className="p-2 text-left">Stone Rate</th>
                    <th className="p-2 text-left">Other</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">
                        <Input className="h-8" value={row.hsnCode || "711319"} onChange={(e) => updateItem(i, "hsnCode", e.target.value)} />
                      </td>

                      <td className="p-2">
                        <Input className="h-8" value={row.huidNo || ""} placeholder="HUID" onChange={(e) => updateItem(i, "huidNo", e.target.value)} />
                      </td>

                      <td className="p-2">
                        <Input className="h-8" onChange={(e)=>updateItem(i,"grossWt",e.target.value)} />
                      </td>

                      <td className="p-2">
                        <Input className="h-8" onChange={(e)=>updateItem(i,"stoneWt",e.target.value)} />
                      </td>

                      <td className="p-2 text-center">{row.netWt}</td>

                      <td className="p-2 text-center"><Input className="h-8" onChange={(e)=>updateItem(i,"purity",e.target.value)} /></td>

                      <td className="p-2">
                        <Input className="h-8" onChange={(e)=>updateItem(i,"metalRate",e.target.value)} />
                      </td>

                      <td className="p-2 text-center">{row.metalCost}</td>

                      <td className="p-2">
                        <Input className="h-8" onChange={(e)=>updateItem(i,"stoneCost",e.target.value)} />
                      </td>

                      <td className="p-2">
                        <Input className="h-8" onChange={(e)=>updateItem(i,"other",e.target.value)} />
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>

          {/* SECTION 3 */}
          <div className="flex justify-end">
            <div className="border p-4 w-80 space-y-2">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>IGST (3%)</span>
                <span>₹{igst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>CGST (1.5%)</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>SGST (1.5%)</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

            </div>
          </div>
 <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save</Button>
        </div>

        </div>

        {/* FOOTER */}
       
      </DialogContent>
    </Dialog>
  );
}