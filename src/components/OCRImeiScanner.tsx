import React, { useEffect, useRef, useState } from 'react';
import { X, Scan, RefreshCw, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OCRImeiScannerProps {
  onScan: (text: string) => void;
  onClose: () => void;
}

export function OCRImeiScanner({ onScan, onClose }: OCRImeiScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('Align barcode/text inside the box');

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Prefer back camera
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Play the video to ensure it's not paused
          videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
      } catch (e: any) {
        console.error("Camera error:", e);
        setStatus('Camera access denied or unavailable.');
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleManualScan = async () => {
    if (!videoRef.current || scanning || !streamRef.current) return;
    
    setScanning(true);
    setStatus('Processing image...');
    
    try {
      const video = videoRef.current;
      // We must wait until video dimensions are known
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setStatus('Camera not ready. Please try again.');
        setScanning(false);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No canvas context');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // The CSS overlay box is essentially 80% width in portrait, or roughly a rectangle
      // Let's grab the middle 80% width, 25% height
      const boxWidth = canvas.width * 0.8;
      const boxHeight = canvas.height * 0.25;
      const boxX = (canvas.width - boxWidth) / 2;
      const boxY = (canvas.height - boxHeight) / 2;

      // @ts-ignore
      if (!window.Tesseract) {
        setStatus('OCR engine not loaded. Please wait a moment.');
        setScanning(false);
        return;
      }

      // @ts-ignore
      const { data: { text } } = await window.Tesseract.recognize(
        canvas,
        'eng',
        { 
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              setStatus(`Recognizing... ${~~(m.progress * 100)}%`);
            }
          }
        },
        {
          rectangle: { top: boxY, left: boxX, width: boxWidth, height: boxHeight }
        }
      );

      console.log("OCR Result Raw:", text);

      // Find best sequence matching IMEI or S/N
      // Mostly uppercase letters and numbers, length roughly 8 to 20
      const words = text.split(/[\s\n]+/).map((w: string) => w.replace(/[^A-Za-z0-9]/g, ''));
      let bestMatch = '';
      
      for (const w of words) {
        // Standard IMEIs are 15 digits. Serial numbers are usually ~10-12 alphanumeric
        if (w.length >= 8 && w.length <= 20) {
          // If we find an exact 15 digit number, that is highly likely an IMEI so prioritize it
          if (/^\d{15}$/.test(w)) {
            bestMatch = w;
            break;
          }
          if (w.length > bestMatch.length) {
            bestMatch = w;
          }
        }
      }
      
      if (bestMatch) {
        setStatus(`Found: ${bestMatch}`);
        onScan(bestMatch.toUpperCase());
        onClose(); 
      } else {
        setStatus('No matching text found. Try again.');
      }
    } catch (e: any) {
      console.error(e);
      setStatus(`Error: ${e.message}`);
    } finally {
      if(status !== 'Found: ' + '...') setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col hidden-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Smartphone size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Scan IMEI</h3>
            <p className="text-white/60 text-xs">{status}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Video Feed */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Viewfinder Overlay Mask (CSS Tricks using box-shadow) */}
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            boxShadow: 'inset 0 0 0 9999px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* Transparent Cutout */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[25%] rounded-2xl border-2 border-white/50"
            style={{
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)'
            }}
          >
            {/* Target corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl -mt-[2px] -ml-[2px]" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl -mt-[2px] -mr-[2px]" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl -mb-[2px] -ml-[2px]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl -mb-[2px] -mr-[2px]" />
            
            {/* Animated Scanning Line */}
            {scanning && (
              <motion.div 
                className="w-full h-0.5 bg-primary absolute top-0 shadow-[0_0_8px_2px_rgba(var(--primary),0.8)]"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-black/50 backdrop-blur-md z-20 flex justify-center pb-safe">
        <button
          onClick={handleManualScan}
          disabled={scanning}
          className="bg-primary text-white font-black px-8 py-5 rounded-[2rem] shadow-xl text-lg flex items-center justify-center gap-3 w-full max-w-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          {scanning ? (
            <>
              <RefreshCw size={24} className="animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Scan size={24} />
              Tap to Scan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
