"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ShoppingBag, ShieldCheck, ChevronLeft, Award, CheckCircle2, HeartHandshake, Shield, Truck, Clock, Droplets, Coffee, Smile, CalendarDays } from "lucide-react";
import Link from "next/link";
import type { Product, ProductOffer } from "@/content/products";
import { getDefaultOffer } from "@/content/products";
import { useCartStore } from "@/stores/cart-store";
import { OfferSelector } from "@/components/product/OfferSelector";
import { StickyProductCTA } from "@/components/product/StickyProductCTA";
import { ImagePlaceholder } from "@/components/product/ImagePlaceholder";
import { SocialProofCarousel } from "@/components/sections/SocialProofCarousel";
import { ComparisonCards } from "@/components/sections/ComparisonCards";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { TrustStrip } from "@/components/trust/TrustStrip";
import { REVIEWS } from "@/content/reviews";
import { FAQS } from "@/content/faqs";
import { formatSARCompact } from "@/lib/money";
import { generateEventId } from "@/lib/events";
import { trackAddToCart, trackViewContent } from "@/lib/analytics";
import { PRODUCT_PAGE_IMAGE_CLASS } from "@/lib/product-image-display";
import { featureImagePath, lifestyleImagePath } from "@/lib/product-detail-images";

interface ProductPageClientProps {
  product: Product;
}

const FEATURE_SECTION_COPY: Record<string, { title: string; subtitle: string }> = {
  joint_pain_oil: {
    title: "الحل اللي صممناه لراحة المفاصل",
    subtitle: "زيت طبيعي للتدليك اليومي — ركبة، ظهر، يدين ورسغ.",
  },
  hair_loss_spray: {
    title: "الحل اللي صممناه لتقوية الشعر",
    subtitle: "رشاش ضد تساقط الشعر — روتين يومي بسيط لفروة الرأس.",
  },
  melasma_cream: {
    title: "الحل اللي صممناه لبشرة موحّدة",
    subtitle: "كريم متخصص في الكلف والبقع — روتين صباح ومساء.",
  },
};

const ACTIVE_INGREDIENTS_COPY: Record<string, string> = {
  joint_pain_oil:
    "مزيج من الزيوت الأساسية والمكوّنات النباتية يُدلك على المنطقة المؤلمة لتهدئة الألم وتحسين المرونة.",
  hair_loss_spray:
    "تركيبة غنية بمكوّنات نشطة تغذّي فروة الرأس وتحفّز الدورة الدموية لتقوية الشعر من الجذور.",
  melasma_cream:
    "مكوّنات تفتيح طبيعية تعمل تدريجيًا على توحيد لون البشرة وتقليل الكلف والبقع الداكنة.",
};

interface UsageStep {
  icon: typeof Droplets;
  title: string;
  body: string;
}

interface UsageProtocol {
  dose: string;
  frequency: string;
  duration: string;
  steps: UsageStep[];
  tips: string[];
  warnings: string[];
}

