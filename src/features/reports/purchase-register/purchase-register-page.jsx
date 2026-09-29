import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import PurchaseRegisterTable from "./purchase-register-table";
import { getPurchaseRegisterReport } from "./purchase-register-api";
export default function PurchaeRegisterPage() {
    const [data, setData] = useState([]);
    const [filtered, setFiltered] = useState([]);

    const [filters, setFilters] = useState({    
        from: "",
        to: "",
        party: "All",
        search: "",
    });
    useEffect(() => {
        loadData();
    }, []);


    const loadData = async () => {
        const res = await getPurchaseRegisterReport();
        setData(res);
    };

      const applyFilter = () => {
    let result = [...data];

    // DATE FILTER
    if (filters.from) {
      result = result.filter((d) => d.date >= filters.from);
    }

    if (filters.to) {
      result = result.filter((d) => d.date <= filters.to);
    }

    // PARTY FILTER
    if (filters.party !== "All") {
      result = result.filter(
        (d) => d.party === filters.party
      );
    }

    // SEARCH FILTER
    if (filters.search) {
      result = result.filter(
        (d) =>
          d.customer
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
            <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Purchase Register</h1>
        <Button variant="outline">Export</Button>
      </div>
            {/* FILTER BOX */}
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
          <label className="text-xs">Party</label>
          <select
            className="w-full border h-7  rounded mt-1 px-2"
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <option>All</option>
            <option>XYZ Distributors</option>
            <option>ABC Suppliers</option>
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
          placeholder="Search..."
          className="w-80"
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
        />
        <span className="text-sm text-gray-500">
          {filtered.length} records
        </span>
      </div>
            <PurchaseRegisterTable data={data} />
        </div>
    );
}