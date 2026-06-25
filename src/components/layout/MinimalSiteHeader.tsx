"use client";

import Link from "next/link";

export function MinimalSiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-brand-cream/95 backdrop-blur border-b border-brand-mint shadow-soft">
      <div className="container-max flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="فيرا بيوتي"
            className="h-11 w-11 object-contain"
          />
          <span className="flex flex-col leading-none">
            <span className="text-xl font-bold text-brand-teal tracking-tight">فيرا بيوتي</span>
            <span className="text-xs text-brand-gray font-sans">Vevira Beauty</span>
          </span>
        </Link>
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
