"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import type { ProductOffer } from "@/content/products";
import { formatSARCompact } from "@/lib/money";
import { cn } from "@/lib/utils";

interface OfferSelectorProps {
  offers: ProductOffer[];
  onOfferChange?: (offer: ProductOffer) => void;
  /** Show only the first offer until the user expands. */
  collapsible?: boolean;
}

function OfferRow({
  offer,
  isSelected,
  onSelect,
}: {
  offer: ProductOffer;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const originalPrice = offer.quantity * 199;
  const saving = originalPrice - offer.price;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 text-right transition-all duration-200 cursor-pointer",
        isSelected
          ? "border-brand-teal bg-brand-mint shadow-soft"
          : "border-gray-200 bg-white hover:border-brand-teal/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
            isSelected ? "border-brand-teal bg-brand-teal" : "border-gray-300"
          )}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
        <div>
          <div className="font-semibold text-brand-charcoal">{offer.label}</div>
          {saving > 0 && (
            <div className="text-xs text-brand-success mt-0.5">
              وفّري {saving} درهم مقارنة بالسعر المفرد
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-start gap-1">
        {offer.badge && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              offer.badge === "الأكثر طلبًا"
                ? "bg-brand-teal text-white"
                : offer.badge === "أفضل قيمة"
                ? "bg-brand-gold text-white"
                : "bg-gray-100 text-brand-gray"
            )}
          >
            {offer.badge}
          </span>
        )}
        <div className="flex items-center gap-2">
          {saving > 0 && (
            <span className="text-xs text-brand-gray line-through">
              {originalPrice} درهم
            </span>
          )}
          <span className="font-bold text-brand-teal text-lg">
            {formatSARCompact(offer.price)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export function OfferSelector({
  offers,
  onOfferChange,
  collapsible = false,
}: OfferSelectorProps) {
  const primaryOffer = offers[0];
  const extraOffers = offers.slice(1);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<ProductOffer>(primaryOffer);

  const handleSelect = (offer: ProductOffer) => {
    setSelected(offer);
    onOfferChange?.(offer);
  };

  const showExtras = !collapsible || expanded;

  return (
    <div className="flex flex-col gap-3">
      <OfferRow
        offer={primaryOffer}
        isSelected={selected.quantity === primaryOffer.quantity}
        onSelect={() => handleSelect(primaryOffer)}
      />

      {collapsible && !expanded && extraOffers.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-teal/40 bg-white px-5 py-3.5 text-sm font-bold text-brand-teal hover:bg-brand-mint/30 transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
          شوف عروض أوفر — قطعتان و 3 قطع
        </button>
      )}

      <AnimatePresence>
        {showExtras &&
          extraOffers.map((offer) => (
            <motion.div
              key={offer.quantity}
              initial={collapsible ? { opacity: 0, height: 0 } : false}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <OfferRow
                offer={offer}
                isSelected={selected.quantity === offer.quantity}
                onSelect={() => handleSelect(offer)}
              />
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
