import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import Table from "./mrp-barcoding-table";
import Form from "./mrp-barcoding-form";

import {
  getMrpBarcodes,
  addMrpBarcode,
  deleteMrpBarcode,
} from "./mrp-barcoding-api";

export default function MrpBarcodingPage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    setData(await getMrpBarcodes());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    await addMrpBarcode(formData);
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">MRP Barcoding</h1>
        <Button onClick={() => setOpen(true)}>Add Barcode</Button>
      </div>

      <Table
        data={data}
        onDelete={async (id) => {
          await deleteMrpBarcode(id);
          loadData();
        }}
      />

      <Form open={open} setOpen={setOpen} onSave={handleSave} />
    </div>
  );
}