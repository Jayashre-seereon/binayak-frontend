import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import Table from "./branded-barcoding-table";
import Form from "./branded-barcoding-form";

import {
  getBrandedBarcodes,
  addBrandedBarcode,
  deleteBrandedBarcode,
} from "./branded-barcoding-api";

export default function BrandedBarcodingPage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    setData(await getBrandedBarcodes());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    await addBrandedBarcode(formData);
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">
          Branded Ornament Barcoding
        </h1>
        <Button onClick={() => setOpen(true)}>Add Barcode</Button>
      </div>

      <Table
        data={data}
        onDelete={async (id) => {
          await deleteBrandedBarcode(id);
          loadData();
        }}
      />

      <Form open={open} setOpen={setOpen} onSave={handleSave} />
    </div>
  );
}