import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "lucide-react";

export default function VoucherForm({ open, setOpen, onSave, title }) {

  const [form, setForm] = useState({
    voucher: "JV-001",
    date: "",
    narration: "",
  });

  const [entries, setEntries] = useState([
    { ledger: "", debit: 0, credit: 0, narration: "" },
  ]);

  const addRow = () => {
    setEntries([
      ...entries,
      { ledger: "", debit: 0, credit: 0, narration: "" },
    ]);
  };

  const deleteRow = (i) => {
    setEntries(entries.filter((_, index) => index !== i));
  };

  const updateEntry = (i, field, value) => {
    const updated = [...entries];
    updated[i][field] = value;
    setEntries(updated);
  };

  const totalDebit = entries.reduce(
    (sum, e) => sum + Number(e.debit || 0),
    0
  );

  const totalCredit = entries.reduce(
    (sum, e) => sum + Number(e.credit || 0),
    0
  );

  const submit = () => {
    onSave({ ...form, entries, totalDebit, totalCredit });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!w-[95vw] !max-w-[1100px] p-0">

        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">

          {/* HEADER */}
          <div className="grid grid-cols-2 gap-4 border p-4 rounded">

            <div>
              <label className="text-xs">Voucher No.</label>
              <Input value={form.voucher} readOnly />
            </div>

            <div>
              <label className="text-xs">Date</label>
              <Input type="date" />
            </div>

          </div>

          {/* ENTRIES */}
          <div className="border rounded">

            <div className="flex justify-between p-3 border-b">
              <h2>Entries</h2>
              <Button onClick={addRow}>+ Add</Button>
            </div>

            <table className="w-full text-sm">

              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Ledger</th>
                  <th className="text-left p-3">Debit (₹)</th>
                  <th className="text-left p-3">Credit (₹)</th>
                  <th className="text-left p-3">Narration</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {entries.map((row, i) => (
                  <tr key={i} className="border-t">

                    <td className="p-2">
                      <select
                        className="w-full border rounded h-9"
                        onChange={(e)=>updateEntry(i,"ledger",e.target.value)}
                      >
                        <option>Select</option>
                        <option>Cash</option>
                        <option>Bank</option>
                        <option>Sales</option>
                      </select>
                    </td>

                    <td className="p-2">
                      <Input
                        onChange={(e)=>updateEntry(i,"debit",e.target.value)}
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        onChange={(e)=>updateEntry(i,"credit",e.target.value)}
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        onChange={(e)=>updateEntry(i,"narration",e.target.value)}
                      />
                    </td>

                    <td className="p-2">
                      <Trash
                        size={16}
                        className="text-red-500 cursor-pointer"
                        onClick={() => deleteRow(i)}
                      />
                    </td>

                  </tr>
                ))}
              </tbody>

              {/* TOTAL */}
              <tfoot>
                <tr className="border-t font-semibold">
                  <td className="p-3">Total</td>
                  <td className="p-3">₹{totalDebit}</td>
                  <td className="p-3">₹{totalCredit}</td>
                  <td></td>
                </tr>
              </tfoot>

            </table>

          </div>

          {/* NARRATION */}
          <div className="border p-4 rounded">
            <label className="text-xs">Narration</label>
            <Textarea />
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