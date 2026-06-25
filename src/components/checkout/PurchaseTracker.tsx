"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/analytics";
import { generateEventId } from "@/lib/events";

interface PurchaseTrackerProps {
  orderNumber?: string;
  total: number;
  items?: string;
}

export function PurchaseTracker({ orderNumber, total, items }: PurchaseTrackerProps) {
  useEffect(() => {
    if (!orderNumber || total <= 0) return;

    // Extract product IDs from encoded items or use a fallback
    let productIds: string[] = [];
    if (items) {
      try {
        const decoded = decodeURIComponent(items);
        const parsed = JSON.parse(decoded);
        productIds = Array.isArray(parsed) 
          ? parsed.map((item: any) => item.id || item.productId || "").filter(Boolean)
          : [];
      } catch (e) {
        console.warn("Failed to parse items", e);
      }
    }

    // If no product IDs found, use a generic one
    if (productIds.length === 0) {
      productIds = ["vevira-product"];
    }

    const purchaseEventId = generateEventId("Purchase");

    trackPurchase(orderNumber, purchaseEventId, total, productIds);
  }, [orderNumber, total, items]);

  return null;
}
