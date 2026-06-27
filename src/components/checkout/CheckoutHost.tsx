"use client";

import { useCheckoutStore } from "@/stores/checkout-store";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";

/** Toujours monté — l’upsell doit s’afficher même si la sidebar panier est fermée. */
export function CheckoutHost() {
  const step = useCheckoutStore((s) => s.step);
  if (step === "idle") return null;
  return <CheckoutModal />;
}
