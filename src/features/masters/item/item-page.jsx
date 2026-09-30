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

const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalItems, setTotalItems] = useState(0);
const [loading, setLoading] = useState(false);

const ITEMS_PER_PAGE = 10;
const loadData = async (
  page = currentPage,
  searchValue = search
) => {
  try {
    setLoading(true);

    const [itemResponse, prods, dsgs] = await Promise.all([
      getItems(
        page,
        ITEMS_PER_PAGE,
        searchValue
      ),
      getProducts().catch(() => []),
      getDesigns().catch(() => []),
    ]);

    setItems(itemResponse.items || []);

    setTotalPages(
      itemResponse.pagination?.totalPages || 1
    );

    setTotalItems(
      itemResponse.pagination?.total || 0
    );

    setProducts(Array.isArray(prods) ? prods : []);
    setDesigns(Array.isArray(dsgs) ? dsgs : []);

  } catch (error) {
    notifyError(error, "Failed to load items.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadData(1);
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

 const filtered = items;
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
  className="w-64"
  value={search}
  onChange={(e) => {
    const value = e.target.value;

    setSearch(value);
    setCurrentPage(1);

    loadData(1, value);
  }}
/>
        <Button onClick={() => setOpen(true)}>Add Item</Button>
     </div>

      <ItemTable
        data={filtered}
         currentPage={currentPage}
         itemsPerPage={ITEMS_PER_PAGE}
        onEdit={async (item) => {
          const fullItem = await getItemById(item.id);
          setEditData(fullItem || item);
          setOpen(true);
        }}
        onDelete={handleDelete}
      />
<div className="flex items-center justify-between mt-4">
  <div className="text-sm text-gray-500">
    Showing {items.length} of {totalItems} items
  </div>

  <div className="flex items-center gap-2">
    <Button
  variant="outline"
  disabled={currentPage === 1 || loading}
  onClick={() => {
    const newPage = currentPage - 1;

    setCurrentPage(newPage);
    loadData(newPage, search);
  }}
>
  Previous
</Button>

    <span className="text-sm px-3">
      Page {currentPage} of {totalPages}
    </span>

  <Button
  variant="outline"
  disabled={currentPage === totalPages || loading}
  onClick={() => {
    const newPage = currentPage + 1;

    setCurrentPage(newPage);
    loadData(newPage, search);
  }}
>
  Next
</Button>
  </div>
</div>
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
