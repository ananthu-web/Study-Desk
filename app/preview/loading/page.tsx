import { notFound } from "next/navigation";
import { AppLoading } from "@/components/app-loading";

export default function LoadingPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <AppLoading />;
}
