import Link from "next/link";
import { SITE } from "@/content/site";

type BrandLogoProps = {
  linked?: boolean;
  showText?: boolean;
  size?: "sm" | "md";
  textClassName?: string;
  subtextClassName?: string;
};

export function BrandLogo({
  linked = false,
  showText = true,
  size = "md",
  textClassName = "text-brand-teal",
  subtextClassName = "text-brand-gray",
}: BrandLogoProps) {
  const imgSize = size === "sm" ? "h-9 w-9" : "h-11 w-11";

  const content = (
    <>
      <img
        src={SITE.logo}
        alt={SITE.logoAlt}
        className={`${imgSize} object-contain shrink-0`}
      />
      {showText && (
        <span className="flex flex-col leading-none">
          <span className={`text-xl font-bold tracking-tight ${textClassName}`}>
            {SITE.name}
          </span>
          <span className={`text-xs font-sans ${subtextClassName}`}>{SITE.nameEn}</span>
        </span>
      )}
    </>
  );

  const className = "flex items-center gap-3";

  if (linked) {
    return (
      <Link href="/" className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
