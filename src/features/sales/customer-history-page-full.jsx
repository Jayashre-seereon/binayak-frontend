import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  History,
  FileClock,
  IndianRupee,
} from "lucide-react";

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

const getValue = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== "") {
      return obj[key];
    }
  }
  return null;
};

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <FileClock className="h-9 w-9 mb-2 opacity-50" />
      <p className="text-xs">{message}</p>
    </div>
  );
}

function TableWrapper({ children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[650px] text-xs">{children}</table>
    </div>
  );
}

function TableHead({ children }) {
  return <thead className="bg-slate-100 border-b border-slate-200">{children}</thead>;
}

function Th({ children, className = "" }) {
  return (
    <th className={`px-3 py-2.5 text-left font-bold text-slate-600 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-3 py-2.5 border-b border-slate-100 text-slate-700 whitespace-nowrap ${className}`}>{children}</td>
  );
}

export default function CustomerHistoryPageFull({
  open,
  onOpenChange,
  customerName,
  customerPhone,
  customerId,
  availableAdvances = [],
  availableOldJewellery = [],
  allAdvancesHistory = [],
  allOldJewelleryHistory = [],
  adjustmentLogsHistory = [],
  pastSalesHistory = [],
  historyActiveTab: historyActiveTabProp,
  setHistoryActiveTab,
}) {
  const [historyActiveTabInternal, setHistoryActiveTabInternal] = React.useState(
    historyActiveTabProp || "logs"
  );
  const historyActiveTab = historyActiveTabProp || historyActiveTabInternal;
  const setHistoryActiveTabLocal = (key) => {
    if (setHistoryActiveTab) setHistoryActiveTab(key);
    else setHistoryActiveTabInternal(key);
  };

  const unusedAdvance = availableAdvances.reduce((sum, item) => sum + Number(item?.balanceAmount || item?.amount || 0), 0);
  const unusedOldGold = availableOldJewellery.reduce(
    (sum, item) => sum + Number(item?.balanceAmount || item?.adjustableAmount || item?.totalAmount || item?.amount || 0),
    0
  );

  const tabs = [
    { key: "logs", label: "Adjustment Logs", count: adjustmentLogsHistory.length },
    { key: "advances", label: "Advance History", count: allAdvancesHistory.length },
    { key: "oldGold", label: "Old Jewellery", count: allOldJewelleryHistory.length },
    { key: "sales", label: "Sales History", count: pastSalesHistory.length },
  ];

  const isModal = open !== undefined;
  const Container = isModal ? DialogContent : (props) => <div {...props} />;
  const Header = isModal ? DialogHeader : (props) => <div {...props} />;
  const Title = isModal ? DialogTitle : (props) => <div {...props} />;

  const renderAdjustmentLogs = () => {
    if (!adjustmentLogsHistory || adjustmentLogsHistory.length === 0) return <EmptyState message="No adjustment logs found for this customer." />;
    return (
      <TableWrapper>
        <TableHead>
          <tr>
            <Th>Date</Th>
            <Th>Invoice</Th>
            <Th>Type</Th>
            <Th className="text-right">Amount</Th>
            <Th>Status</Th>
          </tr>
        </TableHead>
        <tbody>
          {adjustmentLogsHistory.map((log, i) => (
            <tr key={log?.id || i} className="hover:bg-slate-50">
              <Td>{formatDate(getValue(log, "date", "createdAt", "adjustmentDate"))}</Td>
              <Td className="font-semibold text-blue-700">{getValue(log, "invoiceNo", "referenceNo") || "-"}</Td>
              <Td>{String(getValue(log, "type", "adjustmentType") || "-").toUpperCase()}</Td>
              <Td className="text-right">₹{money(Number(getValue(log, "amount", "adjustedAmount") || 0))}</Td>
              <Td>{getValue(log, "status") || "ADJUSTED"}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    );
  };

  const renderAdvances = () => {
    if (!allAdvancesHistory || allAdvancesHistory.length === 0) return <EmptyState message="No advance payment history found." />;
    return (
      <TableWrapper>
        <TableHead>
          <tr>
            <Th>Date</Th>
            <Th>Receipt</Th>
            <Th className="text-right">Amount</Th>
            <Th className="text-right">Balance</Th>
          </tr>
        </TableHead>
        <tbody>
          {allAdvancesHistory.map((a, i) => (
            <tr key={a?.id || i} className="hover:bg-slate-50">
              <Td>{formatDate(getValue(a, "date", "createdAt", "paymentDate"))}</Td>
              <Td className="font-semibold text-blue-700">{getValue(a, "receiptNo", "reference") || `ADV-${a?.id || i}`}</Td>
              <Td className="text-right">₹{money(Number(getValue(a, "amount", "totalAmount") || 0))}</Td>
              <Td className="text-right">₹{money(Number(getValue(a, "balanceAmount", "availableAmount") || 0))}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    );
  };

  const renderOldGold = () => {
    if (!allOldJewelleryHistory || allOldJewelleryHistory.length === 0) return <EmptyState message="No old jewellery history found." />;
    return (
      <TableWrapper>
        <TableHead>
          <tr>
            <Th>Date</Th>
            <Th>Invoice</Th>
            <Th className="text-right">Valuation (₹)</Th>
            <Th className="text-right">Available (₹)</Th>
          </tr>
        </TableHead>
        <tbody>
          {allOldJewelleryHistory.map((o, i) => (
            <tr key={o?.id || i} className="hover:bg-slate-50">
              <Td>{formatDate(getValue(o, "date", "createdAt"))}</Td>
              <Td className="font-semibold text-amber-700">{getValue(o, "invoiceNo") || `OLD-${o?.id || i}`}</Td>
              <Td className="text-right">₹{money(Number(getValue(o, "totalValuation", "amount") || 0))}</Td>
              <Td className="text-right">₹{money(Number(getValue(o, "balanceAmount", "availableAmount") || 0))}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    );
  };

  const renderSales = () => {
    if (!pastSalesHistory || pastSalesHistory.length === 0) return <EmptyState message="No previous sales found." />;
    return (
      <TableWrapper>
        <TableHead>
          <tr>
            <Th>Date</Th>
            <Th>Invoice</Th>
            <Th className="text-right">Gross Total</Th>
            <Th className="text-right">Paid</Th>
            <Th className="text-right">Due</Th>
          </tr>
        </TableHead>
        <tbody>
          {pastSalesHistory.map((s, i) => (
            <tr key={s?.id || i} className="hover:bg-slate-50">
              <Td>{formatDate(getValue(s, "saleDate", "date", "createdAt"))}</Td>
              <Td className="font-semibold text-blue-700">{getValue(s, "invoiceNo", "saleNo") || "-"}</Td>
              <Td className="text-right">₹{money(Number(getValue(s, "grossTotal", "totalAmount", "grandTotal") || getValue(s, "netPayable") || 0))}</Td>
              <Td className="text-right">₹{money(Number(getValue(s, "paidAmount", "paid") || 0))}</Td>
              <Td className="text-right">₹{money(Number(getValue(s, "dueAmount", "due") || 0))}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    );
  };

  const content = (
    <>
      <Header className="border-b border-slate-200 px-6 py-4 bg-slate-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <Title className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Customer History & Adjustment Tracking
            </Title>
            <p className="text-xs text-slate-500 mt-1">Customer: <strong className="text-slate-700">{customerName || "Customer"}</strong> ({customerPhone || "-"}) | ID: #{customerId || "-"}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded border border-emerald-200 font-medium">Unused Advance: <strong>₹{money(unusedAdvance)}</strong></div>
            <div className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded border border-amber-200 font-medium">Unused Old Jewellery: <strong>₹{money(unusedOldGold)}</strong></div>
          </div>
        </div>
      </Header>

      <div className="px-6 pt-3 border-b border-slate-200 bg-white">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setHistoryActiveTabLocal(t.key)} className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${historyActiveTab === t.key ? "text-blue-700 border-blue-600 bg-blue-50/50" : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"}`}>
              <span className="text-[12px] font-medium">{t.label}</span>
              <span className={`min-w-[20px] px-1.5 py-0.5 rounded-full text-[10px] ${historyActiveTab === t.key ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {historyActiveTab === "logs" && renderAdjustmentLogs()}
        {historyActiveTab === "advances" && renderAdvances()}
        {historyActiveTab === "oldGold" && renderOldGold()}
        {historyActiveTab === "sales" && renderSales()}
      </div>
    </>
  );

  if (isModal) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <Container className="!w-[90vw] !max-w-[1150px] max-h-[88vh] flex flex-col p-0 bg-white overflow-hidden">
          {content}

          <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><IndianRupee className="h-3.5 w-3.5" />History is linked with customer phone number.</div>
            <button type="button" onClick={() => (onOpenChange ? onOpenChange(false) : null)} className="h-8 px-4 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100">Close</button>
          </div>
        </Container>
      </Dialog>
    );
  }

  return (
    <div className="max-w-[1150px] w-full mx-auto bg-white rounded shadow-sm overflow-hidden">
      <Container className="flex flex-col p-0 bg-white">{content}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><IndianRupee className="h-3.5 w-3.5" />History is linked with customer phone number.</div>
        </div>
      </Container>
    </div>
  );
}
