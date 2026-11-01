import type { Metadata } from "next";
import { BookOpen, Check } from "lucide-react";
import { requireSession } from "@/server/auth/session";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";

export const metadata: Metadata = { title: "Your study space" };

export default async function DashboardPage() {
  const { user } = await requireSession();
  return <main className="account-dashboard"><header className="account-dashboard-header"><span className="dashboard-brand"><BookOpen size={23} />studydesk.</span><ThemeToggle /></header><section className="account-welcome"><p className="account-success"><Check size={16} /> You're signed in</p><h1>Welcome, <em>{user.name}.</em></h1><p>Your account is ready. Your study dashboard is coming next.</p><p className="account-email">{user.email}</p><LogoutButton /></section></main>;
}
