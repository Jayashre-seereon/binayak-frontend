import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// import OldPurchaseTable from "./old-purchase-table";
// import OldPurchaseForm from "./old-purchase-form";
import BullionPurchaseTable from "./bullion-purchase-table";
import BullionPurchaseForm from "./bullion-purchase-form";
import {
  getbullionPurchases,
  addbullionPurchase,
  deletebullionPurchase,
  updatebullionPurchase,
} from "./bullion-purchase-api";

export default function BullionPurchasePage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    setData(await getbullionPurchases());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    await addbullionPurchase(formData);
    loadData();
  };

  const handleUpdate = async (formData) => {
    await updatebullionPurchase(formData);
    loadData();
    setOpen(true);
  };


  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Bullion Purchase</h1>
        <Button onClick={() => setOpen(true)}>Add Bullion</Button>
      </div>

      <BullionPurchaseTable
        data={data}
        onDelete={async (id) => {
          await deletebullionPurchase(id);
          loadData();
        }}
        onUpdate={handleUpdate}

      />

      <BullionPurchaseForm open={open} setOpen={setOpen} onSave={handleSave} />
    </div>
  );
}