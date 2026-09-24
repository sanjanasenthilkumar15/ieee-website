import { Container } from "@/components/layout/Container";
import { PrimaryLink, SecondaryLink } from "@/components/ui/Buttons";
import { CrestMotif } from "@/components/ui/CrestMotif";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <CrestMotif className="pointer-events-none absolute top-1/2 right-[-10%] h-[600px] w-[600px] -translate-y-1/2 text-ieee-blue opacity-[0.05]" />
      <Container>
        <p className="text-sm font-semibold tracking-wider text-rmkec-green uppercase">Error 404</p>
        <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Page not found</h1>
        <p className="mt-4 max-w-xl text-lg">The page you’re looking for may have moved, or the link may be out of date.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <PrimaryLink href="/">Go to home page</PrimaryLink>
          <SecondaryLink href="/events">Browse events</SecondaryLink>
        </div>
      </Container>
    </section>
  );
}
