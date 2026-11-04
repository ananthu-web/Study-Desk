import { notFound } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { SectionPage, sections, type Section } from "@/components/dashboard/section-page";

export default async function DashboardPreview({ params }: { params: Promise<{ section?: string[] }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { section } = await params;
  if (section && (section.length !== 1 || !sections.includes(section[0] as Section))) notFound();
  return <AppShell name="Alex" base="/preview/dashboard" preview>{section ? <SectionPage section={section[0] as Section} name="Alex" base="/preview/dashboard" preview /> : <DashboardHome name="Alex" base="/preview/dashboard" initialSample />}</AppShell>;
}