const USAGE_PROTOCOL: Record<string, UsageProtocol> = {
  joint_pain_oil: {
    dose: "3–5 قطرات",
    frequency: "1–2 مرة يوميًا",
    duration: "2–4 أسابيع",
    steps: [
      {
        icon: Droplets,
        title: "ضع كمية صغيرة",
        body: "ضع 3–5 قطرات في راحة اليد، دفّئ الزيت ثم دلّك المنطقة المؤلمة 2–3 دقائق.",
      },
      {
        icon: HeartHandshake,
        title: "دلّك بلطف",
        body: "حركات دائرية لطيفة حتى الامتصاص — مناسب للركبة، الظهر، الكتف أو الرقبة.",
      },
    ],
    tips: ["للاستخدام الخارجي فقط.", "اغسل يديك بعد التطبيق.", "احفظ المنتج في مكان جاف."],
    warnings: ["لا تُطبّق على جلد مجروح أو متهيّج.", "استشر الطبيب إذا استمر الألم."],
  },
  hair_loss_spray: {
    dose: "5–8 رشّات",
    frequency: "1–2 مرة يوميًا",
    duration: "4–8 أسابيع",
    steps: [
      {
        icon: Droplets,
        title: "فروة رأس نظيفة",
        body: "طبّق على فروة رأس نظيفة وجافة أو رطبة قليلًا.",
      },
      {
        icon: Clock,
        title: "رشّ على الجذور",
        body: "رشّ على فروة الرأس ودلّك 1–2 دقيقة دون شطف.",
      },
    ],
    tips: ["لا تغسل شعرك مباشرة بعد الاستخدام.", "الانتظام هو سر النتائج."],
    warnings: ["تجنّب ملامسة العينين.", "أوقف الاستخدام عند ظهور تهيّج."],
  },
  melasma_cream: {
    dose: "طبقة رقيقة",
    frequency: "صباحًا ومساءً",
    duration: "4–8 أسابيع",
    steps: [
      {
        icon: Smile,
        title: "بشرة نظيفة",
        body: "ضع طبقة رقيقة على المناطق الداكنة بعد تنظيف البشرة.",
      },
      {
        icon: Shield,
        title: "واقي شمس نهارًا",
        body: "استخدم واقي شمس كل صباح لحماية أفضل.",
      },
    ],
    tips: ["النتائج تظهر تدريجيًا مع الاستمرار.", "تجنّب التعرّض المباشر للشمس."],
    warnings: ["تجنّب منطقة حول العينين.", "راجع طبيب الجلد إذا كان الكلف شديدًا."],
  },
};

