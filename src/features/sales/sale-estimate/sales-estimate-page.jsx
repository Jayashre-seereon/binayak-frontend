import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Trash2,
  ScanBarcode,
  Search,
  Printer,
  Download,
  Eye,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  History,
  UserCheck,
  Coins,
  Receipt,
  Wallet,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { notifySuccess, notifyError } from "@/utils/notify";
import { numberToWordsIndian } from "@/utils/numberToWords";
import {
  getSales,
  getSalePdf,
  createSale,
} from "./sale-estimate-api";
import { getParties } from "@/api/party-api";
import { getStock } from "@/api/stock-api";
import { lookupCustomerByPhone } from "@/api/customer-api";
import SalesInvoicePreviewModal from "./sales-invoice-preview-modal";
import CustomerHistoryTracking from "./customer-history-tracking";
import { formatCharge, formatWeight } from "@/utils/units";

const roundMoney = (val) =>
  Math.round((Number(val || 0) + Number.EPSILON) * 100) / 100;

const money = (val) => roundMoney(val).toFixed(2);
const weightStr = (val) => Number(val || 0).toFixed(3);

const PAYMENT_MODES = [
  { label: "Cash", value: "CASH" },
  { label: "Online / UPI", value: "ONLINE" },
  { label: "Card", value: "CARD" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "Other", value: "OTHER" },
];

const PAYMENT_CHANNELS = [
  "PhonePe",
  "Google Pay",
  "Paytm",
  "Bank Transfer (NEFT/RTGS)",
  "HDFC POS",
  "SBI POS",
  "ICICI QR",
  "Cash Drawer",
  "Other",
];

const emptyPayment = (amount = 0) => ({
  paymentMode: "ONLINE",
  paymentChannel: "PhonePe",
  amount: amount || "",
  transactionId: "",
  referenceNo: "",
  description: "UPI/QR CODE RECEIPT",
  paymentDate: new Date().toISOString().slice(0, 10),
  narration: "",
});

const initialState = () => ({
  saleDate: new Date().toISOString().slice(0, 10),
  partyId: "",
  customerId: null,
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  customerCity: "Bhubaneswar - 766001",
  customerPan: "",
  customerGst: "",
  customerState: "ODISHA",
  placeOfSupply: "ODISHA",
  cinNo: "U36911OR2005PTCC008217",
  storeGst: "21AAFCA3795A1Z5",
  irnNo: "",
  narration: "",
  offerDiscount: 0,
  discount: 0,
  cgstPercent: "",
  cgstAmount: "",
  sgstPercent: "",
  sgstAmount: "",
  igstPercent: "",
  igstAmount: "",
  lessUrd: 0,
  roundOff: 0,
  isManualRoundOff: false,
  items: [],
  payments: [emptyPayment(0)],
});

