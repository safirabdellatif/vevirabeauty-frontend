export type ProductId = "joint_pain_oil" | "hair_loss_spray" | "melasma_cream";

export interface ProductOffer {
  quantity: 1 | 2 | 3;
  price: number;
  label: string;
  badge: string;
  defaultSelected?: boolean;
}

export interface ProductFeature {
  title: string;
  body: string;
  icon: string;
}

export interface ProductMaterial {
  title: string;
  body: string;
  status?: "TO_CONFIRM";
}

export interface ProductImagePlaceholder {
  alt: string;
  label: string;
}

export interface ProductGalleryImage {
  src: string;
  alt: string;
}

export interface Product {
  id: ProductId;
  slug: string;
  sku: string;
  nameAr: string;
  shortNameAr: string;
  heroHeadline: string;
  heroSubheading: string;
  painAngles: string[];
  benefits: string[];
  features: ProductFeature[];
  materials: ProductMaterial[];
  useCases: string[];
  offers: ProductOffer[];
  crossSellProductIds: ProductId[];
  upsellProductId: ProductId;
  upsellCopy: string;
  imagePlaceholders: ProductImagePlaceholder[];
  mainImage?: string;
  cardImage?: string;
  galleryImages?: ProductGalleryImage[];
  featureImages?: string[];
  lifestyleImages?: ProductGalleryImage[];
  testimonialImage?: string;
  scienceAngle: string;
  disclaimer: string;
}

export const OFFERS: ProductOffer[] = [
  { quantity: 1, price: 199, label: "قطعة واحدة", badge: "للتجربة" },
  { quantity: 2, price: 289, label: "قطعتان", badge: "الأكثر طلبًا", defaultSelected: true },
  { quantity: 3, price: 369, label: "3 قطع", badge: "أفضل قيمة" },
];

const DISCLAIMER =
  "منتج عناية للاستخدام الخارجي. النتائج تختلف من شخص لآخر مع الاستمرار، وليس بديلاً عن استشارة الطبيب أو الصيدلي.";

