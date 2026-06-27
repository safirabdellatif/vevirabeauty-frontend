"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";

export function MinimalSiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-brand-cream/95 backdrop-blur border-b border-brand-mint shadow-soft">
      <div className="container-max flex items-center justify-between h-16">
        <BrandLogo linked showText />
        <Link
          href="/contact"
          className="text-sm font-medium text-brand-teal hover:text-brand-charcoal transition-colors"
        >
          تواصل معنا
        </Link>
      </div>
    </header>
  );
}
