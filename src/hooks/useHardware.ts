"use client";

import { useState, useCallback } from 'react';

// ESC/POS command constants
const ESC = 0x1B;
const GS = 0x1D;
const LF = 0x0A;

// ASCII art mascot for receipt header
const MASCOT_ASCII = [
  "       ___________       ",
  "      |           |      ",
  "      |  J A N U  |      ",
  "      |   B H A I |      ",
  "      |___________|      ",
  "       \\  o   o  /       ",
  "        \\  ---  /        ",
  "         \\_____/         ",
  "    ==================   ",
  "    EKDUM JHAKAAS CHAI   ",
  "    ==================   ",
];

interface OrderData {
  orderId: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  source: 'POS' | 'ZOMATO' | 'SWIGGY';
  timestamp: string;
  outletName: string;
}

interface HardwareState {
  printerConnected: boolean;
  printerName: string | null;
  drawerConnected: boolean;
  error: string | null;
}

// Encode text to ESC/POS byte commands
function textToBytes(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    bytes.push(text.charCodeAt(i));
  }
  bytes.push(LF);
  return bytes;
}

function centerText(text: string, width = 32): string {
  const pad = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(pad) + text;
}

function buildReceiptBytes(order: OrderData): Uint8Array {
  const bytes: number[] = [];

  // Initialize printer
  bytes.push(ESC, 0x40); // ESC @ — Reset

  // Center alignment
  bytes.push(ESC, 0x61, 0x01); // Center

  // Bold ON
  bytes.push(ESC, 0x45, 0x01);

  // Print Mascot ASCII art
  for (const line of MASCOT_ASCII) {
    bytes.push(...textToBytes(line));
  }

  bytes.push(LF);

  // Print outlet name
  bytes.push(...textToBytes(order.outletName.toUpperCase()));
  bytes.push(LF);

  // Bold OFF, left align
  bytes.push(ESC, 0x45, 0x00);
  bytes.push(ESC, 0x61, 0x00); // Left

  // Divider
  bytes.push(...textToBytes('--------------------------------'));

  // Order info
  bytes.push(...textToBytes(`Order: ${order.orderId}`));
  bytes.push(...textToBytes(`Source: ${order.source}`));
  bytes.push(...textToBytes(`Time:   ${order.timestamp}`));

  bytes.push(...textToBytes('--------------------------------'));

  // Items
  for (const item of order.items) {
    const line = `${item.qty}x ${item.name}`.padEnd(22) + `Rs.${item.price * item.qty}`;
    bytes.push(...textToBytes(line));
  }

  bytes.push(...textToBytes('--------------------------------'));

  // Total — bold, double height
  bytes.push(ESC, 0x45, 0x01); // Bold ON
  bytes.push(GS, 0x21, 0x01); // Double height
  const totalLine = `TOTAL`.padEnd(22) + `Rs.${order.total}`;
  bytes.push(...textToBytes(totalLine));
  bytes.push(GS, 0x21, 0x00); // Normal height
  bytes.push(ESC, 0x45, 0x00); // Bold OFF

  bytes.push(...textToBytes('--------------------------------'));

  // Center footer
  bytes.push(ESC, 0x61, 0x01);
  bytes.push(...textToBytes('Poshtik hai. Jhakaas hai.'));
  bytes.push(...textToBytes('janubhai.com'));
  bytes.push(LF, LF);

  // Cut paper
  bytes.push(GS, 0x56, 0x00); // Full cut

  return new Uint8Array(bytes);
}

// Cash drawer kick pulse command (common for Epson-compatible)
function buildCashDrawerBytes(): Uint8Array {
  // ESC p 0 25 250 — Pin 2, pulse 50ms ON, 500ms OFF
  return new Uint8Array([ESC, 0x70, 0x00, 0x19, 0xFA]);
}

export function useHardware() {
  const [state, setState] = useState<HardwareState>({
    printerConnected: false,
    printerName: null,
    drawerConnected: false,
    error: null,
  });

  // USBDevice is a browser-only WebUSB API type — cast as any for build compatibility
  const [device, setDevice] = useState<any>(null);

  const connectPrinter = useCallback(async () => {
    setState(prev => ({ ...prev, error: null }));

    if (!(navigator as any).usb) {
      setState(prev => ({ ...prev, error: 'WebUSB is not supported in this browser. Use Chrome or Edge.' }));
      return false;
    }

    try {
      const selectedDevice = await (navigator as any).usb.requestDevice({
        filters: [
          // Common thermal printer vendor IDs
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0416 }, // Star Micronics
          { vendorId: 0x0525 }, // Generic USB printer class
        ],
      });

      await selectedDevice.open();

      // Select configuration (usually config 1)
      if (selectedDevice.configuration === null) {
        await selectedDevice.selectConfiguration(1);
      }

      // Claim the first interface
      const iface = selectedDevice.configuration?.interfaces[0];
      if (iface) {
        await selectedDevice.claimInterface(iface.interfaceNumber);
      }

      setDevice(selectedDevice);
      setState(prev => ({
        ...prev,
        printerConnected: true,
        printerName: selectedDevice.productName || 'Thermal Printer',
        drawerConnected: true, // Cash drawer shares the printer interface
      }));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect printer.';
      setState(prev => ({ ...prev, error: message }));
      return false;
    }
  }, []);

  const printReceipt = useCallback(async (orderData: OrderData) => {
    if (!device) {
      setState(prev => ({ ...prev, error: 'No printer connected. Pair a device first.' }));
      return false;
    }

    try {
      const receiptBytes = buildReceiptBytes(orderData);
      const endpoint = device.configuration?.interfaces[0]?.alternate?.endpoints.find(
        (e: any) => e.direction === 'out'
      );

      if (!endpoint) {
        setState(prev => ({ ...prev, error: 'No output endpoint found on printer.' }));
        return false;
      }

      await device.transferOut(endpoint.endpointNumber, receiptBytes);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Print failed.';
      setState(prev => ({ ...prev, error: message }));
      return false;
    }
  }, [device]);

  const openCashDrawer = useCallback(async () => {
    if (!device) {
      setState(prev => ({ ...prev, error: 'No printer connected. Cash drawer shares the printer interface.' }));
      return false;
    }

    try {
      const drawerBytes = buildCashDrawerBytes();
      const endpoint = device.configuration?.interfaces[0]?.alternate?.endpoints.find(
        (e: any) => e.direction === 'out'
      );

      if (!endpoint) {
        setState(prev => ({ ...prev, error: 'No output endpoint found.' }));
        return false;
      }

      await device.transferOut(endpoint.endpointNumber, drawerBytes);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cash drawer kick failed.';
      setState(prev => ({ ...prev, error: message }));
      return false;
    }
  }, [device]);

  const disconnect = useCallback(async () => {
    if (device) {
      try {
        await device.close();
      } catch { /* already closed */ }
      setDevice(null);
    }
    setState({
      printerConnected: false,
      printerName: null,
      drawerConnected: false,
      error: null,
    });
  }, [device]);

  return {
    ...state,
    connectPrinter,
    printReceipt,
    openCashDrawer,
    disconnect,
  };
}
