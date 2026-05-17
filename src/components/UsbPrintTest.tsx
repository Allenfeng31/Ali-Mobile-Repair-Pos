import React, { useState, useRef, useCallback } from 'react';
import { Usb, Plug, CheckCircle2, AlertTriangle, Loader2, Printer, Info } from 'lucide-react';

/**
 * WebUSB ESC/POS Proof-of-Concept
 * 
 * Target: SAM4S ELLIX 30IIs thermal receipt printer via USB.
 * This component is isolated — it does NOT touch InvoiceModal or RepairTicketModal.
 * 
 * ESC/POS Command Reference:
 *   ESC @       = 0x1B 0x40  (Initialize printer)
 *   ESC a n     = 0x1B 0x61 n (Alignment: 0=left, 1=center, 2=right)
 *   ESC E n     = 0x1B 0x45 n (Bold: 1=on, 0=off)
 *   GS V m      = 0x1D 0x56 m (Paper cut: 0=full, 1=partial)
 *   LF          = 0x0A        (Line feed)
 */

// --- ESC/POS byte helpers ---
const ESC = 0x1B;
const GS  = 0x1D;
const LF  = 0x0A;

const CMD_INIT        = new Uint8Array([ESC, 0x40]);                    // ESC @
const CMD_CENTER      = new Uint8Array([ESC, 0x61, 0x01]);             // ESC a 1
const CMD_LEFT        = new Uint8Array([ESC, 0x61, 0x00]);             // ESC a 0
const CMD_BOLD_ON     = new Uint8Array([ESC, 0x45, 0x01]);             // ESC E 1
const CMD_BOLD_OFF    = new Uint8Array([ESC, 0x45, 0x00]);             // ESC E 0
const CMD_FEED_CUT    = new Uint8Array([LF, LF, LF, GS, 0x56, 0x00]); // Feed 3 lines + full cut

function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// --- Log entry type ---
interface LogEntry {
  time: string;
  type: 'info' | 'success' | 'error' | 'warn';
  message: string;
}

