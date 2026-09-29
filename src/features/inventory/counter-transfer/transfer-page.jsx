import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { notifyError, notifySuccess } from "@/utils/notify";

import TransferTable from "./transfer-table";
import TransferForm from "./transfer-form";
import {
  cancelTransfer,
  createTransfer,
  getTransfers,
  receiveTransfer,
  updateTransfer,
} from "./transfer-api";

export default function TransferPage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);

  const loadData = async () => {
    try {
      setData(await getTransfers());
    } catch (error) {
      notifyError(error, "Failed to load transfers.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingTransfer) {
        await updateTransfer(editingTransfer.id, formData);
        notifySuccess("Transfer updated successfully.");
      } else {
        await createTransfer(formData);
        notifySuccess("Transfer created successfully.");
      }
      setEditingTransfer(null);
      setOpen(false);
      await loadData();
    } catch (error) {
      notifyError(error, editingTransfer ? "Failed to update transfer." : "Failed to create transfer.");
      throw error;
    }
  };

  const handleEdit = (transfer) => {
    setEditingTransfer(transfer);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTransfer(null);
  };

  const handleCancel = async (transfer) => {
    try {
      await cancelTransfer(transfer.id);
      notifySuccess("Transfer cancelled successfully.");
      await loadData();
    } catch (error) {
      notifyError(error, "Failed to cancel transfer.");
    }
  };

  const handleReceive = async (transfer) => {
    try {
      await receiveTransfer(transfer.id);
      notifySuccess("Transfer received successfully.");
      await loadData();
    } catch (error) {
      notifyError(error, "Failed to receive transfer.");
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Counter Transfer</h1>
        <Button onClick={() => setOpen(true)}>Add Transfer</Button>
      </div>

      <TransferTable
        data={data}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onReceive={handleReceive}
      />

      <TransferForm
        open={open}
        setOpen={handleClose}
        onSave={handleSave}
        defaultValues={editingTransfer}
      />
    </div>
  );
}