export function ProductPageClient({ product }: ProductPageClientProps) {
  const { addItem, openCart } = useCartStore();
  const [selectedOffer, setSelectedOffer] = useState<ProductOffer>(() => getDefaultOffer(product.offers));
  const [showSticky, setShowSticky] = useState(false);
  const heroImage = product.mainImage ?? "";

  useEffect(() => {
    trackViewContent(product.id, selectedOffer.price);
    const handleScroll = () => setShowSticky(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [product.id, selectedOffer.price]);

  const handleAddToCart = () => {
    const eventId = generateEventId("AddToCart");
    addItem({
      productId: product.id,
      productName: product.nameAr,
      quantity: selectedOffer.quantity,
      unitBundlePrice: selectedOffer.price,
      offerPrice: selectedOffer.price,
      offerLabel: selectedOffer.label,
      source: "product_page",
    });
    trackAddToCart(product.id, selectedOffer.price, eventId);
    openCart();
  };

  const productReviews = REVIEWS.filter(
    (r) => !r.productId || r.productId === product.id
  );

  return (
    <>
      <TrustStrip />

      {/* Breadcrumb */}
      <div className="container-max py-3">
        <nav className="flex items-center gap-2 text-xs text-brand-gray">
          <Link href="/" className="hover:text-brand-teal">الرئيسية</Link>
          <ChevronLeft className="w-3 h-3" />
          <Link href="/products" className="hover:text-brand-teal">المنتجات</Link>
          <ChevronLeft className="w-3 h-3" />
          <span className="text-brand-charcoal">{product.shortNameAr}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="section-padding pt-4">
        <div className="container-max">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="order-2 md:order-1"
            >
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4 border border-green-200">
                <ShieldCheck className="w-4 h-4" />
                <span>طبيعي • مكوّنات نشطة واضحة</span>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-brand-charcoal">+4.8 من مئات العملاء في المغرب</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-brand-charcoal mb-4 leading-tight">
                {product.heroHeadline}
              </h1>
              <p className="text-brand-charcoal font-bold text-xl mb-3">{product.nameAr}</p>
              <p className="text-brand-gray text-lg leading-relaxed mb-6">{product.heroSubheading}</p>

              {/* Benefits with high conversion icons */}
              <ul className="space-y-3 mb-8">
                {product.benefits.slice(0, 4).map((b, i) => (
                  <li key={i} className="flex items-center gap-3 text-base font-medium text-brand-charcoal">
                    <span className="w-6 h-6 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              {/* Offers — 2 bottles (289 MAD) selected by default */}
              <div className="mb-6 bg-brand-sand/30 p-5 rounded-2xl border border-brand-sand">
                <p className="text-base font-bold text-brand-charcoal mb-4">اختر العرض المناسب لك:</p>
                <OfferSelector
                  offers={product.offers}
                  onOfferChange={setSelectedOffer}
                />
              </div>

              {/* CTA */}
              <button
                onClick={handleAddToCart}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <ShoppingBag className="w-6 h-6" />
                اطلب الآن — ثقة تبدأ من إطلالتك
                <span className="font-extrabold bg-white/20 px-2 py-1 rounded-lg">{formatSARCompact(selectedOffer.price)}</span>
              </button>
              
              {/* Trust Under CTA */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-brand-gray bg-gray-50 py-2 rounded-lg">
                  <Truck className="w-4 h-4 text-brand-teal" />
                  توصيل سريع (2-4 أيام)
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-brand-gray bg-gray-50 py-2 rounded-lg">
                  <Shield className="w-4 h-4 text-brand-teal" />
                  ضمان ذهبي 30 يوم
                </div>
              </div>
            </motion.div>

            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="order-1 md:order-2 relative"
            >
              {/* Warranty Badge Overlay */}
              <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-brand-gold/20">
                <Award className="w-5 h-5 text-brand-gold" />
                <span className="font-bold text-sm text-brand-charcoal">ضمان 30 يوم</span>
              </div>
              
              {heroImage ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-white shadow-card md:aspect-[16/10]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.cardImage ?? heroImage}
                    alt={product.imagePlaceholders[0]?.alt ?? product.nameAr}
                    className={PRODUCT_PAGE_IMAGE_CLASS[product.id]}
                  />
                </div>
              ) : (
                <ImagePlaceholder
                  label={product.imagePlaceholders[0]?.label ?? "صورة المنتج"}
                  alt={product.imagePlaceholders[0]?.alt ?? product.nameAr}
                  className="h-80 md:h-[500px] rounded-3xl shadow-card"
                />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Authority & Science Proof Section */}
      <section className="py-16 bg-brand-mint/30 border-y border-brand-mint/50">
        <div className="container-max">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 text-center">
            <div className="flex flex-col items-center gap-3 max-w-xs">
              <div className="w-20 h-20 rounded-full bg-white shadow-soft flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-bold text-brand-charcoal text-xl">مكوّنات طبيعية</h3>
              <p className="text-sm text-brand-gray">مكوّناتنا طبيعية ومفصّحة بوضوح لضمان أمانك التام.</p>
            </div>
            <div className="hidden md:block w-px h-24 bg-gray-200"></div>
            <div className="flex flex-col items-center gap-3 max-w-xs">
              <div className="w-20 h-20 rounded-full bg-white shadow-soft flex items-center justify-center">
                <HeartHandshake className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="font-bold text-brand-charcoal text-xl">تركيبات نشطة فعّالة</h3>
              <p className="text-sm text-brand-gray">{ACTIVE_INGREDIENTS_COPY[product.id]}</p>
            </div>
            <div className="hidden md:block w-px h-24 bg-gray-200"></div>
            <div className="flex flex-col items-center gap-3 max-w-xs">
              <div className="w-20 h-20 rounded-full bg-white shadow-soft flex items-center justify-center">
                <Award className="w-10 h-10 text-brand-gold" />
              </div>
              <h3 className="font-bold text-brand-charcoal text-xl">ضمان ذهبي 30 يوم</h3>
              <p className="text-sm text-brand-gray">استرجاع سهل وبدون تعقيد لأن ثقتنا في منتجاتنا مطلقة.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain section - Emotional Connection */}
      <section className="section-padding bg-brand-charcoal text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-teal via-transparent to-transparent"></div>
        <div className="container-max max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-brand-mint font-bold text-sm tracking-wider mb-2 block">نعرف شعوركِ تمامًا</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
              تفاصيل صغيرة.. تأخذ الكثير من تفكيركِ وثقتكِ
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              ندرك أن مظهركِ هو جزء من حضوركِ القوي في كل مناسبة وصورة. الإحباط من الحلول المؤقتة والمنتجات التي لا تفيد انتهى. فيرا بيوتي هنا ليقدم لكِ العناية التي تستحقينها.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {product.painAngles.map((pain, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-brand-mint/50 transition-colors flex flex-col items-center text-center transform hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-brand-teal/30 flex items-center justify-center mb-6">
                  <span className="text-3xl">💭</span>
                </div>
                <p className="text-white font-medium text-lg leading-relaxed">"{pain}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alternating Features Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-charcoal mb-4">
              {FEATURE_SECTION_COPY[product.id]?.title ?? "الحل اللي صممناه خصيصًا لإطلالتك"}
            </h2>
            <p className="text-brand-gray text-lg max-w-2xl mx-auto">
              {FEATURE_SECTION_COPY[product.id]?.subtitle ??
                "كل تفصيلة في فيرا بيوتي مدروسة بعناية لتمنحك نتيجة تجميلية واضحة مع الاستمرار."}
            </p>
          </div>

          <div className="space-y-20">
            {product.features.map((feature, index) => {
              const isEven = index % 2 === 0;
              const featureSrc =
                product.featureImages?.[index] ?? featureImagePath(product.slug, index);
              const fallbackSrc = product.cardImage ?? product.mainImage ?? "";
              return (
                <div key={index} className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-10 items-center`}>
                  <div className="w-full md:w-1/2">
                    {featureSrc || fallbackSrc ? (
                      <div className="h-80 md:h-[400px] rounded-3xl shadow-card w-full overflow-hidden bg-gradient-to-b from-brand-sand/30 to-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={featureSrc || fallbackSrc}
                          alt={feature.title}
                          className="h-full w-full object-cover object-center"
                          onError={(e) => {
                            if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
                              e.currentTarget.src = fallbackSrc;
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <ImagePlaceholder
                        label={`ميزة: ${feature.title}`}
                        alt={feature.title}
                        className="h-80 md:h-[400px] rounded-3xl shadow-card w-full"
                      />
                    )}
                  </div>
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-2">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-brand-charcoal">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-brand-gray leading-relaxed">
                      {feature.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ingredients / Materials Section */}
      <section className="section-padding bg-brand-charcoal text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-teal via-transparent to-transparent"></div>
        <div className="container-max max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-brand-mint font-bold text-sm tracking-wider mb-2 block">السر في التركيبة</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
              مكوّنات نشطة.. نتائج تلاحظينها
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              لا نعتمد على الوعود الفارغة. كل قطرة وكل مسحة تحتوي على تركيبة طبيعية مفصّحة، صُممت لتمنحك نتيجة فعلية مع الاستمرار.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {product.materials.map((mat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:border-brand-mint/40 transition-colors shadow-2xl transform hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-brand-teal flex items-center justify-center mb-6 shadow-lg">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-extrabold text-2xl mb-4 text-brand-mint">{mat.title}</h3>
                {mat.status === "TO_CONFIRM" ? (
                  <p className="text-gray-300 text-base leading-relaxed font-medium">
                    مكوّن نشط فعّال ضمن تركيبة واضحة وآمنة للاستخدام اليومي المستمر.
                  </p>
                ) : (
                  <p className="text-gray-300 text-base leading-relaxed font-medium">{mat.body}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to use — pharmacist-style protocol */}
      {USAGE_PROTOCOL[product.id] && (
        <section className="section-padding bg-white">
          <div className="container-max max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 bg-brand-mint text-brand-teal font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
                <ShieldCheck className="w-4 h-4" />
                نشرة الاستخدام
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-charcoal mb-4">
                كيفية الاستخدام — خطوات بسيطة
              </h2>
              <p className="text-brand-gray text-lg max-w-2xl mx-auto">
                التزمي بهذا البروتوكول البسيط للحصول على نتائج فعلية مع الاستمرار.
              </p>
            </div>

            {/* Dose / Frequency / Duration cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {[
                { label: "الجرعة", value: USAGE_PROTOCOL[product.id].dose, icon: Droplets },
                { label: "التكرار", value: USAGE_PROTOCOL[product.id].frequency, icon: Clock },
                { label: "مدة الكورس", value: USAGE_PROTOCOL[product.id].duration, icon: CalendarDays },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-brand-mint/40 border border-brand-teal/20 rounded-2xl p-5 text-center">
                  <Icon className="w-7 h-7 text-brand-teal mx-auto mb-2" />
                  <p className="text-xs font-bold text-brand-gray uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-base font-bold text-brand-charcoal leading-snug">{value}</p>
                </div>
              ))}
            </div>

            {/* Steps timeline */}
            <div className="space-y-6 mb-12">
              {USAGE_PROTOCOL[product.id].steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex gap-5 items-start bg-white border-2 border-brand-mint rounded-2xl p-6 shadow-soft">
                    <div className="flex-shrink-0 relative">
                      <div className="w-14 h-14 rounded-2xl bg-brand-teal flex items-center justify-center text-white">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-gold text-white text-sm font-extrabold flex items-center justify-center shadow-md">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-brand-charcoal text-lg md:text-xl mb-1">{step.title}</h3>
                      <p className="text-brand-gray leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tips full-width */}
            <div className="bg-brand-mint/30 rounded-2xl p-6 border border-brand-teal/15">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-6 h-6 text-brand-teal" />
                <h3 className="font-extrabold text-brand-charcoal text-lg">نصائح لزيادة الفعالية</h3>
              </div>
              <ul className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                {USAGE_PROTOCOL[product.id].tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-brand-charcoal leading-relaxed">
                    <span className="text-brand-teal font-bold mt-0.5">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {product.testimonialImage ? (
        <section className="section-padding bg-white">
          <div className="container-max max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-brand-teal font-bold text-sm tracking-wider mb-2 block">نتائج حقيقية</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-brand-charcoal">
                الفرق يظهر مع الانتظام — كما تلاحظينه أنتِ
              </h2>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-card bg-gradient-to-b from-brand-sand/30 to-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.testimonialImage}
                alt={`نتائج ${product.shortNameAr} — قبل وبعد`}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* Social proof */}
      <section className="section-padding bg-brand-sand/50 overflow-hidden">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="text-brand-teal font-bold text-sm tracking-wider mb-2 block">تجارب حقيقية</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-charcoal mb-4">
              آلاف العملاء في المغرب يثقون بنا
            </h2>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 fill-brand-gold text-brand-gold" />
              ))}
              <span className="mr-2 font-bold text-brand-charcoal text-lg">4.8/5</span>
            </div>
          </div>
          <SocialProofCarousel reviews={productReviews} />
        </div>
      </section>

      {/* UGC placeholders */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-charcoal mb-8 text-center">
            شوف المنتج على الطبيعة
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" dir="ltr">
            {(product.lifestyleImages?.length
              ? product.lifestyleImages
              : product.imagePlaceholders.map((item, i) => ({
                  src: lifestyleImagePath(product.slug, i),
                  alt: item.alt,
                }))
            )
              .map((item, i) => ({
                ...item,
                src: item.src || lifestyleImagePath(product.slug, i),
              }))
              .filter((item) => item.src)
              .map((item, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="rounded-3xl aspect-[3/4] shadow-soft hover:shadow-card transition-all transform hover:-translate-y-1 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="h-full w-full object-cover object-center"
                    onError={(e) => {
                      const fallback = product.cardImage ?? product.mainImage ?? "";
                      if (fallback && e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                  />
                </div>
                <p className="text-center text-sm font-semibold text-brand-charcoal leading-snug px-1" dir="rtl">
                  {item.alt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="text-brand-teal font-bold text-sm tracking-wider mb-2 block">الفرق باين</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-charcoal mb-4">
              علاش فيرا بيوتي ماشي أي منتج عادي؟
            </h2>
          </div>
          <ComparisonCards />
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-white">
        <div className="container-max max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-charcoal mb-4">
              عندك استفسار؟
            </h2>
            <p className="text-brand-gray text-lg">جمعنا لك أكثر الأسئلة اللي توصلنا من عملائنا</p>
          </div>
          <FAQAccordion faqs={FAQS} />
        </div>
      </section>

      {/* Sticky CTA mobile */}
      <StickyProductCTA
        productName={product.nameAr}
        selectedOffer={selectedOffer}
        onAddToCart={handleAddToCart}
        visible={showSticky}
      />
    </>
  );
}