export default function SalesPage() {
  const selectedStore = useAuthStore((state) => state.selectedStore);
  const storeId =
    selectedStore?.id ||
    selectedStore?.storeId ||
    localStorage.getItem("selectedStoreId");

  const [sales, setSales] = useState([]);
  const [parties, setParties] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const [state, setState] = useState(initialState());
  const [previewSale, setPreviewSale] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Customer lookup & adjustment states
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false);
  const [customerFound, setCustomerFound] = useState(null); // customer object or null
  const [availableAdvances, setAvailableAdvances] = useState([]);
  const [availableOldJewellery, setAvailableOldJewellery] = useState([]);
  const [allAdvancesHistory, setAllAdvancesHistory] = useState([]);
  const [allOldJewelleryHistory, setAllOldJewelleryHistory] = useState([]);
  const [adjustmentLogsHistory, setAdjustmentLogsHistory] = useState([]);
  const [pastSalesHistory, setPastSalesHistory] = useState([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyActiveTab, setHistoryActiveTab] = useState("logs"); // "logs" | "advances" | "oldGold" | "sales"

  // Selected adjustments state:
  // advances: { [id]: { isSelected: boolean, adjustedAmount: number|string } }
  // oldGold: { [id]: { isSelected: boolean, adjustedAmount: number|string } }
  const [advanceAdjustmentsState, setAdvanceAdjustmentsState] = useState({});
  const [oldGoldAdjustmentsState, setOldGoldAdjustmentsState] = useState({});

  const barcodeInputRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [saleData, partyData, stockData] = await Promise.all([
        getSales().catch(() => []),
        getParties(storeId).catch(() => []),
        getStock().catch(() => []),
      ]);

      setSales(Array.isArray(saleData) ? saleData : []);
      setParties(
        Array.isArray(partyData?.data)
          ? partyData.data
          : Array.isArray(partyData?.parties)
            ? partyData.parties
            : Array.isArray(partyData)
              ? partyData
              : []
      );
      setInventories(Array.isArray(stockData) ? stockData : []);
    } catch (error) {
      notifyError(error, "Failed to load sales data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) loadData();
  }, [storeId]);

  const availableInventories = useMemo(
    () => inventories.filter((inv) => inv.status === "AVAILABLE"),
    [inventories]
  );

  // Phone Lookup trigger with Debounce
  const handlePhoneLookup = async (phone) => {
    const cleanPhone = String(phone || "").trim().replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setCustomerFound(null);
      setAvailableAdvances([]);
      setAvailableOldJewellery([]);
      setAdvanceAdjustmentsState({});
      setOldGoldAdjustmentsState({});
      return;
    }

    try {
      setCustomerLookupLoading(true);
      const res = await lookupCustomerByPhone(cleanPhone, storeId);

      if (res?.success) {
        const cust = res.customer;
        const hasRecords =
          res.exists ||
          Boolean(cust?.id) ||
          (res.availableAdvances && res.availableAdvances.length > 0) ||
          (res.availableOldJewellery && res.availableOldJewellery.length > 0);

        if (hasRecords) {
          setCustomerFound(cust || { id: cust?.id || "", name: state.customerName, phone: cleanPhone });
          setState((prev) => ({
            ...prev,
            customerId: cust?.id || prev.customerId || null,
            customerName: prev.partyId && prev.customerName ? prev.customerName : (cust?.name || prev.customerName || ""),
            customerAddress: prev.customerAddress || cust?.address || "",
            customerCity: prev.customerCity || cust?.city || "Bhubaneswar - 766001",
            customerPan: prev.customerPan || cust?.pan || "",
            customerGst: prev.customerGst || cust?.gst || "",
            customerState: cust?.state || prev.customerState || "ODISHA",
            placeOfSupply: cust?.state || prev.placeOfSupply || "ODISHA",
          }));
        } else {
          setCustomerFound(null);
        }

        const avAdv = res.availableAdvances || [];
        const avOj = res.availableOldJewellery || [];
        setAvailableAdvances(avAdv);
        setAvailableOldJewellery(avOj);
        setAllAdvancesHistory(res.allAdvances || []);
        setAllOldJewelleryHistory(res.allOldJewellery || []);
        setAdjustmentLogsHistory(res.adjustmentLogs || []);
        setPastSalesHistory(res.pastSales || []);

        // Initialize adjustment selections
        const initAdvState = {};
        avAdv.forEach((a) => {
          initAdvState[a.id] = { isSelected: false, adjustedAmount: a.balanceAmount };
        });
        setAdvanceAdjustmentsState(initAdvState);

        const initOjState = {};
        avOj.forEach((oj) => {
          initOjState[oj.id] = { isSelected: false, adjustedAmount: oj.balanceAmount };
        });
        setOldGoldAdjustmentsState(initOjState);
      }
    } catch (err) {
      console.error("Customer lookup failed:", err);
    } finally {
      setCustomerLookupLoading(false);
    }
  };

  useEffect(() => {
    const phone = String(state.customerPhone || "").trim().replace(/\D/g, "");
    if (phone.length === 10) {
      const timer = setTimeout(() => {
        handlePhoneLookup(phone);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [state.customerPhone, storeId]);

  const handlePartyChange = (pId) => {
    setValidationErrors((prev) => ({ ...prev, customerName: null, customerPhone: null }));
    if (!pId) {
      setState((prev) => ({
        ...prev,
        partyId: "",
      }));
      return;
    }
    const party = parties.find((p) => String(p.id) === String(pId));
    if (party) {
      setState((prev) => ({
        ...prev,
        partyId: pId,
        customerName: party.name || "",
        customerPhone: party.phone || "",
        customerAddress: party.address || "",
        customerGst: party.gst || "",
        customerState: party.state || prev.customerState,
        placeOfSupply: party.state || prev.placeOfSupply,
      }));
      if (party.phone && String(party.phone).replace(/\D/g, "").length === 10) {
        handlePhoneLookup(party.phone);
      }
    }
  };

  const updateField = (field, value) => {
    setState((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const syncTaxField = (field, value) => {
    setState((prev) => {
      const next = { ...prev, [field]: value };
      const taxableAmount = roundMoney(
        Math.max(
          0,
          roundMoney(
            prev.items.reduce((sum, it) => sum + Number(it.totalAmount || 0), 0)
          ) -
            roundMoney(Number(prev.offerDiscount || 0)) -
            roundMoney(Number(prev.discount || 0))
        )
      );

      const percentField =
        field === "cgstPercent" || field === "cgstAmount"
          ? "cgst"
          : field === "sgstPercent" || field === "sgstAmount"
            ? "sgst"
            : "igst";

      const percentKey = `${percentField}Percent`;
      const amountKey = `${percentField}Amount`;
      const numericValue = Number(value || 0);

      if (field.endsWith("Percent")) {
        next[amountKey] = taxableAmount > 0 ? roundMoney((taxableAmount * numericValue) / 100) : 0;
      } else if (field.endsWith("Amount")) {
        next[percentKey] = taxableAmount > 0 ? roundMoney((numericValue * 100) / taxableAmount) : 0;
        next[amountKey] = numericValue;
      }

      return next;
    });

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const openCreateModal = () => {
    setState(initialState());
    setCustomerFound(null);
    setAvailableAdvances([]);
    setAvailableOldJewellery([]);
    setAdvanceAdjustmentsState({});
    setOldGoldAdjustmentsState({});
    setValidationErrors({});
    setOpen(true);
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 150);
  };

  /*
  ========================================
  ITEM SELECTION & CALCULATIONS
  ========================================
  */
  const addInventoryItem = (inv) => {
    if (!inv) return;

    const alreadyAdded = state.items.some(
      (it) => Number(it.inventoryId) === Number(inv.id)
    );
    if (alreadyAdded) {
      notifyError(null, `Item "${inv.barcodeNo || inv.inventoryCode}" is already added to this invoice.`);
      return;
    }

    const grossWeight = Number(inv.grossWeight || 0);
    const stoneWeight = Number(inv.stoneWeight || 0);
    const netWeight = Number(inv.netWeight || Math.max(0, grossWeight - stoneWeight));
    const rate = Number(inv.rate || inv.purityMaster?.baseRate || 0);
    const metalAmount = roundMoney(netWeight * rate);

    const makingChargeType = (inv.makingChargeType || inv.item?.makingChargeType || "PERCENT").toString().toUpperCase();
    const makingChargeRate = Number(inv.makingChargeRate || inv.makingCharges || inv.item?.makingChargeRate || inv.item?.makingCharges || 10);
    const makingCharges =
      makingChargeType === "PER_GRAM"
        ? roundMoney(netWeight * makingChargeRate)
        : roundMoney((metalAmount * makingChargeRate) / 100);

    const stoneAmount = roundMoney(Number(inv.stoneAmount || 0));
    const otherCharges = roundMoney(Number(inv.otherCharges || 0));
    const discount = 0;

    const totalAmount = roundMoney(
      metalAmount + makingCharges + stoneAmount + otherCharges - discount
    );

    const newItem = {
      inventoryId: inv.id,
      particulars: inv.item?.name || inv.product?.name || "Jewellery Item",
      itemCode: inv.barcodeNo || inv.tagNo || inv.inventoryCode || "",
      huidNo: inv.huidNo || "",
      hsnCode: inv.hsnCode || "711319",
      purityName:
        inv.purityMaster?.name ||
        (inv.purity ? `${inv.purity}K` : "22K"),
      pieces: inv.pieces || 1,
      grossWeight,
      stoneWeight,
      netWeight,
      purity: inv.purity || 22,
      rate,
      metalAmount,
      makingChargeType,
      makingChargeRate,
      makingCharges,
      stoneAmount,
      otherCharges,
      discount,
      totalAmount,
    };

    setState((prev) => ({
      ...prev,
      items: [newItem, ...prev.items],
    }));

    setBarcodeInput("");
  };

  const handleBarcodeScan = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const code = barcodeInput.trim();
      if (!code) return;

      const found = inventories.find(
        (inv) =>
          inv.status === "AVAILABLE" &&
          ((inv.barcodeNo && inv.barcodeNo.toLowerCase() === code.toLowerCase()) ||
            (inv.tagNo && inv.tagNo.toLowerCase() === code.toLowerCase()) ||
            (inv.inventoryCode && inv.inventoryCode.toLowerCase() === code.toLowerCase()))
      );

      if (found) {
        addInventoryItem(found);
      } else {
        notifyError(null, `No available inventory found matching barcode/code "${code}".`);
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    setState((prev) => {
      const updated = [...prev.items];
      const it = { ...updated[index], [field]: value };

      const grossWeight = Number(it.grossWeight || 0);
      const stoneWeight = Number(it.stoneWeight || 0);
      let netWeight = Number(it.netWeight || 0);

      if (field === "grossWeight" || field === "stoneWeight") {
        netWeight = Math.max(0, grossWeight - stoneWeight);
        it.netWeight = netWeight;
      }

      const rate = Number(it.rate || 0);
      const metalAmount = roundMoney(netWeight * rate);
      it.metalAmount = metalAmount;

      const makingChargeType = it.makingChargeType || "PERCENT";
      const makingChargeRate = Number(it.makingChargeRate || 0);

      let makingCharges = 0;
      if (makingChargeType === "PERCENT") {
        makingCharges = roundMoney((metalAmount * makingChargeRate) / 100);
      } else if (makingChargeType === "PER_GRAM") {
        makingCharges = roundMoney(netWeight * makingChargeRate);
      } else {
        makingCharges = roundMoney(Number(it.makingCharges || 0));
      }
      it.makingCharges = makingCharges;

      const stoneAmount = roundMoney(Number(it.stoneAmount || 0));
      const otherCharges = roundMoney(Number(it.otherCharges || 0));
      const discount = roundMoney(Number(it.discount || 0));

      it.totalAmount = roundMoney(
        metalAmount + makingCharges + stoneAmount + otherCharges - discount
      );

      updated[index] = it;
      return { ...prev, items: updated };
    });
  };

  const removeItem = (index) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  /*
  ========================================
  LIVE FINANCIAL & ADJUSTMENT CALCULATIONS
  ========================================
  */
  const calculations = useMemo(() => {
    const isInterState =
      state.placeOfSupply &&
      state.customerState &&
      state.placeOfSupply.trim().toUpperCase() !== "ODISHA";

    const totalGrossWeight = state.items.reduce(
      (sum, it) => sum + Number(it.grossWeight || 0),
      0
    );
    const totalNetWeight = state.items.reduce(
      (sum, it) => sum + Number(it.netWeight || 0),
      0
    );

    const grossAmount = roundMoney(
      state.items.reduce((sum, it) => sum + Number(it.totalAmount || 0), 0)
    );

    const offerDiscount = roundMoney(Number(state.offerDiscount || 0));
    const discount = roundMoney(Number(state.discount || 0));
    const taxableAmount = roundMoney(
      Math.max(0, grossAmount - offerDiscount - discount)
    );

    const cgstPercent = state.cgstPercent === "" ? (isInterState ? 0 : 1.5) : Number(state.cgstPercent || 0);
    const sgstPercent = state.sgstPercent === "" ? (isInterState ? 0 : 1.5) : Number(state.sgstPercent || 0);
    const igstPercent = state.igstPercent === "" ? (isInterState ? 3.0 : 0) : Number(state.igstPercent || 0);

    const cgstAmount = roundMoney((taxableAmount * cgstPercent) / 100);
    const sgstAmount = roundMoney((taxableAmount * sgstPercent) / 100);
    const igstAmount = roundMoney((taxableAmount * igstPercent) / 100);

    const totalTax = roundMoney(cgstAmount + sgstAmount + igstAmount);
    const subTotal = roundMoney(taxableAmount + totalTax);

    // Calculate selected Advance Adjustments
    let totalAdvanceAdjusted = 0;
    Object.keys(advanceAdjustmentsState).forEach((advId) => {
      const item = advanceAdjustmentsState[advId];
      if (item?.isSelected) {
        totalAdvanceAdjusted = roundMoney(
          totalAdvanceAdjusted + Number(item.adjustedAmount || 0)
        );
      }
    });

    // Calculate selected Old Jewellery Adjustments
    let totalOldGoldAdjusted = 0;
    Object.keys(oldGoldAdjustmentsState).forEach((ojId) => {
      const item = oldGoldAdjustmentsState[ojId];
      if (item?.isSelected) {
        totalOldGoldAdjusted = roundMoney(
          totalOldGoldAdjusted + Number(item.adjustedAmount || 0)
        );
      }
    });

    const lessUrd = roundMoney(Number(state.lessUrd || 0));
    const totalAdjustments = roundMoney(totalAdvanceAdjusted + totalOldGoldAdjusted + lessUrd);

    const unroundedNet = roundMoney(Math.max(0, subTotal - totalAdjustments));

    let roundOff = 0;
    if (state.isManualRoundOff) {
      roundOff = roundMoney(Number(state.roundOff || 0));
    } else {
      const roundedInt = Math.round(unroundedNet);
      roundOff = roundMoney(roundedInt - unroundedNet);
    }

    const netPayable = roundMoney(Math.max(0, unroundedNet + roundOff));

    const paidAmount = roundMoney(
      state.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    );
    const dueAmount = roundMoney(Math.max(0, netPayable - paidAmount));
    const inWords = numberToWordsIndian(netPayable);

    return {
      isInterState,
      totalGrossWeight,
      totalNetWeight,
      grossAmount,
      offerDiscount,
      discount,
      taxableAmount,
      cgstPercent,
      cgstAmount,
      sgstPercent,
      sgstAmount,
      igstPercent,
      igstAmount,
      totalTax,
      subTotal,
      totalAdvanceAdjusted,
      totalOldGoldAdjusted,
      totalAdjustments,
      lessUrd,
      roundOff,
      netPayable,
      paidAmount,
      dueAmount,
      inWords,
    };
  }, [
    state.items,
    state.offerDiscount,
    state.discount,
    state.cgstPercent,
    state.cgstAmount,
    state.sgstPercent,
    state.sgstAmount,
    state.igstPercent,
    state.igstAmount,
    state.lessUrd,
    state.roundOff,
    state.isManualRoundOff,
    state.placeOfSupply,
    state.customerState,
    state.payments,
    advanceAdjustmentsState,
    oldGoldAdjustmentsState,
  ]);

  // Sync payments with net payable
  const syncPaymentAmount = () => {
    setState((prev) => ({
      ...prev,
      payments: [
        {
          ...prev.payments[0],
          amount: calculations.netPayable,
        },
        ...prev.payments.slice(1).map((p) => ({ ...p, amount: "" })),
      ],
    }));
  };

  /*
  ========================================
  FORM SUBMISSION WITH ADJUSTMENTS
  ========================================
  */
  const validateForm = () => {
    const errors = {};
    if (!state.customerName?.trim()) errors.customerName = "Customer Name is required";
    if (state.customerPhone && state.customerPhone.trim().length !== 10) {
      errors.customerPhone = "Contact number must be exactly 10 digits";
    }
    if (!state.placeOfSupply?.trim()) errors.placeOfSupply = "Place of supply is required";
    if (!state.items.length) errors.items = "Add at least one item to generate an invoice";
    if (Number(calculations.paidAmount || 0) > Number(calculations.netPayable || 0) + 0.01) {
      errors.payments = "Paid Amount cannot exceed Net Payable.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitSale = async () => {
    if (!validateForm()) {
      notifyError(null, "Please correct the highlighted fields.");
      return;
    }

    try {
      setSaving(true);

      // Prepare Advance Adjustments payload
      const advanceAdjustments = [];
      Object.keys(advanceAdjustmentsState).forEach((advId) => {
        const item = advanceAdjustmentsState[advId];
        if (item?.isSelected && Number(item.adjustedAmount) > 0) {
          advanceAdjustments.push({
            advanceReceiveId: Number(advId),
            amount: Number(item.adjustedAmount),
            notes: item.notes || null,
          });
        }
      });

      // Prepare Old Jewellery Adjustments payload
      const oldGoldAdjustments = [];
      Object.keys(oldGoldAdjustmentsState).forEach((ojId) => {
        const item = oldGoldAdjustmentsState[ojId];
        if (item?.isSelected && Number(item.adjustedAmount) > 0) {
          const originalOj = availableOldJewellery.find((x) => String(x.id) === String(ojId));
          oldGoldAdjustments.push({
            purchaseId: Number(ojId),
            amount: Number(item.adjustedAmount),
            description: originalOj?.itemSummary || "Old Jewellery Value Adjusted",
            notes: item.notes || null,
          });
        }
      });

      const payload = {
        saleDate: state.saleDate,
        partyId: state.partyId ? Number(state.partyId) : null,
        customerId: state.customerId || null,
        customerName: state.customerName.trim(),
        customerPhone: state.customerPhone?.trim() || null,
        customerAddress: state.customerAddress?.trim() || null,
        customerCity: state.customerCity?.trim() || "Bhubaneswar - 766001",
        customerPan: state.customerPan?.trim().toUpperCase() || null,
        customerGst: state.customerGst?.trim().toUpperCase() || null,
        customerState: state.customerState?.trim().toUpperCase() || "ODISHA",
        placeOfSupply: state.placeOfSupply?.trim().toUpperCase() || "ODISHA",
        cinNo: state.cinNo?.trim() || null,
        storeGst: state.storeGst?.trim() || null,
        irnNo: state.irnNo?.trim() || null,
        narration: state.narration?.trim() || null,

        offerDiscount: calculations.offerDiscount,
        discount: calculations.discount,
        cgstPercent: calculations.cgstPercent,
        cgstAmount: calculations.cgstAmount,
        sgstPercent: calculations.sgstPercent,
        sgstAmount: calculations.sgstAmount,
        igstPercent: calculations.igstPercent,
        igstAmount: calculations.igstAmount,
        lessUrd: calculations.lessUrd,
        roundOff: calculations.roundOff,
        paidAmount: calculations.paidAmount,
        dueAmount: 0,

        advanceAdjustments,
        oldGoldAdjustments,

        items: state.items.map((it) => ({
          inventoryId: Number(it.inventoryId),
          particulars: it.particulars,
          itemCode: it.itemCode,
          huidNo: it.huidNo || null,
          hsnCode: it.hsnCode,
          purityName: it.purityName,
          pieces: Math.max(1, Number(it.pieces || 1)),
          grossWeight: Number(it.grossWeight || 0),
          stoneWeight: Number(it.stoneWeight || 0),
          netWeight: Number(it.netWeight || 0),
          purity: it.purity ? Number(it.purity) : null,
          rate: Number(it.rate || 0),
          metalAmount: Number(it.metalAmount || 0),
          makingCharges: Number(it.makingCharges || 0),
          makingChargeType: it.makingChargeType,
          makingChargeRate: Number(it.makingChargeRate || 0),
          stoneAmount: Number(it.stoneAmount || 0),
          otherCharges: Number(it.otherCharges || 0),
          discount: Number(it.discount || 0),
          totalAmount: Number(it.totalAmount || 0),
        })),

        payments: state.payments
          .filter((p) => Number(p.amount || 0) > 0)
          .map((p) => ({
            paymentMode: p.paymentMode,
            paymentChannel: p.paymentChannel,
            amount: Number(p.amount || 0),
            transactionId: p.transactionId || p.referenceNo,
            referenceNo: p.referenceNo || p.transactionId,
            description: p.description,
            paymentDate: p.paymentDate,
            narration: p.narration,
          })),
      };

      const result = await createSale(payload);
      notifySuccess(`Sale invoice created successfully: ${result?.invoiceNo || result?.sale?.invoiceNo}`);
      await loadData();
      setOpen(false);

      if (result?.sale || result) {
        setPreviewSale(result?.sale || result);
        setPreviewOpen(true);
      }
    } catch (error) {
      notifyError(error, "Unable to create sale. Please check values and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleViewInvoice = (sale) => {
    setPreviewSale(sale);
    setPreviewOpen(true);
  };

  const handleDownloadInvoice = async (sale) => {
    try {
      const pdf = await getSalePdf(sale.id);
      const pdfUrl = window.URL.createObjectURL(pdf);
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 10000);
    } catch (error) {
      notifyError(error, "Failed to open sale invoice.");
    }
  };

  const filteredSales = useMemo(() => {
    if (!searchFilter) return sales;
    const q = searchFilter.toLowerCase();
    return sales.filter(
      (s) =>
        (s.invoiceNo && s.invoiceNo.toLowerCase().includes(q)) ||
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        (s.party?.name && s.party.name.toLowerCase().includes(q)) ||
        (s.customerPhone && s.customerPhone.includes(q))
    );
  }, [sales, searchFilter]);

  return (
    <div className="space-y-4 font-sans">

     
 <div>
          <h1 className="text-xl font-semibold">Sales</h1>
        </div>
      {/* FILTER & SEARCH BAR */}
      <div className="flex items-center justify-between ">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by Invoice No, Customer Name, Phone..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-9 text-xs focus-visible:ring-blue-500"
          />
        </div>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm font-semibold">
          <Plus className="h-4 w-4" /> Create Sale
        </Button>
       
      </div>

      {/* SALES LIST TABLE */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
            <tr>
              <th className="p-3 text-left">Invoice No</th>
              <th className="p-3 text-left">Customer Name</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-center">Items</th>
              <th className="p-3 text-right">Taxable (₹)</th>
              <th className="p-3 text-right">Adjustments (₹)</th>
              <th className="p-3 text-right">Net Payable (₹)</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td className="p-8 text-center text-slate-400" colSpan={9}>
                  Loading sales invoices...
                </td>
              </tr>
            ) : filteredSales.length ? (
              filteredSales.map((sale) => {
                const totalAdj = Number(sale.advanceAmount || 0) + Number(sale.oldGoldAmount || 0);
                return (
                  <tr key={sale.id} className="hover:bg-blue-50/40 transition">
                    <td className="p-3 font-semibold text-blue-700">{sale.invoiceNo}</td>
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{sale.party?.name || sale.customerName || "-"}</div>
                      {sale.customerPhone && <div className="text-xs text-slate-400">{sale.customerPhone}</div>}
                    </td>
                    <td className="p-3 text-xs text-slate-600">{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString("en-IN") : "-"}</td>
                    <td className="p-3 text-center font-medium text-slate-800">{sale.items?.length || 0}</td>
                    <td className="p-3 text-right">{money(sale.taxableAmount || sale.grossTotal)}</td>
                    <td className="p-3 text-right">
                      {totalAdj > 0 ? (
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-xs">
                          -₹{money(totalAdj)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{money(sale.netPayable || sale.grossTotal)}</td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> {sale.status || "COMPLETED"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewInvoice(sale)}
                          title="View / Print Tax Invoice"
                          className="hover:text-blue-600 hover:bg-blue-50 h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                       
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="p-8 text-center text-slate-400" colSpan={9}>
                  No sales invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE SALE MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!w-[96vw] !max-w-[1440px] h-[94vh] p-0 flex flex-col bg-slate-50 border border-slate-300">
          {/* MODAL HEADER */}
          <DialogHeader className="border-b border-slate-200 px-6 py-3.5 bg-white flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">Create Jewellery Tax Invoice</DialogTitle>
                <p className="text-xs text-slate-500">
                  Scan barcode, auto-check customer history & adjustments, and complete payment.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleSubmitSale}
                disabled={saving || state.items.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
              >
                {saving ? "Generating Invoice..." : "Create"}
              </Button>
            </div>
          </DialogHeader>

          {/* MODAL SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* 1. TOP BAR: BARCODE SCANNER & STOCK PICKER */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* BARCODE SCANNER */}
                <div className="flex-1 w-full flex items-center gap-2">
                  <div className="relative flex-1">
                    <ScanBarcode className="absolute left-3 top-2.5 h-5 w-5 text-blue-600" />
                    <Input
                      ref={barcodeInputRef}
                      placeholder="Scan or type Barcode / Tag No / Inventory Code and press Enter..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={handleBarcodeScan}
                      className="pl-10 h-10 text-xs font-semibold border-blue-300 bg-white shadow-inner focus-visible:ring-blue-500"
                    />
                  </div>
                  <Button onClick={handleBarcodeScan} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-10 text-xs font-semibold">
                    <ScanBarcode className="h-4 w-4" /> Scan & Add
                  </Button>
                </div>

                {/* STOCK DROPDOWN */}
                <div className="w-full md:w-80">
                  <select
                    className="h-10 w-full rounded-md border border-blue-300 bg-white px-3 text-xs font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const id = e.target.value;
                      if (id) {
                        const selected = availableInventories.find((inv) => String(inv.id) === String(id));
                        if (selected) addInventoryItem(selected);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">-- Or Select Available Stock --</option>
                    {availableInventories.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.barcodeNo || inv.inventoryCode} | {inv.item?.name || inv.product?.name} ({inv.netWeight || inv.grossWeight}g)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. CUSTOMER & INVOICE HEADER DETAILS */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Customer & Invoice Information
                  </h3>
                  {customerFound ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Existing Customer: #{customerFound.id} {customerFound.customerCode ? `(${customerFound.customerCode})` : ""}
                    </span>
                  ) : state.customerPhone && state.customerPhone.length === 10 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      New Customer (Auto-registers on sale)
                    </span>
                  ) : null}
                </div>

                {/* VIEW HISTORY BUTTON */}
                {(customerFound || pastSalesHistory.length > 0 || allAdvancesHistory.length > 0 || allOldJewelleryHistory.length > 0 || adjustmentLogsHistory.length > 0) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryModalOpen(true)}
                    className="h-7 text-xs font-semibold text-blue-700 border-blue-300 bg-blue-50 hover:bg-blue-100 gap-1.5"
                  >
                    <History className="h-3.5 w-3.5 text-blue-600" />
                    View Customer History & Balance Logs
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                {/* CUSTOMER MASTER */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Customer Master</label>
                  <select
                    className="h-9 w-full rounded border border-slate-300 px-2.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                    value={state.partyId}
                    onChange={(e) => handlePartyChange(e.target.value)}
                  >
                    <option value="">-- Walk-in / New Customer --</option>
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} {p.phone ? `(${p.phone})` : ""}</option>
                    ))}
                  </select>
                </div>

                {/* CUSTOMER NAME */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter customer name"
                    value={state.customerName}
                    onChange={(e) => updateField("customerName", e.target.value)}
                    className={`h-9 text-xs ${validationErrors.customerName ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                  {validationErrors.customerName && (
                    <span className="text-[10px] text-red-500 font-medium block mt-0.5">{validationErrors.customerName}</span>
                  )}
                </div>

                {/* CONTACT NUMBER (WITH AUTO-CHECK) */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1 flex items-center justify-between">
                    <span>Contact No. (Phone)</span>
                    {customerLookupLoading && <span className="text-[10px] text-blue-600 font-normal animate-pulse">Checking...</span>}
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="10-digit mobile number"
                      value={state.customerPhone}
                      maxLength={10}
                      onChange={(e) => updateField("customerPhone", e.target.value.replace(/\D/g, ""))}
                      className={`h-9 text-xs pr-8 ${validationErrors.customerPhone ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                    />
                    {state.customerPhone?.length === 10 && (
                      <button
                        type="button"
                        onClick={() => handlePhoneLookup(state.customerPhone)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-blue-600"
                        title="Check Phone"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {validationErrors.customerPhone && (
                    <span className="text-[10px] text-red-500 font-medium block mt-0.5">{validationErrors.customerPhone}</span>
                  )}
                </div>

                {/* CITY */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">City</label>
                  <Input
                    placeholder="e.g. Bhubaneswar - 766001"
                    value={state.customerCity}
                    onChange={(e) => updateField("customerCity", e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                {/* ADDRESS */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Address</label>
                  <Input
                    placeholder="Street / locality address"
                    value={state.customerAddress}
                    onChange={(e) => updateField("customerAddress", e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                {/* PAN NUMBER */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Customer PAN No.</label>
                  <Input
                    placeholder="e.g. ABCDE1234F"
                    value={state.customerPan}
                    maxLength={10}
                    onChange={(e) => updateField("customerPan", e.target.value.toUpperCase())}
                    className={`h-9 text-xs uppercase ${validationErrors.customerPan ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                </div>

                {/* GSTIN */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Customer GSTIN</label>
                  <Input
                    placeholder="15-digit GSTIN"
                    value={state.customerGst}
                    maxLength={15}
                    onChange={(e) => updateField("customerGst", e.target.value.toUpperCase())}
                    className={`h-9 text-xs uppercase ${validationErrors.customerGst ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                </div>

                {/* PLACE OF SUPPLY */}
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">
                    Place of Supply <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="State e.g. ODISHA"
                    value={state.placeOfSupply}
                    onChange={(e) => updateField("placeOfSupply", e.target.value.toUpperCase())}
                    className={`h-9 text-xs uppercase font-medium ${validationErrors.placeOfSupply ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                  />
                </div>
              </div>
            </div>

            {/* 3. AVAILABLE ADJUSTMENTS SECTION (ADVANCE & OLD JEWELLERY) */}
            {(availableAdvances.length > 0 || availableOldJewellery.length > 0) && (
              <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50/40 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-emerald-700" />
                    <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Available Customer Adjustments
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800">
                    Total Selected Deductions: ₹{money(calculations.totalAdjustments)}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* AVAILABLE ADVANCES CARD */}
                  <div className="bg-white rounded-lg border border-emerald-200 p-3 shadow-xs space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                        <Receipt className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Advance Payments ({availableAdvances.length})</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        Available: ₹{money(availableAdvances.reduce((s, a) => s + a.balanceAmount, 0))}
                      </span>
                    </div>

                    {availableAdvances.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2 text-center italic">No unused advance receipts available.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {availableAdvances.map((adv) => {
                          const currentSel = advanceAdjustmentsState[adv.id] || { isSelected: false, adjustedAmount: adv.balanceAmount };
                          return (
                            <div
                              key={adv.id}
                              className={`p-2.5 rounded border transition flex flex-col gap-1.5 ${
                                currentSel.isSelected
                                  ? "bg-emerald-50 border-emerald-400 shadow-xs"
                                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-900">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(currentSel.isSelected)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setAdvanceAdjustmentsState((prev) => ({
                                        ...prev,
                                        [adv.id]: {
                                          ...prev[adv.id],
                                          isSelected: checked,
                                          adjustedAmount: checked ? adv.balanceAmount : 0,
                                        },
                                      }));
                                    }}
                                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                  />
                                  <span>{adv.receiptNo}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({adv.date ? new Date(adv.date).toLocaleDateString("en-IN") : "-"})
                                  </span>
                                </label>
                                <div className="text-right">
                                  <span className="text-slate-500 text-[10px]">Bal: </span>
                                  <span className="font-bold text-emerald-700">₹{money(adv.balanceAmount)}</span>
                                  <span className="text-slate-400 text-[10px]"> / ₹{money(adv.totalAmount)}</span>
                                </div>
                              </div>

                              {currentSel.isSelected && (
                                <div className="flex items-center gap-2 pt-1 border-t border-emerald-200 text-xs">
                                  <span className="text-slate-600 text-[11px] font-medium">Adjust (₹):</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={adv.balanceAmount}
                                    value={currentSel.adjustedAmount}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setAdvanceAdjustmentsState((prev) => ({
                                        ...prev,
                                        [adv.id]: {
                                          ...prev[adv.id],
                                          adjustedAmount: val,
                                        },
                                      }));
                                    }}
                                    className="h-7 w-28 text-xs font-bold text-emerald-800"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setAdvanceAdjustmentsState((prev) => ({
                                        ...prev,
                                        [adv.id]: {
                                          ...prev[adv.id],
                                          adjustedAmount: adv.balanceAmount,
                                        },
                                      }));
                                    }}
                                    className="h-6 text-[10px] text-emerald-700 hover:bg-emerald-100 px-2"
                                  >
                                    Full
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* AVAILABLE OLD JEWELLERY CARD */}
                  <div className="bg-white rounded-lg border border-amber-200 p-3 shadow-xs space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                        <Wallet className="h-3.5 w-3.5 text-amber-600" />
                        <span>Old Jewellery Purchases ({availableOldJewellery.length})</span>
                      </div>
                      <span className="text-[11px] text-amber-700 font-semibold">
                        Available: ₹{money(availableOldJewellery.reduce((s, oj) => s + oj.balanceAmount, 0))}
                      </span>
                    </div>

                    {availableOldJewellery.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2 text-center italic">No unused old jewellery purchases available.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {availableOldJewellery.map((oj) => {
                          const currentSel = oldGoldAdjustmentsState[oj.id] || { isSelected: false, adjustedAmount: oj.balanceAmount };
                          return (
                            <div
                              key={oj.id}
                              className={`p-2.5 rounded border transition flex flex-col gap-1.5 ${
                                currentSel.isSelected
                                  ? "bg-amber-50 border-amber-400 shadow-xs"
                                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-900">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(currentSel.isSelected)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setOldGoldAdjustmentsState((prev) => ({
                                        ...prev,
                                        [oj.id]: {
                                          ...prev[oj.id],
                                          isSelected: checked,
                                          adjustedAmount: checked ? oj.balanceAmount : 0,
                                        },
                                      }));
                                    }}
                                    className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                                  />
                                  <span>{oj.invoiceNo}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({oj.date ? new Date(oj.date).toLocaleDateString("en-IN") : "-"})
                                  </span>
                                </label>
                                <div className="text-right">
                                  <span className="text-slate-500 text-[10px]">Bal: </span>
                                  <span className="font-bold text-amber-700">₹{money(oj.balanceAmount)}</span>
                                  <span className="text-slate-400 text-[10px]"> / ₹{money(oj.totalValuation)}</span>
                                </div>
                              </div>

                              <div className="text-[11px] text-slate-600 truncate pl-6">
                                {oj.itemSummary} (Gross: {weightStr(oj.totalGrossWeight)}g)
                              </div>

                              {currentSel.isSelected && (
                                <div className="flex items-center gap-2 pt-1 border-t border-amber-200 text-xs">
                                  <span className="text-slate-600 text-[11px] font-medium">Adjust (₹):</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={oj.balanceAmount}
                                    value={currentSel.adjustedAmount}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setOldGoldAdjustmentsState((prev) => ({
                                        ...prev,
                                        [oj.id]: {
                                          ...prev[oj.id],
                                          adjustedAmount: val,
                                        },
                                      }));
                                    }}
                                    className="h-7 w-28 text-xs font-bold text-amber-800"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setOldGoldAdjustmentsState((prev) => ({
                                        ...prev,
                                        [oj.id]: {
                                          ...prev[oj.id],
                                          adjustedAmount: oj.balanceAmount,
                                        },
                                      }));
                                    }}
                                    className="h-6 text-[10px] text-amber-700 hover:bg-amber-100 px-2"
                                  >
                                    Full
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. ITEM ENTRY TABLE */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Invoice Items List ({state.items.length})
                </h3>
                <div className="text-xs font-semibold text-slate-600 flex gap-4">
                  <span>Gross Wt: <strong className="text-slate-900">{weightStr(calculations.totalGrossWeight)}g</strong></span>
                  <span>Net Wt: <strong className="text-slate-900">{weightStr(calculations.totalNetWeight)}g</strong></span>
                  <span>Gross Total: <strong className="text-blue-600">₹{money(calculations.grossAmount)}</strong></span>
                </div>
              </div>

              {state.items.length === 0 ? (
                <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-medium">No items added yet. Please scan barcode or select available stock above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                        <th className="p-2 text-center w-8">#</th>
                        <th className="p-2 text-left min-w-[140px]">Item Particulars</th>
                        <th className="p-2 text-left min-w-[90px]">Code / Tag</th>
                        <th className="p-2 text-left min-w-[70px]">Purity</th>
                        <th className="p-2 text-right w-14">Pcs</th>
                        <th className="p-2 text-right min-w-[70px]">Gross Wt(g)</th>
                        <th className="p-2 text-right min-w-[65px]">Stone Wt(g)</th>
                        <th className="p-2 text-right min-w-[70px]">Net Wt(g)</th>
                        <th className="p-2 text-right min-w-[75px]">Rate(₹/g)</th>
                        <th className="p-2 text-right min-w-[80px]">Metal Amt(₹)</th>
                        <th className="p-2 text-center min-w-[95px]">MC Type / Rate</th>
                        <th className="p-2 text-right min-w-[80px]">Making Ch.</th>
                        <th className="p-2 text-right min-w-[70px]">Stone Amt(₹)</th>
                        <th className="p-2 text-right min-w-[65px]">Other Ch.(₹)</th>
                        <th className="p-2 text-right min-w-[65px]">Disc.(₹)</th>
                        <th className="p-2 text-right min-w-[95px]">Total Amt(₹)</th>
                        <th className="p-2 text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {state.items.map((it, idx) => (
                        <tr key={it.inventoryId || idx} className="hover:bg-blue-50/20">
                          <td className="p-2 text-center font-semibold text-slate-400">{idx + 1}</td>
                          <td className="p-2 font-medium text-slate-900">{it.particulars}</td>
                          <td className="p-2 font-mono text-[11px] text-blue-700">{it.itemCode}</td>
                          <td className="p-2 font-semibold text-amber-700">{it.purityName}</td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="1"
                              value={it.pieces}
                              onChange={(e) => handleItemChange(idx, "pieces", e.target.value)}
                              className="h-7 text-right text-xs w-12 px-1"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              step="0.001"
                              value={it.grossWeight}
                              onChange={(e) => handleItemChange(idx, "grossWeight", e.target.value)}
                              className="h-7 text-right text-xs w-16 px-1 font-medium"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              step="0.001"
                              value={it.stoneWeight}
                              onChange={(e) => handleItemChange(idx, "stoneWeight", e.target.value)}
                              className="h-7 text-right text-xs w-14 px-1"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-slate-900">{formatWeight(it.netWeight)}</td>
                          <td className="p-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={it.rate}
                              onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                              className="h-7 text-right text-xs w-16 px-1 font-semibold"
                            />
                          </td>
                          <td className="p-2 text-right font-semibold text-slate-900">{money(it.metalAmount)}</td>
                          <td className="p-2">
                            <div className="flex gap-1 items-center justify-center">
                              <select
                                value={it.makingChargeType}
                                onChange={(e) => handleItemChange(idx, "makingChargeType", e.target.value)}
                                className="h-7 text-[10px] rounded border border-slate-300 bg-white px-1"
                              >
                                <option value="PERCENT">%</option>
                                <option value="PER_GRAM">/g</option>
                                <option value="FLAT">Flat</option>
                              </select>
                              <Input
                                type="number"
                                step="0.01"
                                value={it.makingChargeRate}
                                onChange={(e) => handleItemChange(idx, "makingChargeRate", e.target.value)}
                                className="h-7 text-right text-xs w-12 px-1"
                              />
                            </div>
                          </td>
                          <td className="p-2 text-right font-medium">
                            <div>{money(it.makingCharges)}</div>
                            <div className="text-[10px] text-slate-500">
                              {formatCharge(it.makingCharges, it.makingChargeType, it.makingChargeRate)}
                            </div>
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={it.stoneAmount}
                              onChange={(e) => handleItemChange(idx, "stoneAmount", e.target.value)}
                              className="h-7 text-right text-xs w-14 px-1"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={it.otherCharges}
                              onChange={(e) => handleItemChange(idx, "otherCharges", e.target.value)}
                              className="h-7 text-right text-xs w-14 px-1"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={it.discount}
                              onChange={(e) => handleItemChange(idx, "discount", e.target.value)}
                              className="h-7 text-right text-xs w-14 px-1 text-red-600 font-medium"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-blue-900">₹{money(it.totalAmount)}</td>
                          <td className="p-2 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(idx)}
                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 5. BOTTOM SECTION: PAYMENTS & SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* LEFT 7 COLS: PAYMENTS & TAX */}
              <div className="lg:col-span-7 space-y-3">
                {/* PAYMENT SECTION */}
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-blue-600" /> Payment Collection
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          payments: [...prev.payments, emptyPayment(0)],
                        }))
                      }
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold h-7 gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Payment Mode
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {state.payments.map((pRow, pIdx) => (
                      <div key={pIdx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 items-center">
                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Mode</label>
                          <select
                            className="h-8 w-full rounded border border-slate-300 px-2 text-xs bg-white"
                            value={pRow.paymentMode}
                            onChange={(e) => {
                              const val = e.target.value;
                              setState((prev) => ({
                                ...prev,
                                payments: prev.payments.map((p, i) =>
                                  i === pIdx ? { ...p, paymentMode: val } : p
                                ),
                              }));
                            }}
                          >
                            {PAYMENT_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Channel</label>
                          <select
                            className="h-8 w-full rounded border border-slate-300 px-2 text-xs bg-white"
                            value={pRow.paymentChannel}
                            onChange={(e) => {
                              const val = e.target.value;
                              setState((prev) => ({
                                ...prev,
                                payments: prev.payments.map((p, i) =>
                                  i === pIdx ? { ...p, paymentChannel: val } : p
                                ),
                              }));
                            }}
                          >
                            {PAYMENT_CHANNELS.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Amount (₹) *</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Amount"
                            value={pRow.amount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setState((prev) => ({
                                ...prev,
                                payments: prev.payments.map((p, i) =>
                                  i === pIdx ? { ...p, amount: val } : p
                                ),
                              }));
                            }}
                            className="h-8 text-xs font-bold text-slate-900"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <div className="flex-1">
                            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Ref / Tr. ID</label>
                            <Input
                              placeholder="Tr. ID / Ref"
                              value={pRow.transactionId}
                              onChange={(e) => {
                                const val = e.target.value;
                                setState((prev) => ({
                                  ...prev,
                                  payments: prev.payments.map((p, i) =>
                                    i === pIdx ? { ...p, transactionId: val, referenceNo: val } : p
                                  ),
                                }));
                              }}
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                          {state.payments.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setState((prev) => ({
                                  ...prev,
                                  payments: prev.payments.filter((_, i) => i !== pIdx),
                                }))
                              }
                              className="h-7 w-7 text-red-500 hover:text-red-700 mt-3"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button variant="ghost" size="sm" onClick={syncPaymentAmount} className="text-xs text-blue-600 hover:text-blue-700 font-semibold h-6">
                      Sync Net Payable into Payment (₹{money(calculations.netPayable)})
                    </Button>
                  </div>
                </div>

                {/* HSN / GST SUMMARY */}
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                    HSN / Tax Summary Table
                  </h3>
                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-1.5">Sr.</th>
                        <th className="p-1.5">HSN/SAC</th>
                        <th className="p-1.5 text-right">CGST %</th>
                        <th className="p-1.5 text-right">CGST Amt (₹)</th>
                        <th className="p-1.5 text-right">SGST %</th>
                        <th className="p-1.5 text-right">SGST Amt (₹)</th>
                        <th className="p-1.5 text-right">IGST %</th>
                        <th className="p-1.5 text-right">IGST Amt (₹)</th>
                        <th className="p-1.5 text-right">Total Tax (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-1.5 font-semibold">1</td>
                        <td className="p-1.5 font-semibold text-blue-700">{state.items[0]?.hsnCode || "711319"}</td>
                        <td className="p-1.5 text-right">{Number(calculations.cgstPercent).toFixed(3)}%</td>
                        <td className="p-1.5 text-right font-medium">₹{money(calculations.cgstAmount)}</td>
                        <td className="p-1.5 text-right">{Number(calculations.sgstPercent).toFixed(3)}%</td>
                        <td className="p-1.5 text-right font-medium">₹{money(calculations.sgstAmount)}</td>
                        <td className="p-1.5 text-right">{Number(calculations.igstPercent).toFixed(2)}%</td>
                        <td className="p-1.5 text-right font-medium">₹{money(calculations.igstAmount)}</td>
                        <td className="p-1.5 text-right font-bold text-blue-900">₹{money(calculations.totalTax)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* IN WORDS & REMARKS */}
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Invoice Value [ In Words ] : </span>
                    <span className="font-semibold text-slate-900 italic">{calculations.inWords}</span>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Narration / Remarks</label>
                    <Input
                      placeholder="Enter invoice remarks or narration..."
                      value={state.narration}
                      onChange={(e) => updateField("narration", e.target.value)}
                      className="h-8 text-xs focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT 5 COLS: INVOICE AMOUNT CALCULATION BREAKDOWN */}
              <div className="lg:col-span-5">
                <div className="rounded-lg border-2 border-blue-200 bg-white p-4 shadow-md space-y-2 text-xs">
                  <div className="bg-blue-50 text-blue-950 font-bold uppercase tracking-wider py-1.5 px-3 rounded text-center border border-blue-200">
                    Invoice Amount Calculation
                  </div>

                  <div className="space-y-1.5 divide-y divide-slate-100 pt-1">
                    {/* GROSS AMOUNT */}
                    <div className="flex justify-between py-1 font-medium">
                      <span className="text-slate-700">Gross Amount</span>
                      <span className="font-bold text-slate-900 text-sm">₹{money(calculations.grossAmount)}</span>
                    </div>

                    {/* OFFER DISCOUNT */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-red-600 font-medium">Offer Discount [-]</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={state.offerDiscount}
                        onChange={(e) => updateField("offerDiscount", e.target.value)}
                        className="w-28 h-7 text-right text-xs font-semibold text-red-600 focus-visible:ring-red-400"
                      />
                    </div>

                    {/* DISCOUNT */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-red-600 font-medium">Discount [-]</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={state.discount}
                        onChange={(e) => updateField("discount", e.target.value)}
                        className="w-28 h-7 text-right text-xs font-semibold text-red-600 focus-visible:ring-red-400"
                      />
                    </div>

                    {/* TAXABLE AMOUNT */}
                    <div className="flex justify-between py-1.5 font-bold bg-blue-50/60 px-2 rounded text-blue-950">
                      <span>Taxable Amount</span>
                      <span>₹{money(calculations.taxableAmount)}</span>
                    </div>

                    <div className="space-y-2 py-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-semibold block">CGST %</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={state.cgstPercent}
                            onChange={(e) => syncTaxField("cgstPercent", e.target.value)}
                            className="h-7 text-right text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-semibold block">CGST Amt</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={state.cgstAmount}
                            onChange={(e) => syncTaxField("cgstAmount", e.target.value)}
                            className="h-7 text-right text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-semibold block">SGST %</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={state.sgstPercent}
                            onChange={(e) => syncTaxField("sgstPercent", e.target.value)}
                            className="h-7 text-right text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-semibold block">SGST Amt</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={state.sgstAmount}
                            onChange={(e) => syncTaxField("sgstAmount", e.target.value)}
                            className="h-7 text-right text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-semibold block">IGST %</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={state.igstPercent}
                            onChange={(e) => syncTaxField("igstPercent", e.target.value)}
                            className="h-7 text-right text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-semibold block">IGST Amt</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={state.igstAmount}
                            onChange={(e) => syncTaxField("igstAmount", e.target.value)}
                            className="h-7 text-right text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between py-1 text-slate-600">
                        <span>CGST Amt. [ + ] ({calculations.cgstPercent}%)</span>
                        <span>₹{money(calculations.cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600">
                        <span>SGST Amt. [ + ] ({calculations.sgstPercent}%)</span>
                        <span>₹{money(calculations.sgstAmount)}</span>
                      </div>
                      {(Number(calculations.igstPercent) > 0 || Number(calculations.igstAmount) > 0) && (
                        <div className="flex justify-between py-1 text-slate-600">
                          <span>IGST Amt. [ + ] ({calculations.igstPercent}%)</span>
                          <span>₹{money(calculations.igstAmount)}</span>
                        </div>
                      )}
                    </div>

                    {/* SUB TOTAL */}
                    <div className="flex justify-between py-1.5 font-bold bg-slate-50 px-2 rounded text-slate-800">
                      <span>Sub Total</span>
                      <span>₹{money(calculations.subTotal)}</span>
                    </div>

                    {/* ADVANCE ADJUSTMENT ROW */}
                    {calculations.totalAdvanceAdjusted > 0 && (
                      <div className="flex justify-between py-1 text-emerald-700 font-semibold bg-emerald-50/60 px-2 rounded">
                        <span>Advance Adjusted [-]</span>
                        <span>-₹{money(calculations.totalAdvanceAdjusted)}</span>
                      </div>
                    )}

                    {/* OLD JEWELLERY ADJUSTMENT ROW */}
                    {calculations.totalOldGoldAdjusted > 0 && (
                      <div className="flex justify-between py-1 text-amber-700 font-semibold bg-amber-50/60 px-2 rounded">
                        <span>Old Jewellery Value [-]</span>
                        <span>-₹{money(calculations.totalOldGoldAdjusted)}</span>
                      </div>
                    )}

                    {/* LESS URD */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-700 font-medium">Less URD [-]</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={state.lessUrd}
                        onChange={(e) => updateField("lessUrd", e.target.value)}
                        className="w-28 h-7 text-right text-xs font-medium focus-visible:ring-blue-500"
                      />
                    </div>

                    {/* ROUND OFF */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-700 font-medium">Round Off [ +/- ]</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={state.roundOff}
                        onChange={(e) => {
                          setState((prev) => ({
                            ...prev,
                            roundOff: e.target.value,
                            isManualRoundOff: true,
                          }));
                        }}
                        className="w-28 h-7 text-right text-xs font-medium focus-visible:ring-blue-500"
                      />
                    </div>

                    {/* NET PAYABLE HIGHLIGHT BANNER */}
                    <div className="flex justify-between py-2.5 px-3 rounded-md bg-blue-600 text-white font-extrabold text-base items-center shadow-sm">
                      <span>Net Payable</span>
                      <span>₹{money(calculations.netPayable)}</span>
                    </div>

                    {/* PAID AMOUNT */}
                    <div className="flex justify-between py-1 text-emerald-700 font-semibold">
                      <span>Paid Amount</span>
                      <span>₹{money(calculations.paidAmount)}</span>
                    </div>

                    {/* CUSTOMER DUE AMOUNT */}
                    {calculations.dueAmount > 0.01 && (
                      <div className="flex justify-between py-1.5 px-2 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                        <span>Customer Due Balance</span>
                        <span>₹{money(calculations.dueAmount)}</span>
                      </div>
                    )}

                    {validationErrors.payments && (
                      <div className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600">
                        {validationErrors.payments}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CUSTOMER HISTORY & ADJUSTMENT LOGS DIALOG */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="!w-[90vw] !max-w-[1050px] max-h-[88vh] flex flex-col p-0 bg-white">
          <CustomerHistoryTracking
            customerName={state.customerName}
            customerPhone={state.customerPhone}
            customerId={customerFound?.id || state.customerId}
            availableAdvances={availableAdvances}
            availableOldJewellery={availableOldJewellery}
            allAdvancesHistory={allAdvancesHistory}
            allOldJewelleryHistory={allOldJewelleryHistory}
            adjustmentLogsHistory={adjustmentLogsHistory}
            pastSalesHistory={pastSalesHistory}
            activeTab={historyActiveTab}
            onTabChange={setHistoryActiveTab}
            formatMoney={money}
          />
        </DialogContent>
      </Dialog>

      {/* INVOICE PREVIEW MODAL */}
      <SalesInvoicePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        sale={previewSale}
      />
    </div>
  );
}
