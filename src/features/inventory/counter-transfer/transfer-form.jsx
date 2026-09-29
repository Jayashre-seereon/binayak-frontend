import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInventories, getStores } from "./transfer-api";

const emptyForm = {
  inventoryIds: [],
  toStoreId: "",
  narration: "",
};

const statusClass = {
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  PENDING: "bg-amber-100 text-amber-800",
  RECEIVED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

export default function TransferForm({ open, setOpen, onSave, defaultValues }) {
  const isEditMode = Boolean(defaultValues);
  const [form, setForm] = useState(emptyForm);
  const [inventories, setInventories] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      try {
        const [inventoryList, storeList] = await Promise.all([getInventories(), getStores()]);
        setInventories(inventoryList);
        setStores(storeList);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open]);

  useEffect(() => {
    if (defaultValues) {
      const itemIds = (defaultValues.items || [])
        .map((row) => row.inventoryId ?? row.inventory?.id ?? row.id)
        .filter(Boolean)
        .map(String);
      setForm({
        inventoryIds: itemIds,
        toStoreId: defaultValues.toStoreId ? String(defaultValues.toStoreId) : "",
        narration: defaultValues.narration || "",
      });
      return;
    }

    setForm(emptyForm);
  }, [defaultValues, open]);

  const selectedInventory = useMemo(
    () => inventories.filter((item) => form.inventoryIds.includes(String(item.id))),
    [form.inventoryIds, inventories]
  );

  const selectedStore = useMemo(
    () => stores.find((store) => String(store.id) === String(form.toStoreId)) || null,
    [form.toStoreId, stores]
  );

  const submit = async () => {
    const payload = {
      toStoreId: Number(form.toStoreId),
      inventoryIds: form.inventoryIds.map(Number).filter((value) => !Number.isNaN(value)),
      narration: form.narration,
    };

    await onSave(payload);
  };

  const selectedInventoryCards = selectedInventory.map((inventory) => [
    inventory.id,
    inventory,
  ]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!w-[95vw] !max-w-[1200px] p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{isEditMode ? "Edit Counter Transfer" : "Counter Transfer"}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[80vh] space-y-6 overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Inventory No</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-left text-sm"
                  >
                    <span className={form.inventoryIds.length ? "text-slate-900" : "text-slate-500"}>
                      {form.inventoryIds.length
                        ? `${form.inventoryIds.length} inventory selected`
                        : "Select inventory"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[420px] p-2" align="start">
                  <div className="max-h-72 overflow-y-auto">
                    {inventories.map((inventory) => {
                      const id = String(inventory.id);
                      const checked = form.inventoryIds.includes(id);
                      return (
                        <button
                          key={inventory.id}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              inventoryIds: prev.inventoryIds.includes(id)
                                ? prev.inventoryIds.filter((item) => item !== id)
                                : [...prev.inventoryIds, id],
                            }));
                          }}
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded border ${
                              checked ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
                            }`}
                          >
                            {checked ? <Check className="h-3 w-3" /> : null}
                          </span>
                          <span className="flex-1">
                            {inventory.inventoryCode || inventory.barcodeNo || `#${inventory.id}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
              <p className="mt-2 text-xs text-slate-500">Choose one or more inventory numbers from the dropdown.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">To Store</label>
              <Select
                value={form.toStoreId}
                onValueChange={(value) => setForm((prev) => ({ ...prev, toStoreId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading stores..." : "Select store"} />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={String(store.id)}>
                      {store.storeName || store.name || `Store #${store.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Store</label>
              <Input value={selectedStore?.storeName || selectedStore?.name || "-"} disabled readOnly />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Narration</label>
            <Input
              value={form.narration}
              onChange={(e) => setForm((prev) => ({ ...prev, narration: e.target.value }))}
              placeholder="Enter narration"
            />
          </div>

          <div className="space-y-4 rounded-xl border bg-slate-50 p-4">
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Selected Inventory Details
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {selectedInventoryCards.length ? (
                selectedInventoryCards.map(([id, inventory]) => (
                  <div key={id} className="rounded-lg border bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="font-semibold">{inventory.inventoryCode || inventory.barcodeNo || `#${inventory.id}`}</div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass[inventory.status] || "bg-slate-100 text-slate-800"}`}>
                        {inventory.status || "UNKNOWN"}
                      </span>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <Row label="Barcode No" value={inventory.barcodeNo} />
                      <Row label="Tag No" value={inventory.tagNo} />
                      <Row label="HUID No" value={inventory.huidNo} />
                      <Row label="Product" value={inventory.product?.name} />
                      <Row label="Item" value={inventory.item?.name} />
                      <Row label="Metal" value={inventory.metal?.name} />
                      <Row label="Weight" value={inventory.netWeight} />
                      <Row label="Purity" value={inventory.purity} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">Select one or more inventories to view details.</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!form.inventoryIds.length || !form.toStoreId}>
            {isEditMode ? "Update" : "Transfer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed pb-1">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value === null || value === undefined || value === "" ? "-" : String(value)}</span>
    </div>
  );
}
