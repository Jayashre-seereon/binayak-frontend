import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ItemStatusPage() {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!barcode) return;

    setLoading(true);
    setSearched(true);

    const mod = await import("./item-status-api");
    const result = await mod.getItemStatus(barcode);

    setItem(result);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Item Status
      </h1>

      {/* SEARCH BOX */}
      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Enter Barcode (e.g. BC-001)"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="w-72"
        />

        <Button onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* RESULT */}
      {!loading && searched && (
        <>
          {item ? (
            <div className="border rounded p-4 bg-white w-96 space-y-2">

              <p><strong>Item:</strong> {item.item}</p>
              <p><strong>Barcode:</strong> {item.barcode}</p>
              <p><strong>Status:</strong> {item.status}</p>
              <p><strong>Counter:</strong> {item.counter}</p>
              <p><strong>Price:</strong> ₹{item.price}</p>
              <p><strong>Last Updated:</strong> {item.lastUpdated}</p>

            </div>
          ) : (
            <p className="text-red-500">
              No item found for this barcode
            </p>
          )}
        </>
      )}
    </div>
  );
}