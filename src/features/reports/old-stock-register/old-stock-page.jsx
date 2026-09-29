import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import OldStockTable from "./old-stock-table";
import { getOldStockReport } from "./old-stock-api";

export default function OldStockPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    category: "All",
    search: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getOldStockReport();
    setData(res);
    setFiltered(res);
  };

  const applyFilter = () => {
    let result = [...data];

    if (filters.from) {
      result = result.filter((d) => d.date >= filters.from);
    }

    if (filters.to) {
      result = result.filter((d) => d.date <= filters.to);
    }

    if (filters.category !== "All") {
      result = result.filter(
        (d) => d.category === filters.category
      );
    }

    if (filters.search) {
      result = result.filter(
        (d) =>
          d.supplier
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          d.voucher
            .toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    setFiltered(result);
  };

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Old Stock Register</h1>
        <Button variant="outline">Export</Button>
      </div>

      {/* FILTER */}
      <div className="bg-white border rounded p-4 grid grid-cols-4 gap-4">

        <div>
          <label className="text-xs">From Date</label>
          <Input
            type="date"
            onChange={(e) =>
              setFilters({ ...filters, from: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-xs">To Date</label>
          <Input
            type="date"
            onChange={(e) =>
              setFilters({ ...filters, to: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-xs">Category</label>
          <select
            className="w-full border h-7 rounded mt-1 px-2"
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <option>All</option>
            <option>Gold</option>
            <option>Silver</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button className="w-full" onClick={applyFilter}>
            Apply Filter
          </Button>
        </div>

      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-4 mt-4">
        <Input
          placeholder="Search supplier or voucher..."
          className="w-80"
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
        />
        <span className="text-sm text-gray-500">
          {filtered.length} records
        </span>
      </div>

      {/* TABLE */}
      <OldStockTable  data={filtered} />
    </div>
  );
}