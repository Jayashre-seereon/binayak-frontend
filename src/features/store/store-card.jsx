import { useNavigate } from "react-router-dom";
import { useStoreStore } from "../../store/storeStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { MapPin, Store } from "lucide-react";

export default function StoreCard({ store, onEdit, onDelete, onSelect }) {
  const navigate = useNavigate();
  const setStore = useStoreStore((state) => state.setStore);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const enterStore = () => {
    setStore(store);
    localStorage.setItem("selectedStore", JSON.stringify(store));
    localStorage.setItem("selectedStoreId", String(store.id));
    navigate("/dashboard");
  };

  return (
    <div className="group flex min-h-[190px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg hover:shadow-slate-200/70">
      <div>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Store size={21} />
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">ID {store.id}</span>
        </div>
        <h2 className="text-base font-semibold text-slate-900">{store.storeName || store.name}</h2>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin size={14} className="shrink-0 text-slate-400" />
          {store.location || store.address || "Location not provided"}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={onSelect || enterStore} className="rounded-xl bg-slate-950 px-4 text-white hover:bg-slate-800">
          Open store
        </Button>
        {onEdit ? (
          <Button variant="outline" onClick={() => onEdit(store)} className="rounded-xl border-slate-200">
            Edit
          </Button>
        ) : null}
        {onDelete ? (
          <Button variant="destructive" onClick={() => setConfirmOpen(true)} className="rounded-xl">
            Remove
          </Button>
        ) : null}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Store</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {store.storeName || store.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                onDelete(store);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
