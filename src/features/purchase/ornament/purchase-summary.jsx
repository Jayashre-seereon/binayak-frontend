export default function PurchaseSummary({ items }) {

  const subtotal = items.reduce(
    (sum, i) =>
      sum +
      Number(i.metalCost || 0) +
      Number(i.stoneCost || 0) +
      Number(i.other || 0),
    0
  );

  const igst = subtotal * 0.03;
  const cgst = subtotal * 0.015;
  const sgst = subtotal * 0.015;

  const total = subtotal + igst + cgst + sgst;

  return (
    <div className="flex justify-end">
      <div className="bg-white border rounded-lg p-4 w-72 space-y-2">

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>IGST (3%)</span>
          <span>₹{igst.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>CGST (1.5%)</span>
          <span>₹{cgst.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>SGST (1.5%)</span>
          <span>₹{sgst.toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-semibold border-t pt-2">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

      </div>
    </div>
  );
}