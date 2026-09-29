import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPurchaseItemsByPurchaseId } from "@/api/purchase-api";

const emptyValues = {
  purchaseId: "",
  purchaseItemId: "",
  purchaseType: "",
  itemId: "",
  productId: "",
  metalId: "",
  purityId: "",
  gradeId: "",
  stoneId: "",
  purchaseItemCode: "",
  inventoryCode: "",
  grossWeight: "",
  stoneWeight: "",
  netWeight: "",
  dustWeight: "",
  deductionWeight: "",
  pureWeight: "",
  actualWeight: "",
  balanceWeight: "",
  purity: "",
  touchPercentage: "",
  fineness: "",
  huidNo: "",
  tagNo: "",
  barcodeNo: "",
  barSerialNo: "",
  assayCertNo: "",
};

const mapPurchaseItemToForm = (purchase, purchaseItem) => ({
  purchaseId: String(purchase?.id ?? purchaseItem?.purchaseId ?? ""),
  purchaseItemId: String(purchaseItem?.id ?? ""),
  purchaseType: purchase?.purchaseType ?? "",
  itemId: purchaseItem?.itemId ? String(purchaseItem.itemId) : "",
  productId: purchaseItem?.productId ? String(purchaseItem.productId) : "",
  metalId: purchaseItem?.metalId ? String(purchaseItem.metalId) : "",
  purityId: purchaseItem?.purityId ? String(purchaseItem.purityId) : "",
  gradeId: purchaseItem?.gradeId ? String(purchaseItem.gradeId) : "",
  stoneId: purchaseItem?.stoneId ? String(purchaseItem.stoneId) : "",
  purchaseItemCode: purchaseItem?.purchaseItemCode || "",
  inventoryCode: "",
  grossWeight: purchaseItem?.grossWeight ?? "",
  stoneWeight: purchaseItem?.stoneWeight ?? "",
  netWeight: purchaseItem?.netWeight ?? "",
  dustWeight: purchaseItem?.dustWeight ?? "",
  deductionWeight: purchaseItem?.deductionWeight ?? "",
  pureWeight: purchaseItem?.pureWeight ?? "",
  actualWeight: purchaseItem?.actualWeight ?? "",
  balanceWeight: purchaseItem?.balanceWeight ?? "",
  purity: purchaseItem?.purity ?? "",
  touchPercentage: purchaseItem?.touchPercentage ?? "",
  fineness: purchaseItem?.fineness ?? "",
  huidNo: purchaseItem?.huidNo ?? "",
  tagNo: "",
  barcodeNo: "",
  barSerialNo: purchaseItem?.barSerialNo ?? "",
  assayCertNo: purchaseItem?.assayCertNo ?? "",
});

