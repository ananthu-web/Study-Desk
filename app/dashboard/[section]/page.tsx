import { notFound } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { SectionPage, sections, type Section } from "@/components/dashboard/section-page";

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return { title: sections.includes(section as Section) ? section.charAt(0).toUpperCase() + section.slice(1) : "Not found" };
}
export default async function DashboardSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section as Section)) notFound();
  const { user } = await requireSession();
  return <SectionPage section={section as Section} name={user.name} />;
}
