import { requireSession } from "@/server/auth/session";
import { AppShell } from "@/components/dashboard/app-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession();
  return <AppShell name={user.name}>{children}</AppShell>;
}