export const PRODUCTS: Record<ProductId, Product> = {
  joint_pain_oil: {
    id: "joint_pain_oil",
    slug: "joint-pain-oil",
    sku: "VEVIRA-JO-40",
    mainImage: "/products/joint-pain-oil.png",
    nameAr: "زيت آلام المفاصل والعضلات",
    shortNameAr: "زيت آلام المفاصل",
    heroHeadline: "تخفيف آلام المفاصل والعضلات — طبيعي وسريع",
    heroSubheading:
      "زيت طبيعي بمزيج من الزيوت الأساسية والمكوّنات النباتية، يُدلك مباشرة على المنطقة المؤلمة لتهدئة الألم وتحسين الحركة والمرونة.",
    painAngles: [
      "آلام الركبة أو الظهر تمنعك من الحركة بحرية؟",
      "تعاني من تيبّس المفاصل خاصة صباحًا أو بعد الجهد؟",
      "تبحث عن حل طبيعي بدون حبوب أو مواعيد عيادة؟",
    ],
    benefits: [
      "يهدّئ آلام المفاصل والعضلات بسرعة عند التدليك",
      "يحسّن المرونة ويقلّل التيبّس مع الاستخدام المنتظم",
      "تركيبة طبيعية من زيوت أساسية ومكوّنات نباتية",
      "سهل الاستخدام — تدليك يومي لمدة دقائق",
      "مناسب للركبة، الظهر، الكتف، والرقبة",
    ],
    features: [
      { title: "مزيج زيوت طبيعية", body: "تركيبة غنية بزيوت أساسية مختارة لتهدئة الألم وتحفيز الدورة الدموية.", icon: "badge-check" },
      { title: "امتصاص سريع", body: "قوام خفيف يُمتص بسرعة دون ترك طبقة دهنية — مثالي للاستخدام اليومي.", icon: "heart" },
      { title: "تدليك بسيط", body: "ضع كمية صغيرة ودلّك بلطف 2–3 دقائق على المنطقة المؤلمة.", icon: "moon" },
      { title: "للاستخدام اليومي", body: "يمكن تكراره صباحًا ومساءً أو بعد النشاط البدني.", icon: "armchair" },
    ],
    materials: [
      { title: "زيوت أساسية مهدّئة", body: "TO_CONFIRM", status: "TO_CONFIRM" },
      { title: "مستخلصات نباتية", body: "TO_CONFIRM", status: "TO_CONFIRM" },
      { title: "حجم العبوة", body: "TO_CONFIRM", status: "TO_CONFIRM" },
    ],
    useCases: ["آلام الركبة", "آلام الظهر", "تيبّس المفاصل", "آلام بعد الجهد"],
    offers: OFFERS,
    crossSellProductIds: ["hair_loss_spray", "melasma_cream"],
    upsellProductId: "hair_loss_spray",
    upsellCopy: "أضف رشاش تساقط الشعر للطلب بسعر خاص مرة واحدة فقط",
    scienceAngle:
      "التدليك بالزيوت الطبيعية يحفّز الدورة الدموية في المنطقة المصابة، فيساعد على تخفيف الالتهاب وتهدئة الألم — طريقة تقليدية موثوقة تُستخدم منذ قرون في العناية بالمفاصل.",
    disclaimer: DISCLAIMER,
    imagePlaceholders: [
      { alt: "زيت آلام المفاصل", label: "زيت المفاصل - صورة المنتج" },
      { alt: "طريقة التدليك", label: "طريقة الاستخدام" },
      { alt: "مكوّنات طبيعية", label: "تركيبة طبيعية" },
      { alt: "راحة المفاصل", label: "راحة ومرونة" },
    ],
    cardImage: "/products/joint-pain-oil-card.png",
  },
  hair_loss_spray: {
    id: "hair_loss_spray",
    slug: "hair-loss-spray",
    sku: "VEVIRA-HS-41",
    mainImage: "/products/hair-loss-spray.png",
    nameAr: "رشاش تساقط الشعر وتكثيفه",
    shortNameAr: "رشاش تساقط الشعر",
    heroHeadline: "وقف التساقط — شعر أقوى من الجذور",
    heroSubheading:
      "رشاش متقدم يُغذّي فروة الرأس ويقوّي البصيلات من الجذور. تركيبة غنية بمكوّنات نشطة تحفّز الدورة الدموية وتقلّل التساقط مع الاستمرار.",
    painAngles: [
      "شعرك يتساقط بكثرة في الحمام أو على الوسادة؟",
      "لاحظت خفّة في الشعر أو فراغات واضحة؟",
      "جربت منتجات كثيرة بدون نتيجة حقيقية؟",
    ],
    benefits: [
      "يقلّل التساقط الظاهر مع الاستخدام المنتظم",
      "يغذّي فروة الرأس ويقوّي الشعر من الجذور",
      "يحفّز الدورة الدموية في فروة الرأس",
      "سهل الاستخدام — رشّ مباشر على فروة الرأس",
      "مناسب للرجال والنساء",
    ],
    features: [
      { title: "مكوّنات نشطة", body: "تركيبة غنية بعناصر تدعم قوة البصيلات وتقلّل التساقط.", icon: "badge-check" },
      { title: "رشّ مباشر", body: "تطبيق سهل على فروة الرأس دون دهون أو بقايا.", icon: "heart" },
      { title: "روتين يومي", body: "استخدمه مرة أو مرتين يوميًا على فروة رأس نظيفة.", icon: "moon" },
      { title: "للرجال والنساء", body: "مناسب لجميع أنواع الشعر وللجنسين.", icon: "armchair" },
    ],
    materials: [
      { title: "مكوّنات تقوية الشعر", body: "TO_CONFIRM", status: "TO_CONFIRM" },
      { title: "محفّزات الدورة الدموية", body: "TO_CONFIRM", status: "TO_CONFIRM" },
      { title: "حجم العبوة", body: "TO_CONFIRM", status: "TO_CONFIRM" },
    ],
    useCases: ["تساقط الشعر", "ضعف البصيلات", "ترقّق الشعر", "تقوية الجذور"],
    offers: OFFERS,
    crossSellProductIds: ["joint_pain_oil", "melasma_cream"],
    upsellProductId: "melasma_cream",
    upsellCopy: "أضف كريم الكلف للطلب بسعر خاص مرة واحدة فقط",
    scienceAngle:
      "التغذية المباشرة لفروة الرأس عبر الرشّ تحفّز الدورة الدموية وتصل المكوّنات النشطة للبصيلات — الطريقة الأكثر فعالية للعناية بالشعر من المصدر.",
    disclaimer: DISCLAIMER,
    imagePlaceholders: [
      { alt: "رشاش تساقط الشعر", label: "رشاش الشعر - صورة المنتج" },
      { alt: "طريقة الرش", label: "طريقة الاستخدام" },
      { alt: "تقوية الجذور", label: "تقوية من الجذور" },
      { alt: "شعر أكثف", label: "نتائج تدريجية" },
    ],
    cardImage: "/products/hair-loss-spray-card.png",
  },
  melasma_cream: {
    id: "melasma_cream",
    slug: "melasma-cream",
    sku: "VEVIRA-MC-39",
    mainImage: "/products/melasma-cream.png",
    nameAr: "كريم الكلف وتفتيح البقع الداكنة",
    shortNameAr: "كريم الكلف",
    heroHeadline: "ودّعي الكلف — بشرة موحّدة ومشرقة",
    heroSubheading:
      "كريم متخصص في تفتيح البقع الداكنة وتوحيد لون البشرة. تركيبة طبيعية تعمل على تقليل الكلف والبقع الناتجة عن الشمس والهرمونات.",
    painAngles: [
      "تعاني من بقع بنية أو كلف على وجهك بعد الشمس؟",
      "لون بشرتك غير موحّد وتبحثين عن حل فعّال؟",
      "تعبتِ من مستحضرات التفتيح بدون نتيجة؟",
    ],
    benefits: [
      "يساعد على تفتيح الكلف والبقع الداكنة تدريجيًا",
      "يوحّد لون البشرة ويمنحها إشراقة طبيعية",
      "تركيبة لطيفة من مكوّنات طبيعية",
      "سهل الدمج في روتين العناية اليومي",
      "مناسب للوجه والرقبة",
    ],
    features: [
      { title: "مكوّنات تفتيح طبيعية", body: "تركيبة مختارة لتقليل إنتاج الميلانين وتوحيد لون البشرة.", icon: "badge-check" },
      { title: "لطيف على البشرة", body: "قوام كريمي ناعم يناسب الاستخدام اليومي.", icon: "heart" },
      { title: "روتين بسيط", body: "ضعي طبقة رقيقة صباحًا ومساءً على المناطق الداكنة.", icon: "moon" },
      { title: "حماية مع واقي الشمس", body: "لأفضل النتائج، استخدمي واقي شمس نهارًا.", icon: "armchair" },
    ],
    materials: [
      { title: "مكوّنات تفتيح", body: "TO_CONFIRM", status: "TO_CONFIRM" },
      { title: "مرطّبات طبيعية", body: "TO_CONFIRM", status: "TO_CONFIRM" },
      { title: "حجم العبوة", body: "TO_CONFIRM", status: "TO_CONFIRM" },
    ],
    useCases: ["كلف الوجه", "بقع الشمس", "عدم توحّد لون البشرة", "تفتيح البقع الداكنة"],
    offers: OFFERS,
    crossSellProductIds: ["joint_pain_oil", "hair_loss_spray"],
    upsellProductId: "joint_pain_oil",
    upsellCopy: "أضف زيت آلام المفاصل للطلب بسعر خاص مرة واحدة فقط",
    scienceAngle:
      "الكلف ينتج غالبًا عن زيادة إنتاج الميلانين بسبب الشمس والهرمونات. المكوّنات التفتيح الطبيعية تعمل تدريجيًا على تقليل التصبغ وتوحيد لون البشرة مع الاستمرار.",
    disclaimer: DISCLAIMER,
    imagePlaceholders: [
      { alt: "كريم الكلف", label: "كريم الكلف - صورة المنتج" },
      { alt: "توحيد لون البشرة", label: "بشرة موحّدة" },
      { alt: "مكوّنات طبيعية", label: "تركيبة طبيعية" },
      { alt: "إشراقة طبيعية", label: "إشراقة ونضارة" },
    ],
    cardImage: "/products/melasma-cream-card.png",
  },
};

export const PRODUCT_LIST = Object.values(PRODUCTS);

export const CROSS_SELL_REASONS: Record<string, Record<string, string>> = {
  joint_pain_oil: {
    hair_loss_spray: "عناية كاملة — شعر أقوى مع راحة المفاصل",
    melasma_cream: "إشراقة البشرة تكمل عنايتك",
  },
  hair_loss_spray: {
    joint_pain_oil: "راحة المفاصل مع شعر أقوى",
    melasma_cream: "بشرة موحّدة تكمل إطلالتك",
  },
  melasma_cream: {
    joint_pain_oil: "عناية شاملة — بشرة ومفاصل",
    hair_loss_spray: "شعر أقوى يكمل إشراقتك",
  },
};
