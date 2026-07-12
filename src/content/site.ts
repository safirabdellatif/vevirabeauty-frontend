export const SITE = {
  name: "فيرا بيوتي",
  nameEn: "Vevira Beauty",
  logo: "/logo.png",
  logoAlt: "فيرا بيوتي — Vevira Beauty",
  tagline: "عناية طبيعية تصل لباب دارك",
  url: "https://vevirabeauty.com",
  apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  supportEmail: "contact@vevirabeauty.com",
  whatsappPhone: "212755282978",
  whatsappDisplay: "07 55 28 29 78",
  whatsappUrl:
    "https://wa.me/212755282978?text=" +
    encodeURIComponent("السلام عليكم، بغيت نسول على منتجات فيرا بيوتي"),
  social: {
    tiktok: "https://tiktok.com/@vevirabeauty",
    snapchat: "https://snapchat.com/add/vevirabeauty",
    instagram: "https://instagram.com/vevirabeauty",
  },
  trustBadges: [
    { label: "تركيبات طبيعية مختارة", icon: "shield-check" },
    { label: "مكوّنات مفصّحة", icon: "badge-check" },
    { label: "توصيل لجميع مدن المغرب", icon: "truck" },
    { label: "الدفع عند الاستلام", icon: "award" },
  ],
  globalDisclaimer:
    "منتجات فيرا بيوتي للعناية والاستخدام الخارجي. النتائج تختلف من شخص لآخر مع الاستمرار، وليست بديلاً عن استشارة الطبيب أو الصيدلي للحالات الطبية.",
};
