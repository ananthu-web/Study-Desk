import { AuthShell } from "@/components/auth/auth-shell";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readSession } from "@/server/auth/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Account entry stays available during an outage; private pages still fail closed.
  const session = await readSession(await headers()).catch(() => null);
  if (session) redirect("/dashboard");
  return <AuthShell>{children}</AuthShell>;
}
