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
    { en: "Data Backup: Data loss is not covered. Please backup your device.", zh: "数据备份：数据丢失不在保修范围内，请提前备份。" },
    { en: "Liquid Damage: No warranty on liquid damage repairs.", zh: "进水维修：进水机器修复后不提供保修。" },
    { en: "Warranty: 90 days warranty on parts and labor.", zh: "保修条款：所更换零件及人工提供90天保修。" },
    { en: "Unclaimed Goods: Items not collected within 90 days will be disposed of.", zh: "逾期处理：超过90天未领取的机器，本店将自行处理。" }
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
      const imgData = await toPng(ticketRef.current, {
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
    
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200]
      });
    
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      setPdfInstance(pdf);
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
        const width = '76mm';

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
                  padding: 4mm;
                  width: ${width};
                  font-family: 'Inter', sans-serif;
                  -webkit-font-smoothing: antialiased;
                  color: #000;
                }
                .text-center { text-align: center; }
                .mb-1 { margin-bottom: 0.1rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .mb-4 { margin-bottom: 1rem; }
                .mt-4 { margin-top: 1rem; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .font-black { font-weight: 900; }
                .font-bold { font-weight: 700; }
                .uppercase { text-transform: uppercase; }
                .border-t { border-top: 1px solid #000; }
                .border-dashed { border-style: dashed !important; }
                .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
                .text-xs { font-size: 10px; }
                .text-sm { font-size: 12px; }
                .leading-tight { line-height: 1.2; }
                .italic { font-style: italic; }
              </style>
            </head>
            <body>
              ${contentHtml}
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
                  <p className="font-black text-[14px] uppercase tracking-tighter mb-1">{ticketHeader.split('\n')[0]}</p>
                  <pre className="text-[10px] leading-tight whitespace-pre-wrap font-sans opacity-80">
                    {ticketHeader.split('\n').slice(1).join('\n')}
                  </pre>
                  <p className="font-black text-[11px] uppercase tracking-widest mt-4 border-t border-b border-dashed py-2 inline-block w-full">
                    REPAIR WORK ORDER
                  </p>
                </div>

                <div className="space-y-4">
                  <section>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Customer Details</p>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="font-bold">{customer.name}</span>
                      <span>{customer.phone}</span>
                    </div>
                  </section>

                  <section>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Device Information</p>
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
                   section>

                  <section className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Repair Task</p>
                    <p className="font-bold text-[13px]">{repair.repairItem}</p>
                    {repair.remark && <p className="text-[10px] mt-1 opacity-80 italic">Notes: {repair.remark}</p>}
                  </section>

                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-black">
                    <span className="font-black uppercase tracking-widest">Est. Total:</span>
                    <span className="text-xl font-black">${repair.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-dashed border-black">
                  <p className="text-[9px] font-black uppercase tracking-widest mb-2 text-center underline">Terms & Conditions / 维修条款</p>
                  <div className="space-y-3">
                    {disclaimerTerms.map((term, i) => (
                      <div key={i} className="space-y-0.5">
                        <p className="text-[8px] font-bold leading-tight uppercase tracking-tight">{term.en}</p>
                        <p className="text-[8px] leading-tight">{term.zh}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <div className="border-t border-gray-400 w-2/3 mx-auto mb-1"></div>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-8">Customer Signature</p>
                  <p className="text-[10px] font-black">THANK YOU / 谢谢</p>
                  <p className="text-[8px] opacity-40 mt-1">{new Date(repair.timestamp).toLocaleString()}</p>
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
