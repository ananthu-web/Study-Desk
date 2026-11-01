"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Circle, Eye, EyeOff, Info, LoaderCircle, MoveUpRight } from "lucide-react";
import { authClient } from "./auth-client";

type Field = "name" | "email" | "password" | "confirmPassword";
type Errors = Partial<Record<Field, string>>;

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const requestActive = useRef(false);
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState("");

  function clearFeedback(field: Field) {
    setErrors(previous => ({ ...previous, [field]: undefined }));
    setNotice("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestActive.current) return;
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const next: Errors = {};

    if (signup && !String(data.get("name") || "").trim()) next.name = "Please enter your name.";
    const emailInput = event.currentTarget.elements.namedItem("email") as HTMLInputElement;
    if (!email || !emailInput.validity.valid) next.email = "Enter a valid email address.";
    if (!password) next.password = "Please enter your password.";
    else if (signup && password.length < 8) next.password = "Use at least 8 characters.";
    else if (password.length > 128) next.password = "Use no more than 128 characters.";
    if (signup && String(data.get("confirmPassword") || "") !== password) next.confirmPassword = "Your passwords don't match.";

    setErrors(next);
    setNotice("");
    const first = (Object.keys(next) as Field[])[0];
    if (first) {
      requestAnimationFrame(() => {
        (formRef.current?.elements.namedItem(first) as HTMLInputElement | null)?.focus();
      });
      return;
    }
    requestActive.current = true;
    setPending(true);
    try {
      const result = signup
        ? await authClient.signUp.email({ name: String(data.get("name") || "").trim(), email, password })
        : await authClient.signIn.email({ email, password, rememberMe: true });
      if (result.error) {
        if (result.error.status === 429) setNotice("Too many attempts. Please wait a minute and try again.");
        else if (result.error.status >= 500) setNotice("Account access is temporarily unavailable. Please try again shortly.");
        else setNotice(signup ? "We couldn't create this account. Check your details, or try signing in if you already registered." : "The email or password wasn't recognised. Please try again.");
        return;
      }
      if (!result.data?.user) {
        setNotice("We couldn't complete that request. Please try again.");
        return;
      }
      setPasswordValue("");
      setConfirmation("");
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setNotice("We couldn't connect. Check your connection and try again.");
    } finally {
      requestActive.current = false;
      setPending(false);
    }
  }

  function error(field: Field) {
    return errors[field] ? <p id={`${field}-error`} className="field-error">{errors[field]}</p> : null;
  }

  return (
    <div className={`auth-content account-form-content ${signup ? "signup-content" : ""}`} key={mode}>
      <div className="form-intro">
        <h2>{signup ? <>Create your <em>account.</em></> : <>Welcome <em>back.</em></>}</h2>
        <p className="form-description">{signup ? "One space for your subjects, plans, and focus." : "Sign in and make a little room for focus."}</p>
      </div>

      <form id="auth-form" ref={formRef} method="post" onSubmit={submit} noValidate aria-busy={pending}>
        {signup && <div className="field-group"><label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" placeholder="e.g. Alex Taylor" required maxLength={100} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} onChange={() => clearFeedback("name")} />{error("name")}</div>}

        <div className="field-group">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" required maxLength={254} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} onChange={() => clearFeedback("email")} />
          {error("email")}
        </div>

        <div className="field-group">
          <div className="label-row"><label htmlFor="password">Password</label>{!signup && <button className="text-button recovery-button" type="button" onClick={() => setNotice("Password recovery isn't available yet. Please use your existing password to sign in.")}>Forgot password?</button>}</div>
          <div className="password-input"><input id="password" name="password" type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} placeholder={signup ? "Create a password" : "Enter your password"} value={passwordValue} required minLength={signup ? 8 : undefined} aria-invalid={Boolean(errors.password)} aria-describedby={[signup ? "password-hint" : "", errors.password ? "password-error" : ""].filter(Boolean).join(" ") || undefined} onChange={event => { setPasswordValue(event.target.value); clearFeedback("password"); }} /><button type="button" className="password-toggle" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          {signup && <p id="password-hint" className={`field-hint password-requirement ${passwordValue.length >= 8 ? "requirement-met" : ""}`}>{passwordValue.length >= 8 ? <Check size={13} aria-hidden="true" /> : <Circle size={11} aria-hidden="true" />}<span>{passwordValue.length >= 8 ? "8-character minimum met." : "Use at least 8 characters."}</span></p>}
          {error("password")}
        </div>

        {signup && <div className="field-group"><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type={visible ? "text" : "password"} autoComplete="new-password" placeholder="Enter your password again" value={confirmation} required aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "confirmPassword-error" : confirmation && confirmation === passwordValue ? "password-match" : undefined} onChange={event => { setConfirmation(event.target.value); clearFeedback("confirmPassword"); }} />{confirmation && confirmation === passwordValue && !errors.confirmPassword && <p id="password-match" className="field-hint password-requirement requirement-met"><Check size={13} aria-hidden="true" /><span>Passwords match.</span></p>}{error("confirmPassword")}</div>}

        <button className="submit-button" type="submit" disabled={pending}><span>{pending ? signup ? "Creating account…" : "Signing in…" : signup ? "Create account" : "Sign in"}</span>{pending ? <LoaderCircle size={19} className="loading-icon" aria-hidden="true" /> : <ArrowRight size={19} strokeWidth={1.6} />}</button>
        <div aria-live="polite" aria-atomic="true">{notice && <p className="form-notice"><Info size={17} aria-hidden="true" /><span>{notice}</span></p>}</div>
      </form>

      <p className="switch-auth"><span>{signup ? "Already registered?" : "New to StudyDesk?"}</span><Link href={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create an account"}<MoveUpRight size={14} aria-hidden="true" /></Link></p>
      <div className="form-footnote"><span className="footnote-icon"><Check size={12} strokeWidth={2} /></span><span>{signup ? "Your own pace. Your own possibilities." : "A clearer space for what matters."}</span></div>
    </div>
  );
}
