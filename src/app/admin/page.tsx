import type { Metadata } from "next";
import { AdminDashboardClient } from "@/app/admin/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Dashboard | Vevira Beauty",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
