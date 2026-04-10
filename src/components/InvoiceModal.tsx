import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, FileDown, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order } from '../types';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  t: (section: string, key: string) => string;
}

export function InvoiceModal({ isOpen, onClose, order, t }: InvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [pdfInstance, setPdfInstance] = React.useState<jsPDF | null>(null);

  const [invoiceHeader, setInvoiceHeader] = React.useState(`Precision Tech Repairs\n123 Artisan Way, Ste 4\nSan Francisco, CA 94103\nTel: (555) 012-3456`);
  const [invoiceFooter, setInvoiceFooter] = React.useState(`Warranty: 90 days on parts and labor. No refunds on water damage repairs. Thank you for choosing Precision!`);

  React.useEffect(() => {
    if (isOpen) {
      setPdfInstance(null);
      import('../lib/api').then(({ api }) => {
        api.getSettings().then(settings => {
          if (settings.ali_pos_invoice_header) setInvoiceHeader(settings.ali_pos_invoice_header);
          if (settings.ali_pos_invoice_footer) setInvoiceFooter(settings.ali_pos_invoice_footer);
        }).catch(console.error);
      });
    }
  }, [isOpen]);

  if (!order) return null;

  const handlePreparePDF = async () => {
    if (!invoiceRef.current || isGeneratingPDF || pdfInstance) return;
    setIsGeneratingPDF(true);
    
    try {
      const imgData = await toPng(invoiceRef.current, {
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
    if (!pdfInstance || !order) return;
    
    const blob = pdfInstance.output('blob');
    const file = new File([blob], `invoice-${order.id}.pdf`, { type: 'application/pdf' });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Invoice ${order.id}`
        });
      } catch (err) {
        // User cancelled share, fallback to save just in case
      }
    } else {
      pdfInstance.save(`invoice-${order.id}.pdf`);
    }
  };

  const handlePrint = async () => {
    if (!invoiceRef.current) return;

    try {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        // Clone the content to extract its HTML and styles
        const contentHtml = invoiceRef.current.innerHTML;
        const width = '76mm'; // Use slightly less than 80mm to allow for physical printer margins

        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
              <style>
                @page { 
                  size: 80mm auto; 
                  margin: 0; 
                }
                * { 
                  margin: 0; 
                  padding: 0; 
                  box-sizing: border-box; 
                }
                body { 
                  background: white; 
                  padding: 4mm;
                  width: ${width};
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  -webkit-font-smoothing: antialiased;
                }
                /* Utility classes from Tailwind to be replicated for the print doc */
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .mb-1 { margin-bottom: 0.25rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .mb-4 { margin-bottom: 1rem; }
                .mb-6 { margin-bottom: 1.5rem; }
                .mt-3 { margin-top: 0.75rem; }
                .mt-4 { margin-top: 1rem; }
                .mt-6 { margin-top: 1.5rem; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .items-center { align-items: center; }
                .font-black { font-weight: 900; }
                .font-bold { font-weight: 700; }
                .font-black { font-weight: 900; }
                .italic { font-style: italic; }
                .uppercase { text-transform: uppercase; }
                .tracking-tighter { letter-spacing: -0.05em; }
                .tracking-widest { letter-spacing: 0.1em; }
                .tracking-wider { letter-spacing: 0.05em; }
                .border-t { border-top: 1px solid #000; }
                .border-b { border-bottom: 1px solid #000; }
                .border-dashed { border-style: dashed !important; }
                .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                .pb-1 { padding-bottom: 0.25rem; }
                .pt-2 { padding-top: 0.5rem; }
                .pt-4 { padding-top: 1rem; }
                .pr-1 { padding-right: 0.25rem; }
                .pr-2 { padding-right: 0.5rem; }
                .text-xs { font-size: 10px; }
                .text-sm { font-size: 12px; }
                .leading-tight { line-height: 1.25; }
                .leading-relaxed { line-height: 1.625; }
                .w-full { width: 100%; }
                .h-8 { height: 2rem; }
                .h-6 { height: 1.5rem; }
                .h-4 { height: 1rem; }
                .w-0.5 { width: 2px; }
                .gap-0.5 { gap: 2px; }
                .gap-1 { gap: 4px; }
                .inline-block { display: inline-block; }
                .break-words { overflow-wrap: break-word; }
                table { width: 100%; border-collapse: collapse; }
                
                /* Specific fix for text quality on thermal printers */
                body {
                  color: #000;
                  print-color-adjust: exact;
                }
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pb-24 md:pb-4">
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
            className="relative w-full max-w-lg bg-surface-container-lowest rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Printer size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-on-surface">{t('term', 'printTitle')}</h3>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Order {order.id}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Invoice Preview Container */}
            <div className="flex-grow overflow-y-auto p-8 bg-surface-container-high/30 custom-scrollbar">
              {/* This is the part that will be printed/captured */}
              <div 
                ref={invoiceRef}
                id="printable-invoice"
                className="p-4 mx-auto font-['Inter'] text-[12px] leading-tight"
                style={{ width: '80mm', backgroundColor: '#ffffff', color: '#000000' }}
              >
                {/* Header */}
                <div className="text-center mb-6 space-y-1">
                  <p className="font-black text-[13px] uppercase tracking-tighter leading-none mb-2">{invoiceHeader.split('\n')[0]}</p>
                  <div className="text-[10px] leading-tight px-2 whitespace-pre-wrap">
                    {invoiceHeader.split('\n').slice(1)
                      .filter(line => order.type !== 'deposit' || !line.toUpperCase().includes('ABN'))
                      .join('\n')}
                  </div>
                  <p 
                    className="font-black text-[11px] uppercase tracking-widest mt-4 border-t border-dashed pt-2 pb-1 inline-block"
                    style={{ borderColor: '#000000' }}
                  >{order.type === 'deposit' ? 'Deposit Receipt' : 'Tax Invoice'} #{order.id}</p>
                </div>

                <div className="border-t border-dashed my-4" style={{ borderColor: '#000000' }}></div>

                {/* Order Info */}
                <div className="space-y-1 mb-4 text-[10px]">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-bold">{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(order.timestamp).toLocaleString()}</span>
                  </div>
                  {order.type === 'deposit' && order.reservationCustomers && order.reservationCustomers.length > 0 && (
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span className="font-bold">{order.reservationCustomers.map(c => c.name).join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed my-4" style={{ borderColor: '#000000' }}></div>

                {/* Items */}
                <table className="w-full text-[10px] mb-4" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '60%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '25%' }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-dashed" style={{ borderColor: '#000000' }}>
                      <th className="text-left py-1 font-black">Item</th>
                      <th className="text-right py-1 font-black">Qty</th>
                      <th className="text-right py-1 font-black pr-1">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => {
                      const itemTotal = item.price * item.qty;
                      const isDeduction = itemTotal < 0;
                      return (
                        <tr key={i} className={cn(isDeduction && "font-bold italic")}>
                          <td className="py-1 pr-2 break-words text-[9px]">
                            {isDeduction ? `(DEDUCTION) ${item.name}` : item.name}
                          </td>
                          <td className="py-1 text-right">{isDeduction ? '-' : item.qty}</td>
                          <td className="py-1 text-right pr-1">
                            {isDeduction ? `-$${Math.abs(itemTotal).toFixed(2)}` : `$${itemTotal.toFixed(2)}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="border-t border-dashed my-4" style={{ borderColor: '#000000' }}></div>

                {/* Totals */}
                <div className="space-y-1 text-[10px]">
                  {order.type !== 'deposit' && (
                    <>
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (GST):</span>
                        <span>${order.tax.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {order.paymentMethod === 'mixed' ? (
                    <>
                      <div className="flex justify-between">
                        <span>Cash Payment:</span>
                        <span>${(order.mixedCash || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Card Payment:</span>
                        <span>${((order.mixedEftpos || 0) + (order.surcharge || 0)).toFixed(2)}</span>
                      </div>
                      {order.surcharge > 0 && (
                        <div className="flex justify-between text-[8px] italic opacity-70">
                          <span>- Card Surcharge (1.5%):</span>
                          <span>${(order.surcharge || 0).toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  ) : order.surcharge > 0 && (
                    <div className="flex justify-between">
                      <span>Surcharge ({order.paymentMethod?.toUpperCase()}):</span>
                      <span>${order.surcharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black pt-2 border-t border-dashed" style={{ borderColor: '#000000' }}>
                    <span>TOTAL:</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed my-6" style={{ borderColor: '#000000' }}></div>

                {/* Footer */}
                <div className="text-center space-y-2">
                  <p className="text-[9px] italic leading-relaxed">{invoiceFooter}</p>
                  <div className="pt-4 flex flex-col items-center gap-1">
                    <div className="w-full h-8 flex items-center justify-center">
                      <div className="flex gap-0.5">
                        {[...Array(24)].map((_, i) => (
                          <div key={i} className={cn("w-0.5", i % 4 === 0 ? "h-6" : "h-4")} style={{ backgroundColor: '#000000' }}></div>
                        ))}
                      </div>
                    </div>
                    <span className="text-[8px] font-bold tracking-[0.2em]">{order.id}</span>
                  </div>
                  <p className="text-[10px] font-black mt-4">THANK YOU!</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 grid grid-cols-2 gap-4">
              {pdfInstance ? (
                <button 
                  onClick={handleSavePDF}
                  className="py-4 bg-teal-600/10 text-teal-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-teal-600/20 transition-all border border-teal-600/20"
                >
                  <CheckCircle2 size={18} />
                  {t('term', 'saveShare') || "Save / Share"}
                </button>
              ) : (
                <button 
                  onClick={handlePreparePDF}
                  disabled={isGeneratingPDF}
                  className="py-4 bg-surface-container-highest text-on-surface rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-outline-variant/20 transition-all disabled:opacity-50"
                >
                  <FileDown size={18} />
                  {isGeneratingPDF ? t('term', 'generating') : t('term', 'generatePDF')}
                </button>
              )}
              <button 
                onClick={handlePrint}
                disabled={isGeneratingPDF}
                className="py-4 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Printer size={18} />
                {t('term', 'printReceipt')}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
