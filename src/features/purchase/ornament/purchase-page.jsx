import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import PurchaseTable from "./purchase-table";
import PurchaseForm from "./purchase-form";

import {
  getPurchases,
  addPurchase,
  deletePurchase,
} from "./purchase-api";

export default function PurchasePage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    setData(await getPurchases());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    await addPurchase(formData);
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Ornament Purchase</h1>
        <Button onClick={() => setOpen(true)}>Add Purchase</Button>
      </div>

      <PurchaseTable
        data={data}
        onDelete={async (id) => {
          await deletePurchase(id);
          loadData();
        }}
      />

      <PurchaseForm open={open} setOpen={setOpen} onSave={handleSave} />
    </div>
  );
}