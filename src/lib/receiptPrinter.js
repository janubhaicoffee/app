const COMMON_SERVICE_UUIDS = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  '00001101-0000-1000-8000-00805f9b34fb',
  '00001800-0000-1000-8000-00805f9b34fb',
];

const COMMON_CHAR_UUIDS = [
  '00002af1-0000-1000-8000-00805f9b34fb',
  '00002af2-0000-1000-8000-00805f9b34fb',
  '00001101-0000-1000-8000-00805f9b34fb',
  '00001801-0000-1000-8000-00805f9b34fb',
];

let bluetoothDevice = null;
let cachedCharacteristic = null;

function escposText(text, opts = {}) {
  const { bold, align, size } = opts;
  const encoder = new TextEncoder('gbk');
  const bytes = [];

  if (align === 'center') bytes.push(0x1b, 0x61, 0x01);
  else if (align === 'right') bytes.push(0x1b, 0x61, 0x02);
  else bytes.push(0x1b, 0x61, 0x00);

  if (bold) bytes.push(0x1b, 0x45, 0x01);
  else bytes.push(0x1b, 0x45, 0x00);

  if (size) {
    const n = Math.min(7, Math.max(0, size - 1));
    bytes.push(0x1d, 0x21, n | (n << 4));
  }

  const encoded = encoder.encode(text + '\n');
  for (const b of encoded) bytes.push(b);
  bytes.push(0x0a);
  return new Uint8Array(bytes);
}

function escposInit() {
  return new Uint8Array([0x1b, 0x40]);
}

function escposCut() {
  return new Uint8Array([0x1d, 0x56, 0x00]);
}

function escposFeed(n = 3) {
  return new Uint8Array([0x1b, 0x64, n]);
}

function escposDivider(char = '-', length = 32) {
  const encoder = new TextEncoder('gbk');
  const bytes = [];
  bytes.push(0x1b, 0x61, 0x01);
  const line = char.repeat(length) + '\n';
  const encoded = encoder.encode(line);
  for (const b of encoded) bytes.push(b);
  return new Uint8Array(bytes);
}

