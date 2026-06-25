import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, PackageCheck, Truck, PhoneCall, Leaf, BadgeCheck } from "lucide-react";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "عن فيرا بيوتي",
  description:
    "فيرا بيوتي علامة مغربية للعناية الطبيعية — 3 منتجات لمشاكل حقيقية، مكوّنات مفصّحة، الدفع عند الاستلام، وتوصيل لجميع مدن المغرب.",
};

export default function AboutPage() {
  return (
    <div className="section-padding">
      <div className="container-max max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-brand-mint text-brand-teal font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
            <Leaf className="w-4 h-4" />
            عن فيرا بيوتي
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-charcoal mb-4">
            عناية طبيعية من المغرب — لباب دارك
          </h1>
          <p className="text-brand-gray text-lg leading-relaxed">
            فيرا بيوتي متجر مغربي يركّز على 3 منتجات فقط: زيت آلام المفاصل، رشاش تساقط الشعر، وكريم الكلف. تركيبات طبيعية، أسعار واضحة، والدفع عند الاستلام.
          </p>
        </div>

        <div className="bg-brand-mint rounded-3xl p-8 mb-12 border border-brand-teal/10">
          <h2 className="text-2xl font-bold text-brand-charcoal mb-4">لماذا أنشأنا فيرا بيوتي</h2>
          <p className="text-brand-gray leading-loose text-base">
            لاحظنا أن السوق المغربي مليان بمنتجات متشابهة، بأسماء غامضة ووعود مبالغ فيها. المغاربة يحتاجون حلول عملية لمشاكل يومية: آلام المفاصل، تساقط الشعر، والكلف — بدون تعقيد ولا قائمة طويلة.
          </p>
          <p className="text-brand-gray leading-loose text-base mt-4">
            فبنينا فيرا بيوتي على بساطة واضحة: 3 منتجات، كل واحد لمشكلة محددة، مكوّنات طبيعية مفصّحة، تأكيد بالهاتف قبل الشحن، وضمان 30 يوم. لا كتالوج طويل، ولا ادعاءات فارغة.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-brand-charcoal mb-6 text-center">معاييرنا قبل كل طلب</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {[
            {
              icon: BadgeCheck,
              title: "مكوّنات مفصّحة",
              body: "كل منتج بتركيبة طبيعية واضحة — تعرف بالضبط ما تشتري.",
            },
            {
              icon: Leaf,
              title: "تركيبات طبيعية",
              body: "نختار مكوّنات نباتية وزيوت أساسية مناسبة للاستخدام اليومي.",
            },
            {
              icon: ShieldCheck,
              title: "ضمان 30 يوم",
              body: "لم تلاحظ فرقًا؟ نسترجع طلبك بدون تعقيد.",
            },
            {
              icon: PackageCheck,
              title: "تغليف آمن",
              body: "تعبئة محكمة مع تاريخ صلاحية واضح على كل عبوة.",
            },
            {
              icon: Truck,
              title: "توصيل المغرب",
              body: "شحن 2–5 أيام لجميع المدن المغربية، مع تأكيد قبل الإرسال.",
            },
            {
              icon: PhoneCall,
              title: "دعم بالعربية",
              body: "فريق فيرا بيوتي يتواصل معك بالدارجة والعربية قبل وبعد الطلب.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-soft flex gap-4 border border-gray-100">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-mint flex items-center justify-center">
                <Icon className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <h3 className="font-bold text-brand-charcoal mb-1">{title}</h3>
                <p className="text-sm text-brand-gray leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-brand-charcoal mb-6">ما نؤمن به</h2>
          <div className="space-y-4">
            {[
              "3 منتجات فقط — كل واحد يحل مشكلة واحدة بوضوح.",
              "الشفافية أهم من الكلام التسويقي: مكوّنات معلنة وأسعار واضحة.",
              "الدفع عند الاستلام لأن ثقتك تستحق التجربة بدون مخاطرة.",
              "السعر العادل يعكس جودة المنتج، لا تكلفة الإعلانات.",
              "إذا لم نثق في منتج، لا نبيعه.",
            ].map((belief, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-teal flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </span>
                <p className="text-brand-charcoal leading-relaxed">{belief}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-sand rounded-2xl p-6 mb-12 border border-brand-gold/20">
          <p className="text-sm text-brand-gray leading-relaxed">
            <span className="font-bold text-brand-charcoal">تنويه: </span>
            {SITE.globalDisclaimer}
          </p>
        </div>

        <div className="text-center">
          <Link href="/products" className="btn-primary px-12 py-4 text-base">
            تصفّح منتجاتنا
          </Link>
        </div>
      </div>
    </div>
  );
}
