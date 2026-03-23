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

  const handlePrint = () => {
    if (!invoiceRef.current) return;
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML)
        .join('\n');
        
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            ${styles}
            <style>
              @page { size: 80mm auto; margin: 0; }
              body { margin: 0; padding: 0; background: white; color: black; }
              #printable-invoice { width: 100% !important; padding: 5mm !important; margin: 0 !important; box-shadow: none !important; }
            </style>
          </head>
          <body>
            ${invoiceRef.current.outerHTML}
          </body>
        </html>
      `);
      doc.close();
      
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
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
                className="p-8 mx-auto w-[80mm] min-h-[120mm] font-mono text-[12px] leading-tight"
                style={{ width: '80mm', backgroundColor: '#ffffff', color: '#000000' }}
              >
                {/* Header */}
                <div className="text-center mb-6 space-y-1">
                  <p className="font-black text-sm uppercase tracking-tighter">{invoiceHeader.split('\n')[0]}</p>
                  {invoiceHeader.split('\n').slice(1).map((line, i) => (
                    <p key={i} className="text-[10px]">{line}</p>
                  ))}
                  <p 
                    className="font-black text-[11px] uppercase tracking-widest mt-3 border-t border-dashed pt-2 pb-1 inline-block"
                    style={{ borderColor: '#000000' }}
                  >Tax Invoice #{order.id}</p>
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
                </div>

                <div className="border-t border-dashed my-4" style={{ borderColor: '#000000' }}></div>

                {/* Items */}
                <table className="w-full text-[10px] mb-4">
                  <thead>
                    <tr className="border-b border-dashed" style={{ borderColor: '#000000' }}>
                      <th className="text-left py-1 font-black">Item</th>
                      <th className="text-right py-1 font-black">Qty</th>
                      <th className="text-right py-1 font-black">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-1 pr-2">{item.name}</td>
                        <td className="py-1 text-right">{item.qty}</td>
                        <td className="py-1 text-right">${(item.price * item.qty).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t border-dashed my-4" style={{ borderColor: '#000000' }}></div>

                {/* Totals */}
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST):</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-2">
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