function buildReceiptData(order, settings = {}) {
  const {
    storeName = 'Janu Bhai Coffee',
    address = '',
    gstin = '',
    thankYou = 'Thank you! Visit again!',
  } = settings;

  const items = (order.pos_order_items || order.items || []).map((item) => ({
    name: item.product_name || item.name || 'Item',
    qty: item.quantity || 1,
    price: parseFloat(item.total || item.price || 0),
    unitPrice: parseFloat(item.unit_price || item.price || 0),
  }));

  const total = parseFloat(order.total_amount || order.total || 0);
  const paymentMethod = order.payment_method || order.payment?.method || 'Cash';
  const date = order.created_at
    ? new Date(order.created_at).toLocaleString('en-IN')
    : new Date().toLocaleString('en-IN');

  const chunks = [];

  chunks.push(escposInit());
  chunks.push(escposText(storeName, { align: 'center', bold: true, size: 2 }));
  if (address) chunks.push(escposText(address, { align: 'center' }));
  if (gstin) chunks.push(escposText(gstin, { align: 'center' }));
  chunks.push(escposDivider());
  chunks.push(escposText(`Order #${order.order_number || order.id}`, { align: 'center' }));
  chunks.push(escposText(date, { align: 'center' }));
  chunks.push(escposDivider());

  for (const item of items) {
    const line = `${item.name} x${item.qty}`;
    const amount = `₹${item.price.toFixed(2)}`;
    const padding = Math.max(1, 32 - line.length - amount.length);
    chunks.push(escposText(line + ' '.repeat(padding) + amount));
  }

  chunks.push(escposDivider());
  chunks.push(escposText(`Total: ₹${total.toFixed(2)}`, { align: 'right', bold: true, size: 1 }));
  chunks.push(escposText(`Payment: ${paymentMethod}`, { align: 'right' }));
  chunks.push(escposDivider());
  chunks.push(escposText(thankYou, { align: 'center', bold: true }));
  chunks.push(escposFeed(3));
  chunks.push(escposCut());

  const totalLength = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

function buildKitchenNoteData(orderItem, tableName = '', settings = {}) {
  const { storeName = 'Janu Bhai Coffee' } = settings;
  const name = orderItem.product_name || orderItem.name || 'Item';
  const qty = orderItem.quantity || 1;
  const notes = orderItem.notes || orderItem.special_notes || '';
  const date = new Date(orderItem.created_at || Date.now()).toLocaleString('en-IN');

  const chunks = [];
  chunks.push(escposInit());
  chunks.push(escposText('*** KITCHEN NOTE ***', { align: 'center', bold: true, size: 2 }));
  chunks.push(escposText(storeName, { align: 'center' }));
  chunks.push(escposDivider());
  chunks.push(escposText(`Item: ${name}`, { bold: true, size: 1 }));
  chunks.push(escposText(`Qty: ${qty}`, { bold: true }));
  if (tableName) chunks.push(escposText(`Table: ${tableName}`));
  if (notes) {
    chunks.push(escposDivider());
    chunks.push(escposText(`Notes: ${notes}`, { bold: true }));
  }
  chunks.push(escposDivider());
  chunks.push(escposText(date, { align: 'center' }));
  chunks.push(escposFeed(3));
  chunks.push(escposCut());

  const totalLength = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

function isWebBluetoothSupported() {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

export async function connectBluetoothPrinter() {
  if (!isWebBluetoothSupported()) {
    throw new Error('Web Bluetooth not supported on this device/browser');
  }

  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: COMMON_SERVICE_UUIDS,
    });

    bluetoothDevice = device;

    device.addEventListener('gattserverdisconnected', () => {
      cachedCharacteristic = null;
    });

    const server = await device.gatt.connect();
    let characteristic = null;

    for (const serviceUuid of COMMON_SERVICE_UUIDS) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        for (const charUuid of COMMON_CHAR_UUIDS) {
          try {
            characteristic = await service.getCharacteristic(charUuid);
            if (characteristic) break;
          } catch {}
        }
        if (characteristic) break;
      } catch {}
    }

    if (!characteristic) {
      for (const service of server.services?.() || []) {
        for (const char of service.characteristics?.() || []) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            characteristic = char;
            break;
          }
        }
        if (characteristic) break;
      }
    }

    if (!characteristic) {
      throw new Error('Could not find a writable characteristic on the printer');
    }

    cachedCharacteristic = characteristic;
    return { deviceName: device.name || 'Bluetooth Printer' };
  } catch (err) {
    cachedCharacteristic = null;
    throw err;
  }
}

export async function disconnectBluetoothPrinter() {
  if (bluetoothDevice && bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
  }
  bluetoothDevice = null;
  cachedCharacteristic = null;
}

async function sendToBluetooth(data) {
  if (!cachedCharacteristic) {
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
      const server = bluetoothDevice.gatt;
      for (const serviceUuid of COMMON_SERVICE_UUIDS) {
        try {
          const service = await server.getPrimaryService(serviceUuid);
          for (const charUuid of COMMON_CHAR_UUIDS) {
            try {
              cachedCharacteristic = await service.getCharacteristic(charUuid);
              if (cachedCharacteristic) break;
            } catch {}
          }
          if (cachedCharacteristic) break;
        } catch {}
      }
    }
    if (!cachedCharacteristic) {
      throw new Error('Printer not connected. Use connectBluetoothPrinter() first.');
    }
  }
  await cachedCharacteristic.writeValue(data);
}

export async function printReceiptBluetooth(order, settings = {}) {
  const data = buildReceiptData(order, settings);
  await sendToBluetooth(data);
}

export async function printKitchenNoteBluetooth(orderItem, tableName = '', settings = {}) {
  const data = buildKitchenNoteData(orderItem, tableName, settings);
  await sendToBluetooth(data);
}

export async function testPrinter() {
  const chunks = [];
  chunks.push(escposInit());
  chunks.push(escposText('=== TEST PRINT ===', { align: 'center', bold: true, size: 2 }));
  chunks.push(escposText('Janu Bhai Coffee POS', { align: 'center' }));
  chunks.push(escposText('Printer connected successfully!', { align: 'center' }));
  chunks.push(escposDivider());
  chunks.push(escposText('Date: ' + new Date().toLocaleString(), { align: 'center' }));
  chunks.push(escposFeed(3));
  chunks.push(escposCut());

  const totalLength = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  await sendToBluetooth(result);
}

export { isWebBluetoothSupported };
