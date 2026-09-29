import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ItemTable from "./item-table";
import ItemForm from "./item-form";
import DeleteModal from "@/utils/DeleteModal";
import { notifyError, notifySuccess } from "@/utils/notify";
import {
  getItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
} from "@/api/item-api";

import { getProducts } from "@/api/product-api";
import { getDesigns } from "@/api/design-api";

export default function ItemPage() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [designs, setDesigns] = useState([]);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const loadData = async () => {
    try {
      const [itms, prods, dsgs] = await Promise.all([
        getItems(),
        getProducts().catch(() => []),
        getDesigns().catch(() => []),
      ]);
      setItems(Array.isArray(itms) ? itms : []);
      setProducts(Array.isArray(prods) ? prods : []);
      setDesigns(Array.isArray(dsgs) ? dsgs : []);
    } catch (error) {
      notifyError(error, "Failed to load items.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data) => {
    try {
      if (editData) {
        await updateItem(editData.id, data);
        notifySuccess("Item updated successfully.");
      } else {
        await addItem(data);
        notifySuccess("Item added successfully.");
      }
      setEditData(null);
      setOpen(false);
      loadData();
    } catch (error) {
      notifyError(error, "Item save failed.");
    }
  };

  const filtered = [...items]
  .sort((a, b) => b.id - a.id) // latest first
  .filter((i) =>
    `${i.name || ""} ${i.description || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

 const handleDelete = (item) => {
  if (!item) return;

  setDeleteId(item.id);

  setDeleteName(
    item.name ||
    item.alias ||
    `#${item.id}`
  );

  setDeleteOpen(true);
};

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteItem(deleteId);
      notifySuccess("Item deleted successfully.");
      setDeleteId(null);
      setDeleteName("");
      setDeleteOpen(false);
      loadData();
    } catch (error) {
      notifyError(error, "Failed to delete item.");
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Item Master</h1>
       </div>
 <div className="mb-3 flex justify-between">
      <Input
        placeholder="Search item..."
        className="w-64 "
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
        <Button onClick={() => setOpen(true)}>Add Item</Button>
     </div>

      <ItemTable
        data={filtered}
        onEdit={async (item) => {
          const fullItem = await getItemById(item.id);
          setEditData(fullItem || item);
          setOpen(true);
        }}
        onDelete={handleDelete}
      />

      <ItemForm
        open={open}
        setOpen={setOpen}
        onSave={handleSave}
        defaultValues={editData}
        products={products}
        designs={designs}
      />

      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Item"
        description={`Are you sure you want to delete "${deleteName}"?`}
      />
    </div>
  );
}
