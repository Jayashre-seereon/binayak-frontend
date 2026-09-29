import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ItemForm({
  open,
  setOpen,
  onSave,
  defaultValues,
  products = [],
  designs = [],
}) {
  const [preview, setPreview] = useState(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      productId: "",
      designId: "",
      purityId: "",
      description: "",
      image: null,
    },
  });
  const productValue = watch("productId");
  const designValue = watch("designId");

  const selectedProduct = products.find((p) => String(p.id) === String(productValue));

  useEffect(() => {
    if (open) {
      const existingImage =
        defaultValues?.imageUrl ||
        defaultValues?.image ||
        defaultValues?.photo ||
        null;
      const prodId = defaultValues?.productId ?? defaultValues?.product?.id ?? "";
      const desId = defaultValues?.designId ?? defaultValues?.design?.id ?? "";
      const purId =
        defaultValues?.purityId ??
        defaultValues?.purity?.id ??
        defaultValues?.product?.purityId ??
        "";

      reset({
        name: defaultValues?.name || "",
        productId: prodId ? String(prodId) : "",
        designId: desId ? String(desId) : "",
        purityId: purId ? String(purId) : "",
        description: defaultValues?.description || "",
        image: null,
      });
      setPreview(existingImage);
      setValue("productId", prodId ? String(prodId) : "");
      setValue("designId", desId ? String(desId) : "");
      setValue("purityId", purId ? String(purId) : "");
    }
  }, [defaultValues, open, reset, setValue]);

  const handleProductChange = (val) => {
    setValue("productId", val);
    const prod = products.find((p) => String(p.id) === String(val));
    setValue("purityId", prod?.purityId ? String(prod.purityId) : "");
  };

  const submit = (data) => {
    // Ensure purityId is synced with product if not already
    const prod = products.find((p) => String(p.id) === String(data.productId));
    const finalData = {
      ...data,
      purityId: data.purityId || (prod?.purityId ? String(prod.purityId) : ""),
    };
    onSave(finalData);
    reset();
    setPreview(null);
    setOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Item Master</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Item Name *</label>
            <Input
              className="h-9 mt-1"
              placeholder="e.g. Traditional Gold Necklace"
              {...register("name", { required: "Item name is required" })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Product *</label>
            <Select
              value={String(productValue || "")}
              onValueChange={handleProductChange}
            >
              <SelectTrigger className="w-full h-9 mt-1">
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auto-fetched Read-Only Attributes from Product */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
              Auto-Fetched Product Attributes (Read-Only)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Category</span>
                <span className="font-medium text-slate-800">
                  {selectedProduct?.category?.name || "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Metal</span>
                <span className="font-medium text-slate-800">
                  {selectedProduct?.metal?.name || "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Purity</span>
                <span className="font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block text-xs font-semibold">
                  {selectedProduct?.purity?.name || "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Grade</span>
                <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block text-xs font-semibold">
                  {selectedProduct?.grade?.name
                    ? `${selectedProduct.grade.name}${selectedProduct.grade.percentage ? ` (${selectedProduct.grade.percentage}%)` : ""}`
                    : "-"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Design *</label>
            <Select
              value={String(designValue || "")}
              onValueChange={(val) => setValue("designId", val)}
            >
              <SelectTrigger className="w-full h-9 mt-1">
                <SelectValue placeholder="Select Design" />
              </SelectTrigger>
              <SelectContent>
                {designs.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              className="min-h-[70px] mt-1"
              placeholder="Item description or specifications..."
              {...register("description")}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Reference Image</label>
            <Input type="file" accept="image/*" onChange={handleImageChange} className="mt-1" />
          </div>

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-20 h-20 object-cover border rounded"
            />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
