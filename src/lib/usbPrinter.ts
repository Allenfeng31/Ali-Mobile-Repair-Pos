/**
 * USB Printer Service
 * 
 * Manages WebUSB connection lifecycle for ESC/POS thermal printers.
 * Prioritizes previously-authorized devices (silent reconnect)
 * before falling back to the browser device picker.
 */

/** Cached device reference for the session */
let cachedDevice: USBDevice | null = null;
let cachedEndpointNumber: number | null = null;
let cachedInterfaceNumber: number | null = null;

/**
 * Find the first BULK OUT endpoint on a USB device.
 * Returns { interfaceNumber, endpointNumber } or null.
 */
function findBulkOutEndpoint(device: USBDevice): { interfaceNumber: number; endpointNumber: number } | null {
  const config = device.configuration;
  if (!config) return null;

  for (const iface of config.interfaces) {
    for (const alt of iface.alternates) {
      for (const ep of alt.endpoints) {
        if (ep.direction === 'out' && ep.type === 'bulk') {
          return { interfaceNumber: iface.interfaceNumber, endpointNumber: ep.endpointNumber };
        }
      }
    }
  }
  return null;
}

/**
 * Connect to a USB printer.
 * 
 * 1. Checks for previously-authorized devices (silent, no picker).
 * 2. Falls back to `requestDevice()` if none found (shows browser picker).
 * 
 * @returns The connected USBDevice, ready for data transfer.
 * @throws Error if user cancels picker or connection fails.
 */
export async function connectPrinter(): Promise<USBDevice> {
  // Return cached device if it's still open
  if (cachedDevice?.opened) {
    return cachedDevice;
  }

  let device: USBDevice | null = null;

  // 1. Try to silently reconnect to a previously-authorized printer
  if ('usb' in navigator) {
    const devices = await navigator.usb.getDevices();
    if (devices.length > 0) {
      device = devices[0]; // Use the first authorized device
      console.log(`[UsbPrinter] Reconnecting to authorized device: ${device.productName || 'Unknown'}`);
    }
  }

  // 2. Fall back to browser picker
  if (!device) {
    console.log('[UsbPrinter] No authorized device found, showing picker...');
    device = await navigator.usb.requestDevice({ filters: [] });
  }

  // 3. Open device if not already open
  if (!device.opened) {
    await device.open();
  }

  // 4. Select configuration if needed
  if (device.configuration === null) {
    await device.selectConfiguration(1);
  }

  // 5. Find and claim the BULK OUT endpoint
  const endpoint = findBulkOutEndpoint(device);
  if (!endpoint) {
    await device.close();
    throw new Error(
      'No BULK OUT endpoint found on this USB device. ' +
      'It may not be an ESC/POS compatible printer.'
    );
  }

  await device.claimInterface(endpoint.interfaceNumber);

  // Cache for future calls
  cachedDevice = device;
  cachedEndpointNumber = endpoint.endpointNumber;
  cachedInterfaceNumber = endpoint.interfaceNumber;

  console.log(`[UsbPrinter] Connected: ${device.productName || 'USB Printer'} (EP#${endpoint.endpointNumber})`);
  return device;
}

/**
 * Send raw ESC/POS data to the connected printer.
 * Automatically connects if no device is cached.
 * 
 * @param data - Uint8Array of ESC/POS commands (from EscPosBuilder.build())
 * @throws Error if transfer fails.
 */
export async function sendToPrinter(data: Uint8Array): Promise<void> {
  // Ensure we have a connection
  if (!cachedDevice?.opened || cachedEndpointNumber === null) {
    await connectPrinter();
  }

  if (!cachedDevice || cachedEndpointNumber === null) {
    throw new Error('Failed to establish USB printer connection.');
  }

  const result = await cachedDevice.transferOut(cachedEndpointNumber, data);

  if (result.status !== 'ok') {
    throw new Error(`USB transfer failed with status: ${result.status}`);
  }

  console.log(`[UsbPrinter] Sent ${result.bytesWritten} bytes successfully.`);
}

/**
 * Disconnect and release the cached printer.
 */
export async function disconnectPrinter(): Promise<void> {
  if (cachedDevice) {
    try {
      if (cachedInterfaceNumber !== null) {
        await cachedDevice.releaseInterface(cachedInterfaceNumber);
      }
      await cachedDevice.close();
    } catch (err) {
      console.warn('[UsbPrinter] Disconnect warning:', err);
    }
    cachedDevice = null;
    cachedEndpointNumber = null;
    cachedInterfaceNumber = null;
    console.log('[UsbPrinter] Disconnected.');
  }
}

/**
 * Check if WebUSB is supported in this browser environment.
 */
export function isWebUsbSupported(): boolean {
  return typeof navigator !== 'undefined' && 'usb' in navigator;
}

/**
 * Check if a printer is currently connected and ready.
 */
export function isPrinterReady(): boolean {
  return cachedDevice?.opened === true && cachedEndpointNumber !== null;
}
