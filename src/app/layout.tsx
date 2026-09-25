import type { Metadata } from "next";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/siteUrl";
import "./globals.css";

// Inter variable font (100–900), self-hosted so builds never depend on
// reaching Google Fonts. SIL Open Font License — see src/fonts/Inter-LICENSE.txt.
const inter = localFont({
  src: "../fonts/InterVariable-latin.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "IEEE Student Branch RMKEC (STB61871)",
    template: "%s | IEEE SB RMKEC",
  },
  description:
    "Official website of the IEEE Student Branch at R.M.K. Engineering College, Chennai (STB61871) — events, achievements, publications and membership.",
  openGraph: {
    type: "website",
    siteName: "IEEE SB RMKEC",
    locale: "en_IN",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "IEEE Student Branch, R.M.K. Engineering College" }],
  },
  twitter: { card: "summary_large_image" },
  robots: process.env.SITE_NOINDEX === "true" ? { index: false, follow: false } : undefined,
};

/**
 * Root layout: html/body + font only. Public-site chrome (header/footer)
 * lives in app/(site)/layout.tsx; the admin panel (/admin) has its own.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
