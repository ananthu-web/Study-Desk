import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "StudyDesk — Make room for focus", template: "%s · StudyDesk" },
  description: "A little space for your big ambitions. Your subjects, plans, and focus, together at one desk.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

const initialiseTheme = `(function(){try{var t=localStorage.getItem('studydesk-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: initialiseTheme }} /></head>
      <body>{children}</body>
    </html>
  );
}
