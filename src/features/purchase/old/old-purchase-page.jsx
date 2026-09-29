import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeleteModal from "../../../utils/DeleteModal";
import { notifyError, notifySuccess } from "@/utils/notify";

import OldPurchaseTable from "./old-purchase-table";
import OldPurchaseForm from "./old-purchase-form";
import PurchaseInvoicePreviewModal from "./purchase-invoice-preview-modal";

import {
  getOldPurchases,
  getOldPurchaseById,
  addOldPurchase,
  updateOldPurchase,
  deleteOldPurchase,
  getPurchasePdf,
} from "../../../api/old-purchase-api";

export default function OldPurchasePage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [previewPurchase, setPreviewPurchase] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadData = async () => {
    try {
      setData(await getOldPurchases());
    } catch (error) {
      notifyError(error, "Failed to load purchases.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editData) {
        await updateOldPurchase(editData.id, formData);
        notifySuccess("Purchase updated successfully.");
      } else {
        await addOldPurchase(formData);
        notifySuccess("Purchase added successfully.");
      }
      setEditData(null);
      setOpen(false);
      loadData();
    } catch (error) {
      notifyError(error, "Failed to save purchase.");
    }
  };

  const handleEdit = async (item) => {
    try {
      const purchase = await getOldPurchaseById(item.id);
      setEditData(purchase || item);
      setOpen(true);
    } catch (error) {
      notifyError(error, "Failed to load purchase details.");
    }
  };

  const handlePreview = async (item) => {
    try {
      const purchase = await getOldPurchaseById(item.id);
      setPreviewPurchase(purchase || item);
      setPreviewOpen(true);
    } catch (error) {
      setPreviewPurchase(item);
      setPreviewOpen(true);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    const selected = data.find((item) => item.id === id);
    setDeleteName(selected?.invoiceNo || selected?.customerName || `#${id}`);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteOldPurchase(deleteId);
      notifySuccess("Purchase deleted successfully.");
      setDeleteId(null);
      setDeleteName("");
      setDeleteOpen(false);
      loadData();
    } catch (error) {
      notifyError(error, "Failed to delete purchase.");
    }
  };

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;

    return data.filter((item) =>
      [
        item.invoiceNo,
        item.customerName,
        item.referenceNo,
        item.purchaseType,
        item.date,
        item.party?.name,
        item.voucher,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [data, search]);

  const handleDownload = async (id) => {
    try {
      const blob = await getPurchasePdf(id, 1);

      const pdfBlob = new Blob([blob], {
        type: "application/pdf",
      });

      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      window.open(pdfUrl, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 60000);
    } catch (error) {
      notifyError(error, "Failed to open purchase PDF.");
    }
  };
  return (
    <div>
      <div className="flex justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Purchase</h1>
        </div>
        <Button onClick={() => setOpen(true)}>Add Purchase</Button>
      </div>

      <div className="mb-3 flex justify-between">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by invoice no..."
          className="w-64 "
        />
      </div>

      <OldPurchaseTable
        data={filteredData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onPreview={handlePreview}
      />

      <OldPurchaseForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
      />

      <PurchaseInvoicePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        purchase={previewPurchase}
      />

      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Purchase"
        description={`Are you sure you want to delete "${deleteName}"?`}
      />
    </div>
  );
}
