import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeSync } from "@/components/theme-sync";

export const metadata: Metadata = {
  title: { default: "StudyDesk — Make room for focus", template: "%s · StudyDesk" },
  description: "A little space for your big ambitions. Your subjects, plans, and focus, together at one desk.",
  applicationName: "StudyDesk",
  appleWebApp: { capable: true, title: "StudyDesk", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  // theme-color is owned by the startup script: the choice lives in localStorage.
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

const initialiseTheme = `(function(){var t;try{t=localStorage.getItem('studydesk-theme')}catch(e){}var d=t==='dark'||t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.dataset.workspace=/^\\/(?:dashboard|preview\\/dashboard)(?:\\/|$)/.test(location.pathname)?'dashboard':'entry';var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m)}m.content=getComputedStyle(document.documentElement).getPropertyValue('--browser-chrome').trim()||(d?'#202120':'#f1efe8')})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Run after head metadata exists, before any visible content paints. */}
        <script dangerouslySetInnerHTML={{ __html: initialiseTheme }} />
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
