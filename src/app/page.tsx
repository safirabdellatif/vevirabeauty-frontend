import { HeroSection } from "@/components/sections/HeroSection";
import { TrustStrip } from "@/components/trust/TrustStrip";
import { ProductCard } from "@/components/product/ProductCard";
import { SocialProofCarousel } from "@/components/sections/SocialProofCarousel";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { PRODUCT_LIST } from "@/content/products";
import { REVIEWS } from "@/content/reviews";
import { FAQS } from "@/content/faqs";
import Link from "next/link";
import { ShieldCheck, PackageCheck, Star, Truck, Heart, Award, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <TrustStrip />

      <HeroSection
        heading="عناية طبيعية — حلول لمشاكل حقيقية"
        subheading="فيرا بيوتي تختار لك 3 منتجات فقط: زيت آلام المفاصل، رشاش تساقط الشعر، وكريم الكلف. تركيبات طبيعية، الدفع عند الاستلام، وتوصيل لجميع مدن المغرب."
        primaryCTA={{ label: "تصفّح المنتجات", href: "/products" }}
        secondaryCTA={{ label: "عن فيرا بيوتي", href: "/about" }}
      />

      <section className="section-padding bg-brand-charcoal text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-teal via-transparent to-transparent"></div>
        <div className="container-max max-w-4xl mx-auto text-center relative z-10">
          <span className="text-brand-mint font-bold text-sm tracking-wider mb-4 block">لماذا فيرا بيوتي؟</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            3 منتجات — 3 مشاكل يعاني منها المغاربة كل يوم
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg md:text-xl mb-8">
            آلام المفاصل، تساقط الشعر، والكلف — مشاكل حقيقية تحتاج حلول عملية.
            في <span className="text-brand-mint font-bold">فيرا بيوتي</span> نركّز على 3 منتجات فقط بتركيبات طبيعية ومكوّنات مفصّحة، بدون قائمة طويل ولا وعود فارغة.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-mint" />
              <span className="font-medium">تركيبات طبيعية</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 flex items-center gap-2">
              <Heart className="w-5 h-5 text-brand-mint" />
              <span className="font-medium">مكوّنات مفصّحة</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-mint" />
              <span className="font-medium">ضمان 30 يوم</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-brand-mint/30 border-b border-brand-mint/50">
        <div className="container-max">
          <div className="text-center mb-10">
            <span className="text-brand-teal font-bold text-sm tracking-wider mb-2 block">معاييرنا</span>
            <h2 className="text-3xl font-extrabold text-brand-charcoal">ثلاث ضمانات قبل كل طلب</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 text-center">
            <div className="flex flex-col items-center gap-3 max-w-xs">
              <div className="w-20 h-20 rounded-full bg-white shadow-soft flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-bold text-brand-charcoal text-xl">تركيبات طبيعية</h3>
              <p className="text-sm text-brand-gray">كل منتج يحل مشكلة واحدة بوضوح — بدون حشو ولا ادعاءات مبالغ فيها.</p>
            </div>
            <div className="hidden md:block w-px h-24 bg-gray-200"></div>
            <div className="flex flex-col items-center gap-3 max-w-xs">
              <div className="w-20 h-20 rounded-full bg-white shadow-soft flex items-center justify-center">
                <Award className="w-10 h-10 text-brand-gold" />
              </div>
              <h3 className="font-bold text-brand-charcoal text-xl">ضمان 30 يوم</h3>
              <p className="text-sm text-brand-gray">إذا لم تلاحظ فرقًا خلال 30 يومًا، نسترجع طلبك بدون أسئلة معقدة.</p>
            </div>
            <div className="hidden md:block w-px h-24 bg-gray-200"></div>
            <div className="flex flex-col items-center gap-3 max-w-xs">
              <div className="w-20 h-20 rounded-full bg-white shadow-soft flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-brand-teal" />
              </div>
              <h3 className="font-bold text-brand-charcoal text-xl">الدفع عند الاستلام</h3>
              <p className="text-sm text-brand-gray">تأكيد بالهاتف قبل الإرسال، وتدفع فقط عند استلام الطرد.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="text-brand-teal font-bold text-sm tracking-wider mb-2 block">منتجاتنا</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-charcoal mb-4">
              3 منتجات — كل واحد لمشكلة محددة
            </h2>
            <p className="text-brand-gray text-lg max-w-2xl mx-auto">
              زيت آلام المفاصل، رشاش تساقط الشعر، وكريم الكلف — منتجات طبيعية بأسعار مناسبة للمغرب.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCT_LIST.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-brand-mint">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-charcoal">ليش فيرا بيوتي؟</h2>
            <p className="text-brand-gray text-lg mt-3">لأننا نركّز على النتيجة، لا على القائمة</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Star, title: "3 منتجات فقط", body: "كل منتج يحل مشكلة واحدة — بدون تشويش" },
              { icon: ShieldCheck, title: "ضمان 30 يوم", body: "لم تلاحظ فرقًا؟ نسترجع طلبك" },
              { icon: PackageCheck, title: "الدفع عند الاستلام", body: "تأكيد قبل الإرسال وتدفع عند الاستلام" },
              { icon: Truck, title: "توصيل المغرب", body: "2-5 أيام لجميع المدن المغربية" },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="text-center p-6 bg-white rounded-3xl shadow-soft hover:shadow-card transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-brand-mint flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-brand-teal" />
                </div>
                <h3 className="font-bold text-brand-charcoal text-lg mb-2">{title}</h3>
                <p className="text-sm text-brand-gray leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-max max-w-4xl mx-auto text-center">
          <span className="text-brand-teal font-bold text-sm tracking-wider mb-2 block">العروض</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-charcoal mb-4">
            كلما طول الاستخدام، كلما كان العرض أحسن
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { label: "قطعة واحدة", price: 199, badge: "للتجربة", saving: null, popular: false },
              { label: "قطعتان", price: 289, badge: "الأكثر طلبًا", saving: 109, popular: true },
              { label: "3 قطع", price: 369, badge: "أفضل قيمة", saving: 228, popular: false },
            ].map(({ label, price, badge, saving, popular }) => (
              <div
                key={label}
                className={`bg-white rounded-3xl p-6 shadow-soft text-center border-2 transition-transform transform hover:-translate-y-1 ${popular ? "border-brand-teal shadow-xl scale-105" : "border-gray-100"}`}
              >
                <p className={`text-sm font-bold mb-2 inline-block px-3 py-1 rounded-full ${popular ? "bg-brand-teal text-white" : "bg-brand-mint text-brand-teal"}`}>{badge}</p>
                <p className="font-bold text-brand-charcoal text-lg mb-2">{label}</p>
                <p className="text-3xl font-extrabold text-brand-teal mb-2">
                  {price} <span className="text-sm">درهم</span>
                </p>
                {saving && (
                  <p className="text-sm font-bold text-green-600 mt-2 bg-green-50 py-1 rounded-lg">وفّر {saving} درهم</p>
                )}
              </div>
            ))}
          </div>
          <Link href="/products" className="btn-primary inline-flex items-center justify-center gap-2 mt-12 px-12 py-5 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
            اختر منتجك
          </Link>
        </div>
      </section>

      <section className="section-padding bg-brand-sand overflow-hidden">
        <div className="container-max">
          <div className="text-center mb-10">
            <span className="text-brand-teal font-bold text-sm tracking-wider mb-2 block">من عملائنا</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-charcoal mb-4">تجارب من داخل المغرب</h2>
          </div>
          <SocialProofCarousel reviews={REVIEWS} />
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-max max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-charcoal mb-4">عندك استفسار؟</h2>
          </div>
          <FAQAccordion faqs={FAQS.slice(0, 6)} />
        </div>
      </section>

      <section className="section-padding bg-brand-teal text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container-max relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">ابدأ عنايتك اليوم</h2>
          <p className="text-brand-mint text-xl mb-10 max-w-2xl mx-auto">
            زيت المفاصل، رشاش الشعر، أو كريم الكلف — الدفع عند الاستلام وتوصيل لجميع المدن.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-charcoal font-extrabold px-12 py-5 rounded-2xl hover:bg-yellow-400 transition-all shadow-xl transform hover:-translate-y-1 text-lg"
          >
            تصفّح المنتجات — ضمان 30 يوم
          </Link>
        </div>
      </section>
    </>
  );
}
