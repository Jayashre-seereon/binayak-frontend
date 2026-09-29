import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import StockTable from "./stock-summary-table";

export default function StockSummaryPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    category: "All",
    product: "All",
    purity: "All",
    item: "All",
    status: "All",
  });

  // FETCH DATA
  useEffect(() => {
    import("./stock-summary-api").then(async (mod) => {
      setData(await mod.getStockSummary());
    });
  }, []);

  // FILTER LOGIC
  const filteredData = data.filter((d) => {
    return (
      (filters.category === "All" || d.category === filters.category) &&
      (filters.product === "All" || d.product === filters.product) &&
      (filters.purity === "All" || d.purity === filters.purity) &&
      (filters.status === "All" || d.status === filters.status) &&
      (filters.item === "All" || d.item === filters.item) &&
      (
        d.item.toLowerCase().includes(search.toLowerCase()) ||
        d.barcode.toLowerCase().includes(search.toLowerCase())
      )
    );
  });

  // FILTER CONFIG
  const filterFields = [
    { key: "category", label: "Category" },
    { key: "product", label: "Product" },
    { key: "purity", label: "Purity" },
    { key: "item", label: "Item" },
    { key: "status", label: "Status" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Item Wise Stock Summary
      </h1>

      {/* FILTERS */}
      <div className="grid grid-cols-5 gap-4 bg-white border p-4 rounded mb-4">
        {filterFields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1">
            
            {/* LABEL */}
            <label className="text-sm font-medium text-gray-600">
              {f.label}
            </label>

            {/* SELECT */}
            <select
              className="border h-10 rounded px-2"
              value={filters[f.key]}
              onChange={(e) =>
                setFilters({ ...filters, [f.key]: e.target.value })
              }
            >
              <option value="All">All</option>
              <option value={`${f.label} 1`}>{f.label} 1</option>
              <option value={`${f.label} 2`}>{f.label} 2</option>
            </select>

          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="flex justify-between items-center mb-3">
        <Input
          placeholder="Search by item or barcode..."
          className="w-72"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span className="text-sm text-gray-500">
          {filteredData.length} records
        </span>
      </div>

      {/* TABLE */}
      <StockTable data={filteredData} />
    </div>
  );
}