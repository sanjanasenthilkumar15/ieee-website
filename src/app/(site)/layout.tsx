import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/content";
import { site } from "@/lib/site";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const email = settings.contactEmail || site.contact.email;
  const address = settings.address || site.contact.address;
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-ieee-blue focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header email={email} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer email={email} address={address} social={{ ...site.social, ...settings.social }} />
    </>
  );
}