export function UsbPrintTest() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'printing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const deviceRef = useRef<USBDevice | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString('en-AU', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { time, type, message }]);
    console.log(`[UsbPrint ${type.toUpperCase()}] ${message}`);
    // Auto-scroll
    setTimeout(() => {
      logContainerRef.current?.scrollTo({ top: logContainerRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, []);

  const handleConnect = async () => {
    setStatus('connecting');
    setErrorMsg(null);
    setLogs([]);
    addLog('info', 'Requesting USB device via browser picker...');

    try {
      // 1. Request device (empty filters = show all USB devices)
      const device = await navigator.usb.requestDevice({ filters: [] });
      deviceRef.current = device;
      
      const name = `${device.manufacturerName || 'Unknown'} ${device.productName || 'Device'}`;
      setDeviceName(name);
      addLog('success', `Device selected: ${name}`);
      addLog('info', `Vendor ID: 0x${device.vendorId.toString(16).padStart(4, '0')}, Product ID: 0x${device.productId.toString(16).padStart(4, '0')}`);
      addLog('info', `Device class: ${device.deviceClass}, Subclass: ${device.deviceSubclass}, Protocol: ${device.deviceProtocol}`);
      addLog('info', `Configurations: ${device.configurations.length}`);

      // 2. Open the device
      addLog('info', 'Opening device...');
      await device.open();
      addLog('success', 'Device opened successfully');

      // 3. Select configuration (usually configuration 1)
      if (device.configuration === null) {
        addLog('info', 'Selecting configuration #1...');
        await device.selectConfiguration(1);
      }
      addLog('info', `Active configuration: #${device.configuration?.configurationValue}`);

      // 4. Find the right interface and endpoint
      const config = device.configuration!;
      addLog('info', `Interfaces available: ${config.interfaces.length}`);

      let targetInterface: USBInterface | null = null;
      let targetEndpoint: USBEndpoint | null = null;

      for (const iface of config.interfaces) {
        addLog('info', `  Interface #${iface.interfaceNumber}:`);
        for (const alt of iface.alternates) {
          addLog('info', `    Alternate #${alt.alternateSetting} — Class: ${alt.interfaceClass}, Subclass: ${alt.interfaceSubclass}, Protocol: ${alt.interfaceProtocol}`);
          addLog('info', `    Endpoints: ${alt.endpoints.length}`);
          
          for (const ep of alt.endpoints) {
            const dir = ep.direction;
            const type = ep.type;
            addLog('info', `      EP #${ep.endpointNumber} — Direction: ${dir}, Type: ${type}, Packet Size: ${ep.packetSize}`);

            // We need a BULK OUT endpoint for sending print data
            if (dir === 'out' && type === 'bulk' && !targetEndpoint) {
              targetEndpoint = ep;
              targetInterface = iface;
              addLog('success', `      ✓ Selected as print endpoint`);
            }
          }
        }
      }

      if (!targetInterface || !targetEndpoint) {
        throw new Error('No suitable BULK OUT endpoint found. This device may not support ESC/POS over USB, or may need a different interface class.');
      }

      // 5. Claim the interface
      addLog('info', `Claiming interface #${targetInterface.interfaceNumber}...`);
      await device.claimInterface(targetInterface.interfaceNumber);
      addLog('success', `Interface #${targetInterface.interfaceNumber} claimed`);

      setStatus('connected');
      addLog('success', '✅ Ready to print! Click "Send Test Print" below.');

    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        // User cancelled the picker
        setStatus('idle');
        addLog('warn', 'Device picker was cancelled by user.');
        return;
      }
      
      const msg = err.message || 'Unknown USB connection error';
      setStatus('error');
      setErrorMsg(msg);
      addLog('error', `Connection failed: ${msg}`);
      
      // Try to close device on error
      if (deviceRef.current) {
        try { await deviceRef.current.close(); } catch {}
      }
    }
  };

  const handleTestPrint = async () => {
    const device = deviceRef.current;
    if (!device) return;

    setStatus('printing');
    addLog('info', 'Preparing ESC/POS test payload...');

    try {
      // Find the OUT endpoint again
      const config = device.configuration!;
      let endpointNumber = 0;

      for (const iface of config.interfaces) {
        for (const alt of iface.alternates) {
          for (const ep of alt.endpoints) {
            if (ep.direction === 'out' && ep.type === 'bulk') {
              endpointNumber = ep.endpointNumber;
            }
          }
        }
      }

      if (endpointNumber === 0) {
        throw new Error('Could not find OUT endpoint');
      }

      // Build the ESC/POS payload
      const payload = concatBytes(
        CMD_INIT,
        CMD_CENTER,
        CMD_BOLD_ON,
        textToBytes('=== WEBUSB TEST ===\n'),
        CMD_BOLD_OFF,
        textToBytes('\n'),
        CMD_LEFT,
        textToBytes('SAM4S WebUSB Connection\n'),
        textToBytes('Successful!\n'),
        textToBytes('\n'),
        textToBytes(`Time: ${new Date().toLocaleString('en-AU')}\n`),
        textToBytes('Status: CONNECTED\n'),
        textToBytes('\n'),
        CMD_CENTER,
        textToBytes('--- Ali Mobile POS ---\n'),
        CMD_FEED_CUT
      );

      addLog('info', `Sending ${payload.length} bytes to endpoint #${endpointNumber}...`);
      
      const result = await device.transferOut(endpointNumber, payload);
      
      if (result.status === 'ok') {
        addLog('success', `✅ Print sent successfully! ${result.bytesWritten} bytes written.`);
        setStatus('success');
      } else {
        throw new Error(`Transfer status: ${result.status}`);
      }

    } catch (err: any) {
      const msg = err.message || 'Unknown print error';
      setStatus('error');
      setErrorMsg(msg);
      addLog('error', `Print failed: ${msg}`);
    }
  };

  const handleDisconnect = async () => {
    if (deviceRef.current) {
      try {
        await deviceRef.current.close();
        addLog('info', 'Device disconnected.');
      } catch (err: any) {
        addLog('warn', `Disconnect warning: ${err.message}`);
      }
      deviceRef.current = null;
    }
    setStatus('idle');
    setDeviceName(null);
  };

  const statusColor = {
    idle: 'text-gray-400',
    connecting: 'text-amber-500',
    connected: 'text-blue-500',
    printing: 'text-amber-500',
    success: 'text-green-500',
    error: 'text-red-500',
  }[status];

  const statusLabel = {
    idle: 'No device connected',
    connecting: 'Connecting...',
    connected: 'Connected — Ready to print',
    printing: 'Sending print data...',
    success: 'Test print sent!',
    error: 'Error occurred',
  }[status];

  const isWebUsbSupported = typeof navigator !== 'undefined' && 'usb' in navigator;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header Card */}
      <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[2.5rem] p-8 border border-white/20">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] flex items-center justify-center text-blue-600 border border-white/40">
            <Usb size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight">WebUSB Printer Test</h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">SAM4S ELLIX 30IIs — ESC/POS Direct Print</p>
          </div>
        </div>

        {/* WebUSB Support Check */}
        {!isWebUsbSupported && (
          <div className="bg-red-50/20 border border-red-200/50 shadow-[var(--shadow-neu-pressed)] rounded-2xl p-5 mb-8 flex items-start gap-4">
            <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-black text-red-700 uppercase tracking-wide">WebUSB Not Supported</p>
              <p className="text-xs font-bold text-red-600/80 mt-1 leading-relaxed">Your browser does not support WebUSB. Use Chrome or Edge on desktop. Safari and Firefox do not support this API.</p>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center gap-3 mb-8 p-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl border border-black/5">
          <div className={`w-3 h-3 rounded-full ${status === 'connecting' || status === 'printing' ? 'animate-pulse bg-amber-400' : status === 'connected' || status === 'success' ? 'bg-green-400' : status === 'error' ? 'bg-red-400' : 'bg-gray-300'}`} />
          <span className={`text-xs font-black uppercase tracking-wider ${statusColor}`}>{statusLabel}</span>
          {deviceName && <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-auto bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] px-3 py-1 rounded-lg border border-white/20">{deviceName}</span>}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {status === 'idle' || status === 'error' ? (
            <button
              onClick={handleConnect}
              disabled={!isWebUsbSupported}
              className="flex-1 py-4 bg-[var(--color-neu-bg)] text-blue-600 font-black rounded-2xl shadow-[var(--shadow-neu-flat)] active:scale-[0.98] active:shadow-[var(--shadow-neu-pressed)] hover:shadow-[var(--shadow-neu-floating)] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs border border-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plug size={18} />
              Connect USB Printer
            </button>
          ) : status === 'connecting' || status === 'printing' ? (
            <button disabled className="flex-1 py-4 bg-[var(--color-neu-bg)] text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[var(--shadow-neu-pressed)] border border-black/5">
              <Loader2 size={18} className="animate-spin" />
              {status === 'connecting' ? 'Connecting...' : 'Printing...'}
            </button>
          ) : (
            <>
              <button
                onClick={handleTestPrint}
                className="flex-1 py-4 bg-[var(--color-neu-bg)] text-emerald-600 font-black rounded-2xl shadow-[var(--shadow-neu-flat)] active:scale-[0.98] active:shadow-[var(--shadow-neu-pressed)] hover:shadow-[var(--shadow-neu-floating)] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs border border-white/20"
              >
                <Printer size={18} />
                Send Test Print
              </button>
              <button
                onClick={handleDisconnect}
                className="py-4 px-6 bg-[var(--color-neu-bg)] text-red-500 font-black rounded-2xl shadow-[var(--shadow-neu-flat)] active:scale-[0.98] active:shadow-[var(--shadow-neu-pressed)] hover:shadow-[var(--shadow-neu-floating)] transition-all uppercase tracking-widest text-xs border border-white/20"
              >
                Disconnect
              </button>
            </>
          )}
        </div>

        {/* Error Display */}
        {errorMsg && (
          <div className="mt-6 bg-red-50/20 border border-red-200/50 shadow-[var(--shadow-neu-pressed)] rounded-2xl p-5 flex items-start gap-4">
            <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs font-bold text-red-700 leading-relaxed break-all">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Debug Log */}
      <div className="bg-black/90 rounded-[2.5rem] overflow-hidden shadow-[var(--shadow-neu-pressed)] border border-black/10">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-gray-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Debug Console</span>
          </div>
          <span className="text-[10px] font-bold text-gray-600">{logs.length} entries</span>
        </div>
        <div
          ref={logContainerRef}
          className="p-6 max-h-[320px] overflow-y-auto font-mono text-xs space-y-1.5 custom-scrollbar"
        >
          {logs.length === 0 ? (
            <p className="text-gray-600 italic">Click "Connect USB Printer" to begin...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-3 leading-relaxed">
                <span className="text-gray-600 shrink-0 select-none">{log.time}</span>
                <span className={
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'warn' ? 'text-amber-400' :
                  'text-gray-300'
                }>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50/10 rounded-[2rem] p-6 border border-amber-200/40 shadow-[var(--shadow-neu-pressed)]">
        <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-3">Troubleshooting Tips</p>
        <ul className="space-y-2.5 text-xs font-bold text-amber-800/90 leading-relaxed">
          <li className="flex gap-2">
            <span className="font-black shrink-0">1.</span>
            <span>If the device doesn't appear in the picker, check that no other application (e.g., POS driver software) has claimed the USB port.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-black shrink-0">2.</span>
            <span>On macOS, you may need to unload the system printer driver: <code className="bg-amber-100/40 px-1.5 py-0.5 rounded font-black">kextunload</code> for the relevant USB class driver.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-black shrink-0">3.</span>
            <span>WebUSB requires HTTPS or localhost. It will not work over plain HTTP.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-black shrink-0">4.</span>
            <span>If "interface claim" fails, another process may hold the USB interface. Try unplugging and re-plugging the printer.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
