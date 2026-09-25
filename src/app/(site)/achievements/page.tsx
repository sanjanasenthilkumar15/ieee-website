import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { AchievementsBrowser } from "@/components/filters/AchievementsBrowser";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAchievements } from "@/lib/content";


export const metadata: Metadata = {
  title: "Achievements",
  description: "Hackathon wins, awards, research and recognitions earned by members of IEEE SB RMKEC.",
};

export default async function AchievementsPage() {
  const items = await getAchievements();
  return (
    <>
      <PageHeader
        title="Achievements"
        crumbs={[{ label: "Achievements" }]}
        intro="Hackathons, competitions, awards, research and reviewer roles earned by our members."
      />
      <section className="py-12 sm:py-16">
        <Container>
          {items.length ? (
            <AchievementsBrowser items={items} />
          ) : (
            <EmptyState title="No achievements recorded yet">
              Won something? Tell the Execom so it can be added here.
            </EmptyState>
          )}
        </Container>
      </section>
    </>
  );
}
