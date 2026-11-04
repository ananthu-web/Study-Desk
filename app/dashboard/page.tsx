import type { Metadata } from "next";
import { requireSession } from "@/server/auth/session";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export const metadata: Metadata = { title: "Your desk" };
export default async function DashboardPage() {
  const { user } = await requireSession();
  return <DashboardHome name={user.name} />;
}