const formatPurchaseType = (value) => {
  if (!value) return "-";
  return value
    .toString()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function StockForm({ open, setOpen, onSave, defaultValues, purchaseOptions = [] }) {
  const isEditMode = Boolean(defaultValues);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState([]);

  const { register, handleSubmit, reset, watch, setValue } = useForm({ defaultValues: emptyValues });

  const purchaseId = watch("purchaseId");
  const purchaseItemId = watch("purchaseItemId");

  const resolveBarcode = useCallback((inventory = {}, purchaseItem = null) => {
    return (
      inventory.barcodeNo ??
      inventory.barcode ??
      inventory.barCodeNo ??
      inventory.barSerialNo ??
      purchaseItem?.barcodeNo ??
      purchaseItem?.barcode ??
      purchaseItem?.barCodeNo ??
      purchaseItem?.barSerialNo ??
      ""
    );
  }, []);

  const applyPurchaseItem = useCallback((purchase, purchaseItem, inventoryValues = null) => {
    if (!purchaseItem) return;
    const mapped = mapPurchaseItemToForm(purchase, purchaseItem);
    if (inventoryValues) {
      mapped.inventoryCode = inventoryValues.inventoryCode ?? mapped.inventoryCode;
      mapped.tagNo = inventoryValues.tagNo ?? mapped.tagNo;
      mapped.barcodeNo =
        inventoryValues.barcodeNo ??
        inventoryValues.barcode ??
        inventoryValues.barCodeNo ??
        inventoryValues.barSerialNo ??
        mapped.barcodeNo;
      mapped.huidNo = inventoryValues.huidNo ?? mapped.huidNo;
      mapped.purchaseItemCode =
        inventoryValues.purchaseItem?.purchaseItemCode ??
        inventoryValues.purchaseItemCode ??
        mapped.purchaseItemCode;
    }
    Object.entries(mapped).forEach(([key, value]) => {
      setValue(key, value, { shouldDirty: true, shouldValidate: true });
    });
  }, [setValue]);

  const loadPurchaseItems = useCallback(async (selectedPurchaseId, fallbackPurchase = null) => {
    if (!selectedPurchaseId) {
      setSelectedPurchase(null);
      setPurchaseItems([]);
      return [];
    }

    setPurchaseLoading(true);
    try {
      const items = await getPurchaseItemsByPurchaseId(selectedPurchaseId);
      setPurchaseItems(items);
      setSelectedPurchase({
        ...(fallbackPurchase || {}),
        id: Number(selectedPurchaseId),
        items,
      });
      return items;
    } finally {
      setPurchaseLoading(false);
    }
  }, []);

  const eligiblePurchaseOptions = useMemo(() => {
    return (Array.isArray(purchaseOptions) ? purchaseOptions : []).filter(
      (p) => p.purchaseType === "ORNAMENT" || p.purchaseType === "BULLION"
    );
  }, [purchaseOptions]);

  useEffect(() => {
    if (!open) return;

    if (defaultValues) {
      const purchaseIdValue = String(defaultValues.purchaseId ?? defaultValues.purchase?.id ?? "");
      const purchaseItemIdValue = String(defaultValues.purchaseItemId ?? defaultValues.purchaseItem?.id ?? "");
      reset({
        ...emptyValues,
        purchaseId: purchaseIdValue,
        purchaseItemId: purchaseItemIdValue,
        purchaseType: defaultValues.purchaseType ?? defaultValues.purchase?.purchaseType ?? "",
        itemId: defaultValues.itemId ? String(defaultValues.itemId) : "",
        productId: defaultValues.productId ? String(defaultValues.productId) : "",
        metalId: defaultValues.metalId ? String(defaultValues.metalId) : "",
        purityId: defaultValues.purityId ? String(defaultValues.purityId) : "",
        gradeId: defaultValues.gradeId ? String(defaultValues.gradeId) : "",
        stoneId: defaultValues.stoneId ? String(defaultValues.stoneId) : "",
        purchaseItemCode: defaultValues.purchaseItem?.purchaseItemCode || defaultValues.purchaseItemCode || "",
        inventoryCode: defaultValues.inventoryCode ?? "",
        grossWeight: defaultValues.grossWeight ?? "",
        stoneWeight: defaultValues.stoneWeight ?? "",
        netWeight: defaultValues.netWeight ?? "",
        dustWeight: defaultValues.dustWeight ?? "",
        deductionWeight: defaultValues.deductionWeight ?? "",
        pureWeight: defaultValues.pureWeight ?? "",
        actualWeight: defaultValues.actualWeight ?? "",
        balanceWeight: defaultValues.balanceWeight ?? "",
        purity: defaultValues.purity ?? "",
        touchPercentage: defaultValues.touchPercentage ?? "",
        fineness: defaultValues.fineness ?? "",
        huidNo: defaultValues.huidNo ?? "",
        tagNo: defaultValues.tagNo ?? "",
        barcodeNo: resolveBarcode(defaultValues, defaultValues.purchaseItem),
        barSerialNo: defaultValues.barSerialNo ?? defaultValues.barcodeNo ?? "",
        assayCertNo: defaultValues.assayCertNo ?? "",
      });

      const defaultPurchase =
        eligiblePurchaseOptions.find((purchase) => String(purchase.id) === purchaseIdValue) || null;
      setSelectedPurchase(defaultPurchase);

      loadPurchaseItems(purchaseIdValue, defaultPurchase).then((items) => {
        const matchedItem =
          items.find((row) => String(row.id) === purchaseItemIdValue) || defaultValues.purchaseItem || null;
        if (matchedItem) {
          applyPurchaseItem(defaultPurchase, matchedItem, defaultValues);
        }
      });
      return;
    }

    reset(emptyValues);
    setSelectedPurchase(null);
    setPurchaseItems([]);
  }, [applyPurchaseItem, defaultValues, loadPurchaseItems, open, eligiblePurchaseOptions, resolveBarcode, reset]);

  useEffect(() => {
    if (!purchaseId || isEditMode) return;
    const local = eligiblePurchaseOptions.find((purchase) => String(purchase.id) === String(purchaseId));
    loadPurchaseItems(purchaseId, local || null);
  }, [isEditMode, loadPurchaseItems, purchaseId, eligiblePurchaseOptions]);

  useEffect(() => {
    if (!purchaseId || !purchaseItemId || isEditMode) return;
    const item = purchaseItems.find((row) => String(row.id) === String(purchaseItemId));
    if (item) {
      applyPurchaseItem(selectedPurchase, item);
    }
  }, [applyPurchaseItem, isEditMode, purchaseId, purchaseItemId, purchaseItems, selectedPurchase]);

  const activePurchase = useMemo(
    () =>
      selectedPurchase ||
      eligiblePurchaseOptions.find((purchase) => String(purchase.id) === String(purchaseId)) ||
      null,
    [purchaseId, eligiblePurchaseOptions, selectedPurchase]
  );

  const selectedPurchaseItem = useMemo(
    () => purchaseItems.find((row) => String(row.id) === String(purchaseItemId)) || null,
    [purchaseItemId, purchaseItems]
  );

  const inventoryDetailNames = useMemo(
    () => ({
      purchaseId: activePurchase?.invoiceNo || (activePurchase?.id ? `#${activePurchase.id}` : "-"),
      purchaseItemId:
        selectedPurchaseItem?.purchaseItemCode ||
        (selectedPurchaseItem?.id ? `#${selectedPurchaseItem.id}` : "-"),
      itemId:
        selectedPurchaseItem?.item?.name || (selectedPurchaseItem?.itemId ? `#${selectedPurchaseItem.itemId}` : "-"),
      productId:
        selectedPurchaseItem?.product?.name || (selectedPurchaseItem?.productId ? `#${selectedPurchaseItem.productId}` : "-"),
      metalId:
        selectedPurchaseItem?.metal?.name || (selectedPurchaseItem?.metalId ? `#${selectedPurchaseItem.metalId}` : "-"),
      purityId:
        selectedPurchaseItem?.purityMaster?.name ||
        selectedPurchaseItem?.purity?.name ||
        (selectedPurchaseItem?.purityId ? `#${selectedPurchaseItem.purityId}` : "-"),
      gradeId:
        selectedPurchaseItem?.grade?.name ||
        (selectedPurchaseItem?.gradeId ? `#${selectedPurchaseItem.gradeId}` : "-"),
      stoneId:
        selectedPurchaseItem?.stone?.name ||
        (selectedPurchaseItem?.stoneId ? `#${selectedPurchaseItem.stoneId}` : "-"),
    }),
    [activePurchase, selectedPurchaseItem]
  );

  const toNullableNumber = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  const submit = (values) => {
    const payload = {
      ...values,
      purchaseId: Number(values.purchaseId),
      purchaseItemId: Number(values.purchaseItemId),
    };

    ["itemId", "productId", "metalId", "purityId", "gradeId", "stoneId"].forEach((field) => {
      if (payload[field] === "" || payload[field] === null || payload[field] === undefined) {
        payload[field] = null;
      } else {
        payload[field] = Number(payload[field]);
      }
    });

    [
      "grossWeight",
      "stoneWeight",
      "netWeight",
      "dustWeight",
      "deductionWeight",
      "pureWeight",
      "actualWeight",
      "balanceWeight",
      "purity",
      "touchPercentage",
      "fineness",
    ].forEach((field) => {
      payload[field] = toNullableNumber(payload[field]);
    });

    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!w-[95vw] !max-w-[1100px] h-[88vh] overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{isEditMode ? "Update Inventory" : "Add Inventory"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex h-[calc(88vh-72px)] flex-col overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <div className="grid gap-4 rounded-xl border bg-slate-50 p-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Invoice No</label>
                <Select
                  value={purchaseId ? String(purchaseId) : ""}
                  onValueChange={async (value) => {
                    setValue("purchaseId", value, { shouldDirty: true, shouldValidate: true });
                    setValue("purchaseItemId", "", { shouldDirty: true, shouldValidate: true });
                    const local = eligiblePurchaseOptions.find((purchase) => String(purchase.id) === String(value));
                    await loadPurchaseItems(value, local || null);
                  }}
                  disabled={isEditMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligiblePurchaseOptions.map((purchase) => (
                      <SelectItem key={purchase.id} value={String(purchase.id)}>
                        {purchase.invoiceNo || `#${purchase.id}`} ({purchase.purchaseType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Purchase Item</label>
                <Select
                  value={purchaseItemId ? String(purchaseItemId) : ""}
                  onValueChange={(value) => setValue("purchaseItemId", value, { shouldDirty: true, shouldValidate: true })}
                  disabled={!purchaseId || !purchaseItems.length}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !purchaseId
                          ? "Select invoice first"
                          : purchaseLoading
                            ? "Loading items..."
                            : "Select purchase item"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseItems.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.purchaseItemCode || `#${item.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-white p-3 text-sm">
                <div className="text-gray-500">Purchase Type</div>
                <div className="font-medium">{formatPurchaseType(activePurchase?.purchaseType)}</div>
                <div className="mt-2 text-gray-500">Selected Item</div>
                <div className="font-medium">
                  {purchaseItems.find((row) => String(row.id) === String(purchaseItemId))?.purchaseItemCode || "-"}
                </div>
              </div>
            </div>

            <Section title="Inventory Details">
              <div className="grid gap-4 md:grid-cols-3">
                <DisplayField label="Status" value={defaultValues?.status || "AVAILABLE"} />
                <Field label="Inventory Code" name="inventoryCode" register={register} disabled />
                <Field label="Purchase Item Code" name="purchaseItemCode" register={register} disabled />
                <Field label="Purchase Type" name="purchaseType" register={register} disabled />
                <DisplayField label="Purchase" value={inventoryDetailNames.purchaseId} />
                <DisplayField label="Purchase Item" value={inventoryDetailNames.purchaseItemId} />
                <DisplayField label="Item" value={inventoryDetailNames.itemId} />
                <DisplayField label="Product" value={inventoryDetailNames.productId} />
                <DisplayField label="Metal" value={inventoryDetailNames.metalId} />
                <DisplayField label="Purity" value={inventoryDetailNames.purityId} />
                <DisplayField label="Grade" value={inventoryDetailNames.gradeId} />
                <DisplayField label="Stone" value={inventoryDetailNames.stoneId} />
                <Field label="Gross Weight" name="grossWeight" register={register} disabled />
                <Field label="Stone Weight" name="stoneWeight" register={register} disabled />
                <Field label="Net Weight" name="netWeight" register={register} disabled />
               
                  <Field label="Purity" name="purity" register={register} disabled />
                 <Field label="HUID No" name="huidNo" register={register} disabled />
                <Field label="Tag No" name="tagNo" register={register} disabled />
                <Field label="Barcode No" name="barcodeNo" register={register} disabled />
                    </div>
            </Section>
          </div>

          <div className="flex justify-end gap-3 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditMode ? "Update Inventory" : "Create Inventory"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, name, register, disabled = false }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <Input type="text" disabled={disabled} {...register(name)} />
    </div>
  );
}

function DisplayField({ label, value }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <Input type="text" value={value || "-"} readOnly disabled />
    </div>
  );
}
