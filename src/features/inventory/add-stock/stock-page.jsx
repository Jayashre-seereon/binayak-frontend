import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notifyError, notifySuccess } from "@/utils/notify";
import DeleteModal from "@/utils/DeleteModal";

import StockTable from "./stock-table";
import StockForm from "./stock-form";
import {
  createStock,
  deleteStock,
  getStock,
  getStockById,
  getStockLabelPdf,
  updateStock,
  updateStockStatus,
  getStockLabelsBulkPdf
} from "../../../api/stock-api";
import { getPurchases } from "@/api/purchase-api";

export default function StockPage() {
  const [data, setData] = useState([]);
  const [purchaseOptions, setPurchaseOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const ITEMS_PER_PAGE = 10;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const loadData = async (page = currentPage, searchValue = search) => {
    setLoading(true);
    try {
      const [stockResult, purchases] = await Promise.all([
        getStock({ page, limit: ITEMS_PER_PAGE, search: searchValue }),
        getPurchases(),
      ]);
      const validPurchases = (Array.isArray(purchases) ? purchases : []).filter(
        (p) => p.purchaseType === "ORNAMENT" || p.purchaseType === "BULLION"
      );
      setData(stockResult.inventories);
      setPagination(stockResult.pagination || { total: 0, totalPages: 1 });
      setPurchaseOptions(validPurchases);
    } catch (error) {
      notifyError(error, "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (payload) => {
    try {
      if (editData) {
        await updateStock(editData.id, payload);
        notifySuccess("Inventory updated successfully.");
      } else {
        await createStock(payload.purchaseItemId);
        notifySuccess("Inventory created successfully.");
      }
      setOpen(false);
      setEditData(null);
      await loadData();
    } catch (error) {
      notifyError(error, "Failed to save inventory.");
    }
  };

  const handleEdit = async (row) => {
    try {
      const inventory = await getStockById(row.id);
      setEditData(inventory || row);
      setOpen(true);
    } catch (error) {
      notifyError(error, "Failed to load inventory.");
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStock(deleteId);
      notifySuccess("Inventory deleted successfully.");
      setDeleteOpen(false);
      setDeleteId(null);
      await loadData();
    } catch (error) {
      notifyError(error, "Failed to delete inventory.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateStockStatus(id, status);
      notifySuccess("Inventory status updated.");
      await loadData();
    } catch (error) {
      notifyError(error, "Failed to update inventory status.");
    }
  };

  const handlePrintLabel = async (row) => {
    try {
      const pdfBlob = await getStockLabelPdf(row.id);
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 10000);
    } catch (error) {
      notifyError(error, "Failed to generate inventory label.");
    }
  };

const handleToggleSelect = (id) => {
  setSelectedIds((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
};

const handleToggleSelectAll = (checked) => {
  setSelectedIds(checked ? data.map((row) => row.id) : []);
};
const handleBulkPrintLabels = async () => {
  if (!selectedIds.length) {
    notifyError(null, "Select at least one inventory item first.");
    return;
  }
  try {
    const pdfBlob = await getStockLabelsBulkPdf(selectedIds);
    const pdfUrl = window.URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 10000);
  } catch (error) {
    notifyError(error, "Failed to generate bulk inventory labels.");
  }
};
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventory</h1>
         
        </div>
       <div className="flex gap-2">
  <Button
    variant="outline"
    onClick={handleBulkPrintLabels}
    disabled={!selectedIds.length}
  >
    Print Barcode ({selectedIds.length})
  </Button>
  <Button
    onClick={() => {
      setEditData(null);
      setOpen(true);
    }}
  >
    Add Inventory
  </Button>
</div>
        
      </div>

      <div className="mb-3 flex justify-between">
        <Input
          value={search}
          onChange={(e) => { const value = e.target.value; setSearch(value); setCurrentPage(1); loadData(1, value); }}
          placeholder="Search inventory ..."
            className="w-64"
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading inventory...</p>
      ) : (
        <StockTable
  data={data}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onStatusChange={handleStatusChange}
  onPrintLabel={handlePrintLabel}
  selectedIds={selectedIds}
  onToggleSelect={handleToggleSelect}
  onToggleSelectAll={handleToggleSelectAll}
/>
      )}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span>Showing {data.length} of {pagination.total || 0} inventory records</span>
        <div className="flex items-center gap-2"><Button variant="outline" disabled={currentPage <= 1 || loading} onClick={() => { const page = currentPage - 1; setCurrentPage(page); loadData(page); }}>Previous</Button><span>Page {currentPage} of {pagination.totalPages || 1}</span><Button variant="outline" disabled={currentPage >= (pagination.totalPages || 1) || loading} onClick={() => { const page = currentPage + 1; setCurrentPage(page); loadData(page); }}>Next</Button></div>
      </div>

      <StockForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
        purchaseOptions={purchaseOptions}
      />

      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Inventory"
        description="Are you sure you want to delete this inventory record?"
      />
    </div>
  );
}
