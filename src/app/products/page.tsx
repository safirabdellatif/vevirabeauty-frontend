import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCT_LIST } from "@/content/products";
import { ProductCard } from "@/components/product/ProductCard";
import { TrustStrip } from "@/components/trust/TrustStrip";
import { ComparisonCards } from "@/components/sections/ComparisonCards";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { FAQS } from "@/content/faqs";

export const metadata: Metadata = {
  title: "منتجاتنا",
  description:
    "فيرا بيوتي — زيت آلام المفاصل، رشاش تساقط الشعر، وكريم الكلف. منتجات طبيعية مع الدفع عند الاستلام وتوصيل لجميع مدن المغرب.",
};

export default function ProductsPage() {
  return (
    <>
      <TrustStrip />

      <section className="section-padding bg-brand-mint">
        <div className="container-max text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-charcoal mb-4">
            3 منتجات — مشاكل حقيقية، حلول طبيعية
          </h1>
          <p className="text-brand-gray text-lg max-w-xl mx-auto">
            آلام المفاصل، تساقط الشعر، والكلف — كل منتج يحل مشكلة واحدة بوضوح.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-max">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCT_LIST.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-brand-sand">
        <div className="container-max max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-brand-charcoal mb-4">أي منتج يناسبك؟</h2>
          <div className="grid md:grid-cols-3 gap-4 text-right">
            {PRODUCT_LIST.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="bg-white rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow block"
              >
                <p className="font-bold text-brand-charcoal text-sm mb-1">{p.shortNameAr}</p>
                <p className="text-xs text-brand-gray leading-relaxed">{p.heroHeadline}</p>
                <p className="text-xs text-brand-teal mt-2 font-medium">تعرف على المنتج ←</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-max">
          <h2 className="text-2xl font-bold text-brand-charcoal mb-8 text-center">
            فيرا بيوتي مقارنةً بالمنتجات العشوائية
          </h2>
          <ComparisonCards />
        </div>
      </section>

      <section className="section-padding bg-brand-mint">
        <div className="container-max max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-brand-charcoal mb-8 text-center">أسئلة شائعة</h2>
          <FAQAccordion faqs={FAQS} />
        </div>
      </section>
    </>
  );
}
