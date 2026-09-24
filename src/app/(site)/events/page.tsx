import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { EventsBrowser } from "@/components/events/EventsBrowser";
import { PageHeader } from "@/components/ui/PageHeader";
import { getEvents, splitEvents } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events",
  description: "Webinars, workshops, membership drives and meetings of the IEEE Student Branch at R.M.K. Engineering College.",
};

export default async function EventsPage() {
  const { upcoming, past } = splitEvents(await getEvents());
  return (
    <>
      <PageHeader
        title="Events"
        crumbs={[{ label: "Events" }]}
        intro="Weekly webinars with distinguished speakers, hands-on workshops, membership drives and branch meetings."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <EventsBrowser upcoming={upcoming} past={past} />
        </Container>
      </section>
    </>
  );
}
