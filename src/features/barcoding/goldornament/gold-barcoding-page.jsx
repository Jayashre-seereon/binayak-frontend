import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import BarcodeTable from "./gold-barcoding-table";
import BarcodeForm from "./gold-barcoding-form";

import {
  getBarcodes,
  addBarcode,
  deleteBarcode,
} from "./gold-barcoding-api";

export default function BarcodingPage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    setData(await getBarcodes());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    await addBarcode(formData);
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Barcoding</h1>
        <Button onClick={() => setOpen(true)}>Add Barcode</Button>
      </div>

      <BarcodeTable
        data={data}
        onDelete={async (id) => {
          await deleteBarcode(id);
          loadData();
        }}
      />

      <BarcodeForm open={open} setOpen={setOpen} onSave={handleSave} />
    </div>
  );
}