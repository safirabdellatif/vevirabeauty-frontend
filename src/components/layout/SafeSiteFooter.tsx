import Link from "next/link";
import { SITE } from "@/content/site";
import { BrandLogo } from "@/components/layout/BrandLogo";

/** Footer without health, جودة مختارة, halal, or product claims — for /lp ad warming. */
export function SafeSiteFooter() {
  return (
    <footer className="bg-brand-dark text-white mt-24">
      <div className="container-max py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="mb-4">
              <BrandLogo textClassName="text-white" subtextClassName="text-brand-gray" />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              متجر مغربي للعناية الطبيعية. دفع عند الاستلام وتوصيل لجميع المدن.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-brand-gold">المساعدة</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  تواصل معنا
                </Link>
              </li>
              <li>
                <a
                  href={SITE.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  واتساب — {SITE.whatsappDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.supportEmail}`}
                  className="hover:text-white transition-colors"
                >
                  {SITE.supportEmail}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-brand-gold">السياسات</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  الشروط وسياسة COD
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap gap-4 justify-center text-sm text-gray-400">
          {["الدفع عند الاستلام", "توصيل داخل المغرب", "دعم بالعربية"].map((badge) => (
            <span key={badge} className="flex items-center gap-1">
              <span className="text-brand-gold">✓</span> {badge}
            </span>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} فيرا بيوتي vevirabeauty — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}
