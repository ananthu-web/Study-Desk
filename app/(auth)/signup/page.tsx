import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Make yourself a space" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
