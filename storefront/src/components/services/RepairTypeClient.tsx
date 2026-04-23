"use client";

import React, { useState, useEffect } from "react";
import { analytics } from "@/lib/analytics";
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
    // Track page view for this specific combination
    analytics.trackRepairView(deviceModel, repairType);

    // Auto-popup if price is 0 (Quote on Request)
    if (price === 0) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setModalOpen(true);
      }, 1200); // Slightly longer delay to ensure user sees the page first
      return () => clearTimeout(timer);
    }
  }, [deviceModel, repairType, price]);

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
