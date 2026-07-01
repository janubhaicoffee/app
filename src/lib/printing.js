export function printReceipt(order, settings = {}) {
  const {
    storeName = "Janu Bhai Coffee",
    address = "Your Store Address",
    gstin = "GSTIN: 00XXXXX0000X0X0",
    thankYou = "Thank you! Visit again!",
  } = settings;

  const items = (order.pos_order_items || order.items || []).map((item) => ({
    name: item.product_name || item.name || "Item",
    qty: item.quantity || 1,
    price: parseFloat(item.total || item.price || 0),
  }));

  const total = parseFloat(order.total_amount || order.total || 0);
  const paymentMethod = order.payment_method || order.payment?.method || "Cash";
  const date = new Date(order.created_at).toLocaleString("en-IN");

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Receipt</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  body { font-family: 'Courier New', monospace; font-size: 12px; width: 72mm; margin: 0 auto; padding: 8px 4px; color: #000; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { padding: 4px 0; text-align: left; }
  th { border-bottom: 1px dashed #000; }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: bold; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  .total-row td { padding-top: 6px; font-weight: bold; font-size: 13px; }
</style></head><body>
  <div class="center bold" style="font-size: 16px;">${storeName}</div>
  <div class="center" style="font-size: 10px; margin-bottom: 4px;">${address}</div>
  <div class="center" style="font-size: 10px; margin-bottom: 8px;">${gstin}</div>
  <div class="divider"></div>
  <div style="font-size: 10px;">Order #${order.order_number || order.id}</div>
  <div style="font-size: 10px; margin-bottom: 8px;">${date}</div>
  <div class="divider"></div>
  <table>
    <tr><th>Item</th><th class="right">Qty</th><th class="right">Amount</th></tr>
    ${items.map((i) => `<tr><td>${i.name}</td><td class="right">${i.qty}</td><td class="right">₹${i.price.toFixed(2)}</td></tr>`).join("")}
  </table>
  <div class="divider"></div>
  <table>
    <tr class="total-row"><td>Total</td><td class="right">₹${total.toFixed(2)}</td></tr>
    <tr><td>Payment</td><td class="right">${paymentMethod}</td></tr>
  </table>
  <div class="divider"></div>
  <div class="center bold" style="margin-top: 8px;">${thankYou}</div>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) { alert("Please allow pop-ups to print receipts."); return; }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 500);
}

export function printLabel(orderItem, settings = {}) {
  const { storeName = "Janu Bhai Coffee" } = settings;
  const name = orderItem.product_name || orderItem.name || "Item";
  const qty = orderItem.quantity || 1;
  const orderNum = orderItem.order_number || "";
  const date = new Date(orderItem.created_at || Date.now()).toLocaleDateString("en-IN");

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Label</title>
<style>
  @page { size: 4in 6in; margin: 0; }
  body { font-family: 'Courier New', monospace; width: 3.5in; margin: 0.25in auto; padding: 0; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .barcode { font-family: 'Libre Barcode 39', monospace; font-size: 48px; margin: 16px 0; letter-spacing: 2px; }
</style></head><body>
  <div class="center bold" style="font-size: 18px;">${storeName}</div>
  <div style="margin-top: 24px;">
    <div style="font-size: 14px; margin-bottom: 8px;">Item: <span class="bold">${name}</span></div>
    <div style="font-size: 14px; margin-bottom: 8px;">Qty: ${qty}</div>
    <div style="font-size: 12px; margin-bottom: 8px;">Order: ${orderNum}</div>
    <div style="font-size: 12px; margin-bottom: 16px;">Date: ${date}</div>
    <div class="barcode center">*${orderNum || name}*</div>
  </div>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) { alert("Please allow pop-ups to print labels."); return; }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 500);
}

export function printKitchenNote(orderItem, tableName = "", settings = {}) {
  const { storeName = "Janu Bhai Coffee" } = settings;
  const name = orderItem.product_name || orderItem.name || "Item";
  const qty = orderItem.quantity || 1;
  const notes = orderItem.notes || orderItem.special_notes || "";
  const date = new Date(orderItem.created_at || Date.now()).toLocaleString("en-IN");

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Kitchen Note</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  body { font-family: 'Courier New', monospace; font-size: 14px; width: 72mm; margin: 0 auto; padding: 8px 4px; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .large { font-size: 24px; }
  .divider { border-top: 2px dashed #000; margin: 10px 0; }
  .note-box { border: 2px solid #000; padding: 10px; margin: 10px 0; font-size: 16px; }
</style></head><body>
  <div class="center bold large">KITCHEN NOTE</div>
  <div class="center" style="font-size: 12px;">${storeName}</div>
  <div class="divider"></div>
  <div style="margin: 16px 0;">
    <div style="font-size: 18px; margin-bottom: 8px;">Item: <span class="bold">${name}</span></div>
    <div style="font-size: 16px;">Quantity: ${qty}</div>
    ${tableName ? `<div style="font-size: 14px; margin-top: 8px;">Table: ${tableName}</div>` : ""}
    ${notes ? `<div class="note-box">Notes: ${notes}</div>` : ""}
  </div>
  <div class="divider"></div>
  <div style="font-size: 10px; text-align: center;">${date}</div>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) { alert("Please allow pop-ups to print kitchen notes."); return; }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 500);
}
