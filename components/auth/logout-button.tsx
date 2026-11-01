"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LoaderCircle } from "lucide-react";
import { authClient } from "./auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("We couldn't sign you out. Please try again.");
      setPending(false);
    }
  }
  return <div><button type="button" className="logout-button" disabled={pending} onClick={logout}>{pending ? <LoaderCircle size={17} className="loading-icon" /> : <LogOut size={17} />}<span>{pending ? "Signing out…" : "Sign out"}</span></button><p role="status" className="field-error">{error}</p></div>;
}
