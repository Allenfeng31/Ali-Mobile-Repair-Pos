"use client";

import React, { useState, useEffect } from "react";
import QuoteRequestModal from "./QuoteRequestModal";

interface RepairTypeClientProps {
  deviceModel: string;
  repairType: string;
  price: number;
}

export default function RepairTypeClient({
  deviceModel,
  repairType,
  price,
}: RepairTypeClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Auto-popup if price is 0 (Quote on Request)
    if (price === 0) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setModalOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [price]);

  return (
    <>
      <QuoteRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        deviceModel={deviceModel}
        repairType={repairType}
      />
    </>
  );
}
