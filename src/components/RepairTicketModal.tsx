import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, FileDown, CheckCircle2, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RepairRecord, Customer } from '../types';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

interface RepairTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  repair: RepairRecord | null;
  customer: Customer | null;
  t: (section: string, key: string) => string;
}

export function RepairTicketModal({ isOpen, onClose, repair, customer, t }: RepairTicketModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [pdfInstance, setPdfInstance] = React.useState<jsPDF | null>(null);

  const [ticketHeader, setTicketHeader] = React.useState(`Ali Mobile Repair\nKiosk C1, Ringwood Square\nRingwood VIC 3134\nTel: 0481 058 514`);
  
  const disclaimerTerms = [
    { en: "Data Backup: Data loss is not covered. Please backup your device." },
    { en: "Liquid Damage: No warranty on liquid damage repairs once they leave the shop." },
    { en: "Warranty: 180 days warranty on parts and labor." },
    { en: "Unclaimed Goods: Items not collected within 180 days will be disposed of." }
  ];

  React.useEffect(() => {
    if (isOpen) {
      setPdfInstance(null);
      import('../lib/api').then(({ api }) => {
        api.getSettings().then(settings => {
          if (settings.ali_pos_invoice_header) setTicketHeader(settings.ali_pos_invoice_header);
        }).catch(console.error);
      });
    }
  }, [isOpen]);

  if (!repair || !customer) return null;

  const handlePreparePDF = async () => {
    if (!ticketRef.current || isGeneratingPDF || pdfInstance) return;
    setIsGeneratingPDF(true);
    
    try {
      // Temporarily remove max-content restrictions if any to let it render fully
      const imgData = await toPng(ticketRef.current, {
        pixelRatio: 3, // Higher resolution
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          margin: '0', 
          padding: '24px' // Match the p-6 we render
        }
      });
    
      const tempPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 500] });
      const imgProps = tempPdf.getImageProperties(imgData);
      const pdfWidth = 80;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      const finalPdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, Math.max(pdfHeight, 100)]
      });
    
      finalPdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      setPdfInstance(finalPdf);
    } catch (err: any) {
      console.error("PDF Generate Error:", err);
      alert("Failed to generate PDF: " + err.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSavePDF = async () => {
    if (!pdfInstance || !repair) return;
    pdfInstance.save(`repair-ticket-${repair.id}.pdf`);
  };

  const handlePrint = async () => {
    if (!ticketRef.current) return;

    try {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        const contentHtml = ticketRef.current.innerHTML;

        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
              <style>
                @page { size: 80mm auto; margin: 0; }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body { 
                  background: white; 
                  padding: 0 2mm; 
                  width: 100%;
                  max-width: 80mm;
                  margin: 0 auto;
                  font-family: 'Inter', sans-serif;
                  -webkit-font-smoothing: antialiased;
                  color: #000;
                  line-height: 1.5;
                }
                
                .ticket-container {
                  padding: 0; /* Override on-screen padding */
                }

                .text-center { text-align: center; }
                .mb-1 { margin-bottom: 0.25rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .mb-3 { margin-bottom: 0.75rem; }
                .mb-4 { margin-bottom: 1rem; }
                .mb-6 { margin-bottom: 1.5rem; }
                .mt-2 { margin-top: 0.5rem; }
                .mt-4 { margin-top: 1rem; }
                .mt-6 { margin-top: 1.5rem; }
                .mt-8 { margin-top: 2rem; }
                .mt-10 { margin-top: 2.5rem; }
                
                .flex { display: flex; }
                .flex-col { flex-direction: column; }
                .items-center { align-items: center; }
                .items-start { align-items: flex-start; }
                .justify-between { justify-content: space-between; }
                .flex-1 { flex: 1; }
                .gap-2 { gap: 0.5rem; }
                
                .font-black { font-weight: 900; }
                .font-bold { font-weight: 700; }
                .uppercase { text-transform: uppercase; }
                .italic { font-style: italic; }
                .underline { text-decoration: underline; }
                
                .border-t { border-top: 1px solid #000; }
                .border-b { border-bottom: 1px solid #000; }
                .border-dashed { border-style: dashed !important; }
                .border-gray-100 { border-color: #f3f4f6; }
                .border-gray-200 { border-color: #e5e7eb; }
                .border-gray-400 { border-color: #9ca3af; }
                
                .bg-gray-50 { background-color: #f9fafb; }
                .bg-white { background-color: #ffffff; }
                .rounded-lg { border-radius: 0.5rem; }
                .rounded-xl { border-radius: 0.75rem; }
                .p-2 { padding: 0.5rem; }
                .pt-2 { padding-top: 0.5rem; }
                .pt-4 { padding-top: 1rem; }
                .pb-1 { padding-bottom: 0.25rem; }
                
                /* Precise Print Typography */
                .text-\\[14px\\] { font-size: 22px; } /* Main Headers */
                .text-\\[13px\\] { font-size: 20px; } 
                .text-\\[12px\\] { font-size: 18px; }
                .text-\\[11px\\] { font-size: 17px; }
                .text-\\[10px\\] { font-size: 16px; }
                .text-\\[9px\\] { font-size: 14px; }
                .text-\\[8px\\] { font-size: 13px; }
                .text-\\[7px\\] { font-size: 12px; } /* Smallest readable terms */
                
                .text-xl { font-size: 18px; }
                
                .tracking-tighter { letter-spacing: -0.05em; }
                .tracking-tight { letter-spacing: -0.025em; }
                .tracking-widest { letter-spacing: 0.1em; }
                .tracking-\\[0\\.2em\\] { letter-spacing: 0.2em; }
                
                .leading-tight { line-height: 1.25; }
                .leading-normal { line-height: 1.5; }
                
                .text-primary { color: #000; } /* Force to black on print */
                
                .w-full { width: 100%; }
                .w-20 { width: 5rem; }
                .h-20 { height: 5rem; }
                .w-16 { width: 4rem; }
                .h-16 { height: 4rem; }
                .w-2\\/3 { width: 66.666667%; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                
                /* Layout overrides to prevent crushing */
                .word-break { word-break: break-word; }
                .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
                .space-y-2\\\\.5 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.625rem; }
                .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
              </style>
            </head>
            <body>
              <div class="ticket-container">
                ${contentHtml}
              </div>
            </body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 500);
      }
    } catch (err: any) {
      console.error('Print error:', err);
      alert('Failed to print: ' + err.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Printer size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Repair Work Order</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID: {repair.id}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 bg-gray-50 custom-scrollbar">
              <div 
                ref={ticketRef}
                className="p-6 mx-auto font-['Inter'] text-[12px] leading-tight bg-white text-black"
                style={{ width: '80mm' }}
              >
                <div className="text-center mb-6">
                  <p className="font-black text-[14px] uppercase tracking-tighter mb-2">ALI MOBILE REPAIRS</p>
                  <div className="font-black text-[10px] leading-tight uppercase tracking-tighter space-y-1">
                    <p>Address: Kiosk C1 Ringwood Square Shopping Centre, Ringwood 3134</p>
                    <p>Phone: 0481 058 514</p>
                  </div>
                  <p className="font-black text-[11px] uppercase tracking-widest mt-4 border-t border-dashed pt-3 inline-block w-full">
                    REPAIR WORK ORDER
                  </p>
                  <p className="font-bold text-[9px] text-black border-dashed border-b pb-3 uppercase tracking-widest">
                    Time: {new Date(repair.timestamp).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-4">
                  <section>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 border-b border-black inline-block pb-0.5">Customer Details</p>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="font-bold">{customer.name}</span>
                      <span>{customer.phone}</span>
                    </div>
                  </section>

                  <section>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 border-b border-black inline-block pb-0.5">Device Information</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Model:</span>
                        <span className="font-bold">{repair.modelNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IMEI/SN:</span>
                        <span className="font-bold">{repair.imei || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lock Code:</span>
                        <span className="font-bold italic">{repair.password || 'None'}</span>
                      </div>
                    </div>
                  </section>

                  <section className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 border-b border-black inline-block pb-0.5">Repair Task</p>
                    <p className="font-black text-[13px]">{repair.repairItem}</p>
                    {repair.remark && <p className="text-[10px] font-bold mt-1 italic">Notes: {repair.remark}</p>}
                  </section>

                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-black">
                    <span className="font-black uppercase tracking-widest">Est. Total:</span>
                    <span className="text-xl font-black">${repair.price.toFixed(2)}</span>
                  </div>
                  {repair.deposit && repair.deposit > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-[10px] uppercase tracking-widest">Deposit Paid:</span>
                        <span className="font-black text-[12px]">${repair.deposit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-200">
                        <span className="font-black text-[10px] uppercase tracking-widest">Balance Due:</span>
                        <span className="font-black text-[13px]">${(repair.price - repair.deposit).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-dashed border-black">
                  <p className="text-[8px] font-black uppercase tracking-widest mb-3 text-center underline">Terms & Conditions</p>
                  <div className="space-y-2.5">
                    {disclaimerTerms.map((term, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="text-[7px] font-black mt-0.5">{i+1}.</span>
                        <p className="text-[7px] font-black leading-normal uppercase tracking-tight flex-1">{term.en}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center text-center">
                  <div className="bg-white p-2 border border-gray-100 rounded-xl mb-3">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://alimobile.com.au/track-status?id=${repair.id}`)}`} 
                      alt="Status Tracking QR" 
                      className="w-16 h-16"
                    />
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-10">Scan to track your repair status</p>
                  
                  <div className="border-t border-gray-400 w-2/3 mx-auto mb-2"></div>
                  <p className="text-[8px] font-black uppercase tracking-widest mb-10">Customer Signature</p>
                  <p className="text-[10px] font-black tracking-[0.2em]">THANK YOU</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-gray-100 grid grid-cols-2 gap-4">
              {pdfInstance ? (
                <button onClick={handleSavePDF} className="py-4 bg-green-50 text-green-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-green-100">
                  <CheckCircle2 size={18} />
                  Save Ticket
                </button>
              ) : (
                <button onClick={handlePreparePDF} disabled={isGeneratingPDF} className="py-4 bg-gray-100 text-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                  <FileDown size={18} />
                  {isGeneratingPDF ? "Generating..." : "Get PDF"}
                </button>
              )}
              <button onClick={handlePrint} className="py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                <Printer size={18} />
                Print Ticket
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
