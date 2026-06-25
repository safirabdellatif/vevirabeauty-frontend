import type { Metadata } from "next";
import { RedirectAdminClient } from "@/app/redirectvevira/RedirectAdminClient";

export const metadata: Metadata = {
  title: "Redirect Manager",
  robots: { index: false, follow: false },
};

export default function RedirectAdminPage() {
  return <RedirectAdminClient />;
}
