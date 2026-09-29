import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Barcode } from "lucide-react";

const emptyForm = {
  storeName: "",
  tagNo: "",
  metalPurity: "",
  weight: "",
  huidNo: "",
  barcode: "",
};

export default function BarcodeForm({ open, setOpen, onSave }) {
  const [form, setForm] = useState(emptyForm);

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = () => {
    onSave({
      ...form,
      barcode: String(form.barcode ?? "").trim(),
    });
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setForm(emptyForm);
      }}
    >
      <DialogContent className="!w-[95vw] !max-w-[760px] p-0 overflow-hidden">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Jewellery Barcode Label</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 bg-slate-50 px-6 py-6">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b pb-3">
              <Barcode size={16} className="text-gray-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                Label Details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-gray-600">Store Name</label>
                <Input
                  className="mt-1 h-9"
                  value={form.storeName}
                  onChange={(e) => updateForm("storeName", e.target.value)}
                  placeholder="Store Name"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Tag No</label>
                <Input
                  className="mt-1 h-9"
                  value={form.tagNo}
                  onChange={(e) => updateForm("tagNo", e.target.value)}
                  placeholder="Tag No"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Metal &amp; Purity</label>
                <Input
                  className="mt-1 h-9"
                  value={form.metalPurity}
                  onChange={(e) => updateForm("metalPurity", e.target.value)}
                  placeholder="Gold 22K / 916"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Weight</label>
                <Input
                  className="mt-1 h-9"
                  value={form.weight}
                  onChange={(e) => updateForm("weight", e.target.value)}
                  placeholder="0.000"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">HUID</label>
                <Input
                  className="mt-1 h-9"
                  value={form.huidNo}
                  onChange={(e) => updateForm("huidNo", e.target.value)}
                  placeholder="HUID No"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Barcode</label>
                <Input
                  className="mt-1 h-9"
                  type="text"
                  inputMode="numeric"
                  value={form.barcode}
                  onChange={(e) => updateForm("barcode", String(e.target.value))}
                  placeholder="Barcode number"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-dashed bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                Print Preview
              </h2>
              <span className="text-xs text-gray-500">Compact tag layout</span>
            </div>

            <div className="mx-auto max-w-[360px] rounded-lg border border-gray-300 bg-white p-3 text-[11px] leading-tight text-gray-900 shadow-sm">
              <div className="border-b border-gray-200 pb-2 text-center">
                <div className="font-semibold uppercase tracking-wide">
                  {form.storeName || "Store Name"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1 py-2">
                <div>
                  <span className="font-semibold">Tag No:</span> {form.tagNo || "-"}
                </div>
                <div>
                  <span className="font-semibold">Weight:</span> {form.weight || "-"}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Metal &amp; Purity:</span>{" "}
                  {form.metalPurity || "-"}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">HUID:</span> {form.huidNo || "-"}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-2">
                <div className="text-center text-[10px] uppercase tracking-[0.2em] text-gray-500">
                  Barcode
                </div>
                <div className="mt-1 rounded border border-gray-300 bg-gray-50 px-2 py-2 text-center font-mono text-sm font-semibold tracking-[0.18em]">
                  {form.barcode || "000000000000"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t bg-white px-6 py-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
