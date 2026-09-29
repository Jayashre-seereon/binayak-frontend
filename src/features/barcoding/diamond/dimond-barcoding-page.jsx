import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import Table from "./dimond-barcoding-table";
import Form from "./dimond-barcoding-form";

import {
  getDiamondBarcodes,
  addDiamondBarcode,
  deleteDiamondBarcode,
} from "./dimond-barcoding-api";

export default function DiamondBarcodingPage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    setData(await getDiamondBarcodes());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    await addDiamondBarcode(formData);
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">
          Diamond Ornament Barcoding
        </h1>
        <Button onClick={() => setOpen(true)}>Add Barcode</Button>
      </div>

      <Table
        data={data}
        onDelete={async (id) => {
          await deleteDiamondBarcode(id);
          loadData();
        }}
      />

      <Form open={open} setOpen={setOpen} onSave={handleSave} />
    </div>
  );
}