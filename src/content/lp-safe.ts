/** Safe copy for /lp — no medical claims, Morocco cities */

import type { Review } from "@/content/reviews";

export const LP_SAFE_REVIEWS: Review[] = [
  {
    id: "lp-r1",
    text: "طلبت بسهولة والتوصيل كان سريع. الدفع عند الاستلام ريّحني.",
    author: "نورة — الدار البيضاء",
    rating: 5,
    isPlaceholder: true,
  },
  {
    id: "lp-r2",
    text: "تجربة شراء واضحة، تأكيد قبل التوصيل، وخدمة بالعربية.",
    author: "فاطمة — الرباط",
    rating: 5,
    isPlaceholder: true,
  },
];

/** @deprecated use LP_SAFE_REVIEWS */
export const LP_REVIEWS = LP_SAFE_REVIEWS;

export const LP_RECENT_ORDERS = [
  { name: "فاطمة", city: "الدار البيضاء", minutesAgo: 6 },
  { name: "مريم", city: "الرباط", minutesAgo: 11 },
  { name: "أمل", city: "مراكش", minutesAgo: 18 },
  { name: "سارة", city: "طنجة", minutesAgo: 24 },
  { name: "خديجة", city: "فاس", minutesAgo: 31 },
];

/** @deprecated use LP_RECENT_ORDERS */
export const LP_FAKE_ACTIVITY = LP_RECENT_ORDERS;
