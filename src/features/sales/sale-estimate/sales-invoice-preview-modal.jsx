import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { getSalePdf } from "./sale-estimate-api";
import { notifyError } from "@/utils/notify";
import { formatCharge, formatWeight } from "@/utils/units";
import InvoiceBrandHeader from "@/components/invoice-brand-header";

const money = (val) => Number(val || 0).toFixed(2);

const formatDateTime = (dateVal) => {
  if (!dateVal) return "-";
  const d = new Date(dateVal);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}/${month}/${year} / ${String(hours).padStart(2, "0")}:${minutes}:${ampm}`;
};

export default function SalesInvoicePreviewModal({ open, onOpenChange, sale }) {
  const printRef = useRef(null);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const blob = await getSalePdf(sale.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${sale.invoiceNo || sale.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err) {
      notifyError(err, "Failed to download PDF invoice.");
    }
  };

  const items = sale.items || [];
  const primaryPayment = sale.payments?.[0];
  const paymentModeName = primaryPayment?.paymentChannel || (primaryPayment?.paymentMode ? `By ${primaryPayment.paymentMode}` : "By PhonePe");
  const paidAmountVal = sale.paidAmount || primaryPayment?.amount || sale.netPayable || 0;
  const trId = primaryPayment?.transactionId || primaryPayment?.referenceNo || "-";
  const pDesc = primaryPayment?.description || primaryPayment?.narration || "UPI/QR CODE RECEIPT";

  const totalGrossWt = items.reduce((sum, it) => sum + Number(it.grossWeight || 0), 0);
  const totalNetWt = items.reduce((sum, it) => sum + Number(it.netWeight || 0), 0);
  const totalAmountVal = sale.grossAmount || items.reduce((sum, it) => sum + Number(it.totalAmount || 0), 0);

  const cgstP = sale.cgstPercent !== undefined ? sale.cgstPercent : 1.5;
  const cgstA = sale.cgstAmount || (sale.taxableAmount ? (sale.taxableAmount * cgstP) / 100 : sale.cgst || 0);
  const sgstP = sale.sgstPercent !== undefined ? sale.sgstPercent : 1.5;
  const sgstA = sale.sgstAmount || (sale.taxableAmount ? (sale.taxableAmount * sgstP) / 100 : sale.sgst || 0);
  const igstP = sale.igstPercent !== undefined ? sale.igstPercent : 0.0;
  const igstA = sale.igstAmount || (sale.taxableAmount ? (sale.taxableAmount * igstP) / 100 : sale.igst || 0);
  const totalTaxA = sale.totalTax || (cgstA + sgstA + igstA) || sale.taxAmount || 0;

  const offerDisc = Number(sale.offerDiscount || 0);
  const addDisc = Number(sale.discount || 0);
  const taxableAmt = Number(sale.taxableAmount || (totalAmountVal - offerDisc - addDisc));
  const subTotalAmt = Number(sale.subTotal || (taxableAmt + cgstA + sgstA + igstA));
  const lessUrdAmt = Number(sale.lessUrd || 0);
  const roundOffAmt = Number(sale.roundOff || 0);
  const netPayableAmt = Number(sale.netPayable || sale.grossTotal || (subTotalAmt - lessUrdAmt + roundOffAmt));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-[900px] max-h-[95vh] overflow-y-auto p-0 print:p-0 print:max-w-none print:w-full print:shadow-none print:border-none">
        {/* ACTION BAR (Hidden in print) */}
        <div className="flex items-center justify-between border-b px-6 py-3 bg-gray-50 print:hidden">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">Tax Invoice: {sale.invoiceNo}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <Button size="sm" onClick={handlePrint} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        </div>

        {/* INVOICE SHEET CONTAINER */}
        <div
          ref={printRef}
          className="p-8 bg-white text-black font-sans text-xs leading-tight print:p-4 print:text-[11px]"
          style={{ minHeight: "800px" }}
        >
          <InvoiceBrandHeader store={sale.store} />
          {/* HEADER */}
          <div className="relative mb-4 mt-4">
            <div className="text-center">
              <h1 className="text-lg font-bold tracking-wider uppercase">TAX INVOICE</h1>
            </div>
            <div className="absolute right-0 top-0 text-right">
              <div className="text-xs font-semibold text-gray-700">
                {sale.store?.storeName || "Bhubaneswar"} Branch
              </div>
            </div>
          </div>

          {/* CUSTOMER & INVOICE DETAILS GRID */}
          <div className="grid grid-cols-2 gap-4 pb-3 mb-2 text-xs border-b border-gray-300">
            {/* LEFT: CUSTOMER DETAILS */}
            <div className="space-y-1">
              {(sale.customerId || sale.customer?.id || sale.customer?.customerCode) && (
                <div className="grid grid-cols-[85px_10px_1fr]">
                  <span className="font-semibold text-gray-700">Customer ID</span>
                  <span>:</span>
                  <span className="font-bold text-blue-700">
                    #{sale.customerId || sale.customer?.id} {sale.customer?.customerCode ? `(${sale.customer?.customerCode})` : ""}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span className="font-semibold text-gray-700">Name</span>
                <span>:</span>
                <span className="font-bold uppercase">{sale.party?.name || sale.customerName || "-"}</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span className="font-semibold text-gray-700">Address</span>
                <span>:</span>
                <span>{sale.party?.address || sale.customerAddress || "-"}</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span className="font-semibold text-gray-700">City</span>
                <span>:</span>
                <span>{sale.customerCity || "Bhubaneswar - 766001"}</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span className="font-semibold text-gray-700">Contact No.</span>
                <span>:</span>
                <span>{sale.party?.phone || sale.customerPhone || "-"}</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span className="font-semibold text-gray-700">PAN No.</span>
                <span>:</span>
                <span>{sale.customerPan || ""}</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span className="font-semibold text-gray-700">GST No.</span>
                <span>:</span>
                <span>{sale.party?.gst || sale.customerGst || ""}</span>
              </div>
              <div className="grid grid-cols-[85px_10px_1fr]">
                <span className="font-semibold text-gray-700">State</span>
                <span>:</span>
                <span className="uppercase">{sale.customerState || sale.store?.state || "ODISHA"}</span>
              </div>
            </div>

            {/* RIGHT: INVOICE / STORE DETAILS */}
            <div className="space-y-1">
              <div className="grid grid-cols-[105px_10px_1fr]">
                <span className="font-semibold text-gray-700">CIN No.</span>
                <span>:</span>
                <span>{sale.cinNo || sale.store?.cinNo || "U36911OR2005PTCC008217"}</span>
              </div>
              <div className="grid grid-cols-[105px_10px_1fr]">
                <span className="font-semibold text-gray-700">GST No.</span>
                <span>:</span>
                <span>{sale.storeGst || sale.store?.gstNo || "21AAFCA3795A1Z5"}</span>
              </div>
              <div className="grid grid-cols-[105px_10px_1fr]">
                <span className="font-semibold text-gray-700">Place of Supply</span>
                <span>:</span>
                <span className="uppercase">{sale.placeOfSupply || sale.customerState || "ODISHA"}</span>
              </div>
              <div className="grid grid-cols-[105px_10px_1fr]">
                <span className="font-semibold text-gray-700">Invoice No.</span>
                <span>:</span>
                <span className="font-bold">{sale.invoiceNo}</span>
              </div>
              <div className="grid grid-cols-[105px_10px_1fr]">
                <span className="font-semibold text-gray-700">Date</span>
                <span>:</span>
                <span>{formatDateTime(sale.saleDate)}</span>
              </div>
            </div>
          </div>

          {/* ITEM DETAILS TABLE */}
          <div className="border border-gray-400 mb-3">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400 font-bold text-center">
                  <th className="p-1.5 border-r border-gray-400 w-8">Sr.<br />No.</th>
                  <th className="p-1.5 border-r border-gray-400 text-left min-w-[140px]">Particulars</th>
                  <th className="p-1.5 border-r border-gray-400 w-14">HSN</th>
                  <th className="p-1.5 border-r border-gray-400 w-12">Purity</th>
                  <th className="p-1.5 border-r border-gray-400 w-8">Pcs</th>
                  <th className="p-1.5 border-r border-gray-400 w-16 text-right">Gross Wt.<br />[Gm.]</th>
                  <th className="p-1.5 border-r border-gray-400 w-16 text-right">Net Wt.<br />[Gm.]</th>
                  <th className="p-1.5 border-r border-gray-400 w-18 text-right">Rate<br />[Gm/Pc]</th>
                  <th className="p-1.5 border-r border-gray-400 w-18 text-right">Making<br />Charges</th>
                  <th className="p-1.5 border-r border-gray-400 w-14 text-right">Other<br />Charges</th>
                  <th className="p-1.5 text-right w-20">Total<br />Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const inv = it.inventory;
                  const prodName = (it.particulars || inv?.item?.name || inv?.product?.name || "EARRING").toUpperCase();
                  const codeStr = it.itemCode || inv?.barcodeNo || inv?.tagNo || inv?.inventoryCode || "";
                  const purityStr = it.purityName || (inv?.purityMaster?.name || (it.purity ? `${it.purity}K` : "22K"));
                  const huidStr = it.huidNo || inv?.huidNo || "";
                  const makingStr = formatCharge(it.makingCharges, it.makingChargeType, it.makingChargeRate);

                  return (
                    <tr key={idx} className="border-b border-gray-300 align-top">
                      <td className="p-1.5 border-r border-gray-300 text-center">{idx + 1}</td>
                      <td className="p-1.5 border-r border-gray-300">
                        <div className="font-bold">{prodName}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1.5">
                          {codeStr && <span>{codeStr}</span>}
                          {huidStr && <span className="font-mono font-semibold text-blue-900">| HUID: {huidStr}</span>}
                        </div>
                      </td>
                      <td className="p-1.5 border-r border-gray-300 text-center">{it.hsnCode || "711319"}</td>
                      <td className="p-1.5 border-r border-gray-300 text-center">{purityStr}</td>
                      <td className="p-1.5 border-r border-gray-300 text-center">{it.pieces || 1}</td>
                      <td className="p-1.5 border-r border-gray-300 text-right">{formatWeight(it.grossWeight)}</td>
                      <td className="p-1.5 border-r border-gray-300 text-right">{formatWeight(it.netWeight)}</td>
                      <td className="p-1.5 border-r border-gray-300 text-right">{money(it.rate)}</td>
                      <td className="p-1.5 border-r border-gray-300 text-right">
                        <div>{makingStr}</div>
                        <div className="text-[10px] text-gray-500">
                          {it.makingChargeType === "PER_GRAM" ? "Per gram charge" : it.makingChargeType === "PERCENT" ? "Percent charge" : "Flat charge"}
                        </div>
                      </td>
                      <td className="p-1.5 border-r border-gray-300 text-right">{money(it.otherCharges || it.otherAmount)}</td>
                      <td className="p-1.5 text-right font-bold">{money(it.totalAmount)}</td>
                    </tr>
                  );
                })}
                {/* TOTAL ROW */}
                <tr className="border-t border-gray-400 bg-gray-50 font-bold">
                  <td colSpan={5} className="p-1.5 border-r border-gray-400">Total</td>
                  <td className="p-1.5 border-r border-gray-400 text-right">{formatWeight(totalGrossWt)}</td>
                  <td className="p-1.5 border-r border-gray-400 text-right">{formatWeight(totalNetWt)}</td>
                  <td colSpan={3} className="p-1.5 border-r border-gray-400"></td>
                  <td className="p-1.5 text-right">{money(totalAmountVal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* LOWER SECTION GRID */}
          <div className="grid grid-cols-[1.3fr_1fr] gap-4">
            {/* LOWER LEFT COLUMN */}
            <div className="space-y-3">
              {/* PAYMENT DETAILS */}
              <div className="space-y-0.5">
                <div className="font-bold text-xs">{paymentModeName.startsWith("By") ? paymentModeName : `By ${paymentModeName}`}</div>
                <div className="font-bold text-xs">{money(paidAmountVal)}</div>
                <div className="text-[10px] text-gray-600">
                  Online :{primaryPayment?.paymentChannel || "PhonePe"}Tr.Id:{trId},{pDesc},Description :]
                </div>
              </div>

              {/* HSN SUMMARY TABLE */}
              <div className="border border-gray-400">
                <div className="text-center font-bold text-[11px] py-0.5 bg-gray-100 border-b border-gray-400">
                  HSN SUMMARY
                </div>
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300 font-bold text-center">
                      <th className="p-1 border-r border-gray-300">Sr.</th>
                      <th className="p-1 border-r border-gray-300">HSN/SAC</th>
                      <th className="p-1 border-r border-gray-300 text-right">CGST%</th>
                      <th className="p-1 border-r border-gray-300 text-right">CGST Amt.</th>
                      <th className="p-1 border-r border-gray-300 text-right">SGST%</th>
                      <th className="p-1 border-r border-gray-300 text-right">SGST Amt.</th>
                      <th className="p-1 border-r border-gray-300 text-right">IGST%</th>
                      <th className="p-1 border-r border-gray-300 text-right">IGST Amt.</th>
                      <th className="p-1 text-right">Total Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 border-r border-gray-300 text-center">1</td>
                      <td className="p-1 border-r border-gray-300 text-center">{items[0]?.hsnCode || "711319"}</td>
                      <td className="p-1 border-r border-gray-300 text-right">{Number(cgstP).toFixed(3)}</td>
                      <td className="p-1 border-r border-gray-300 text-right">{money(cgstA)}</td>
                      <td className="p-1 border-r border-gray-300 text-right">{Number(sgstP).toFixed(3)}</td>
                      <td className="p-1 border-r border-gray-300 text-right">{money(sgstA)}</td>
                      <td className="p-1 border-r border-gray-300 text-right">{Number(igstP).toFixed(2)}</td>
                      <td className="p-1 border-r border-gray-300 text-right">{money(igstA)}</td>
                      <td className="p-1 text-right">{money(totalTaxA)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* INVOICE VALUE IN WORDS */}
              <div className="text-xs">
                <span className="font-bold">Invoice Value [ In Words ] : </span>
                <span className="italic">{sale.amountInWords || "Twenty Six Thousand Nine Hundred and Forty Four Rupees Only."}</span>
              </div>

              {/* NARRATION & IRN */}
              <div className="space-y-0.5 text-xs">
                <div><span className="font-bold">Narration : </span><span>{sale.narration || ""}</span></div>
                <div><span className="font-bold">IRN No. : </span><span>{sale.irnNo || ""}</span></div>
              </div>

              {/* THANK YOU & TERMS */}
              <div className="pt-2">
                <div className="font-bold text-xs mb-2">
                  {sale.store?.tagline || `Thank You For Visit ${sale.store?.storeName || "Binayak Jewellers"} ...`}
                </div>
                <div className="text-[10px] text-gray-500 leading-tight space-y-0.5">
                  <div>I have verified the Weight & Pieces & found ok</div>
                  <div>I hereby agree to the Terms & Conditions mentioned backside</div>
                </div>
                <div className="pt-6 font-bold text-xs">Customer Signature:</div>
              </div>
            </div>

            {/* LOWER RIGHT COLUMN: AMOUNT BREAKDOWN */}
            <div className="border border-gray-400 p-2.5 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Gross Amount</span>
                <span className="font-semibold">{money(totalAmountVal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Offer Discount [-]</span>
                <span>{money(offerDisc)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount [-]</span>
                <span>{money(addDisc)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-b border-gray-300 py-1">
                <span>Taxable Amount</span>
                <span>{money(taxableAmt)}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST Amt. [ + ]</span>
                <span>{money(cgstA)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST Amt. [ + ]</span>
                <span>{money(sgstA)}</span>
              </div>
              <div className="flex justify-between">
                <span>IGST Amt. [ + ]</span>
                <span>{money(igstA)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-b border-gray-300 py-1">
                <span>Sub Total</span>
                <span>{money(subTotalAmt)}</span>
              </div>
              {Number(sale.advanceAmount || 0) > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Advance Adj. [-]</span>
                  <span>{money(sale.advanceAmount)}</span>
                </div>
              )}
              {Number(sale.oldGoldAmount || lessUrdAmt || 0) > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Old Jewellery / Less URD [-]</span>
                  <span>{money(sale.oldGoldAmount || lessUrdAmt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Round Off [ +/- ]</span>
                <span>{money(roundOffAmt)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm border-t-2 border-b-2 border-black py-1 bg-gray-50">
                <span>Net Payable</span>
                <span>{money(netPayableAmt)}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Paid Amount</span>
                <span>{money(sale.paidAmount || paidAmountVal)}</span>
              </div>
              {Number(sale.dueAmount ?? Math.max(0, netPayableAmt - (sale.paidAmount || paidAmountVal))) > 0 && (
                <div className="flex justify-between font-bold text-red-600">
                  <span>Due Amount</span>
                  <span>{money(sale.dueAmount ?? Math.max(0, netPayableAmt - (sale.paidAmount || paidAmountVal)))}</span>
                </div>
              )}

              <div className="pt-2 text-xs">
                <div className="font-bold">Cashier : {sale.cashierName || "AdityaSahoo"}</div>
              </div>

              <div className="pt-6 text-right">
                <div className="text-[10px] text-gray-500">For {sale.store?.storeName || "Binayak Jewellers"}</div>
                <div className="pt-6 font-bold text-xs">Authorised Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
