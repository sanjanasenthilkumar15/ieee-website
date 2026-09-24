import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Inter variable font (100–900), self-hosted so builds never depend on
// reaching Google Fonts. SIL Open Font License — see src/fonts/Inter-LICENSE.txt.
const inter = localFont({
  src: "../fonts/InterVariable-latin.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "IEEE Student Branch RMKEC (SB #61871)",
    template: "%s | IEEE SB RMKEC",
  },
  description:
    "Official website of the IEEE Student Branch at R.M.K. Engineering College, Chennai (SB #61871) — events, achievements, publications and membership.",
};

/**
 * Root layout: html/body + font only. Public-site chrome (header/footer)
 * lives in app/(site)/layout.tsx so the embedded Sanity Studio at /studio
 * (Phase 2) renders full-screen without it.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
