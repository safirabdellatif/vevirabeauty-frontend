"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkout-store";
import { submitUpsell } from "@/lib/api";
import { generateEventId } from "@/lib/events";
import { formatSARCompact } from "@/lib/money";
import { resolveUpsellDisplay } from "@/lib/resolve-upsell-display";
import { useRouter } from "next/navigation";
import { ImagePlaceholder } from "@/components/product/ImagePlaceholder";

const ORDER_SUMMARY_STORAGE_KEY = "vevirabeauty-last-order-summary";

function encodeItems(items: { productId: string; productName: string; quantity: number; price: number }[]): string {
  try {
    if (typeof window === "undefined") return "";
    return encodeURIComponent(window.btoa(unescape(encodeURIComponent(JSON.stringify(items)))));
  } catch {
    return "";
  }
}

export function UpsellModal() {
  const { upsell, orderId, orderNumber, orderTotal, orderItems, reset } = useCheckoutStore();
  const [secondsLeft, setSecondsLeft] = useState(upsell?.expiresInSeconds ?? 15);
  const [deciding, setDeciding] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  const saveOrderSummary = (items = orderItems, total = orderTotal) => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(
        ORDER_SUMMARY_STORAGE_KEY,
        JSON.stringify({
          orderNumber,
          total,
          items,
        })
      );
    } catch {
      // The thank-you page can still show payment details from the URL.
    }
  };

  const buildThankYouUrl = (
    items: { productId: string; productName: string; quantity: number; price: number }[],
    total: number | null,
    upsellAccepted: boolean
  ) => {
    const params = new URLSearchParams();
    if (orderNumber) params.set("order", orderNumber);
    if (upsellAccepted) params.set("upsell", "accepted");
    if (total !== null && total !== undefined) params.set("total", String(total));
    const encoded = encodeItems(items);
    if (encoded) params.set("items", encoded);
    return `/thank-you?${params.toString()}`;
  };

  const handleDecline = useCallback(async () => {
    if (deciding) return;
    setDeciding(true);
    if (orderId) {
      await submitUpsell(orderId, { accepted: false }).catch(() => {});
    }
    saveOrderSummary();
    const url = buildThankYouUrl(orderItems, orderTotal, false);
    reset();
    router.push(url);
  }, [deciding, orderId, orderItems, orderNumber, orderTotal, reset, router]);

  const handleAccept = async () => {
    if (deciding || !upsell || !orderId) return;
    clearInterval(timerRef.current!);
    setDeciding(true);
    const display = resolveUpsellDisplay(upsell);
    const eventId = generateEventId("UpsellAccept");
    const result = await submitUpsell(orderId, {
      accepted: true,
      productId: display.productId,
      eventId,
    }).catch(() => {});
    const finalTotal = result?.total ?? (orderTotal !== null ? orderTotal + display.price : null);
    const itemsWithUpsell = [
      ...orderItems,
      {
        productId: display.productId,
        productName: display.nameAr,
        quantity: 1,
        price: display.price,
      },
    ];
    saveOrderSummary(itemsWithUpsell, finalTotal);
    const url = buildThankYouUrl(itemsWithUpsell, finalTotal, true);
    reset();
    router.push(url);
  };

  useEffect(() => {
    if (!upsell) return;
    setSecondsLeft(upsell.expiresInSeconds);
    setImageFailed(false);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          void handleDecline();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [upsell, handleDecline]);

  if (!upsell) return null;

  const display = resolveUpsellDisplay(upsell);

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-modal max-w-sm w-full p-7 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-brand-gold/20 text-brand-gold font-bold text-2xl flex items-center justify-center mx-auto mb-5">
          {secondsLeft}
        </div>

        <p className="text-xs text-brand-teal font-semibold uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          عرض خاص لطلبك فقط
        </p>

        <div className="mx-auto mb-4 aspect-[4/3] w-full max-w-[260px] overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
          {display.imageSrc && !imageFailed ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={display.imageSrc}
              alt={display.nameAr}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <ImagePlaceholder
              label={display.shortNameAr}
              alt={display.nameAr}
              className="h-full w-full rounded-none"
              showBrand={false}
            />
          )}
        </div>

        <h2 className="text-xl font-extrabold text-brand-charcoal mb-1">{display.nameAr}</h2>
        {display.copy && (
          <p className="text-sm font-bold text-brand-gold mb-2">{display.copy}</p>
        )}
        {display.subheading && (
          <p className="text-xs text-brand-gray leading-relaxed mb-4 line-clamp-3">{display.subheading}</p>
        )}

        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="text-sm text-brand-gray line-through">{formatSARCompact(display.regularPrice)}</span>
          <span className="font-extrabold text-brand-teal text-2xl">{formatSARCompact(display.price)}</span>
        </div>

        <p className="text-sm text-brand-gray leading-relaxed mb-5">
          أضيفي {display.shortNameAr} لطلبك الآن — الدفع عند الاستلام، بدون إعادة إدخال بياناتك.
        </p>

        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-brand-gold rounded-full"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: display.expiresInSeconds, ease: "linear" }}
          />
        </div>

        <button
          onClick={handleAccept}
          disabled={deciding}
          className="btn-primary w-full py-4 text-base font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mb-3 disabled:opacity-60 disabled:transform-none"
        >
          أضيفي {display.shortNameAr} — {formatSARCompact(display.price)}
        </button>
        <button
          onClick={() => void handleDecline()}
          disabled={deciding}
          className="text-sm text-brand-gray font-medium hover:text-brand-charcoal transition-colors disabled:opacity-60"
        >
          لا شكرًا، أكملي الطلب بدون العرض
        </button>
      </motion.div>
    </div>
  );
}
