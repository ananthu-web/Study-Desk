import { notFound } from "next/navigation";
import { AppLoading } from "@/components/app-loading";
import { SectionLoading } from "@/components/dashboard/section-loading";

export default async function LoadingPreview({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { view } = await searchParams;
  return view === "section" ? <SectionLoading /> : <AppLoading />;
}
