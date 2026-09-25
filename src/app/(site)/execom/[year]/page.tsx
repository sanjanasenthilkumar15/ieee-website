import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ExecomView } from "@/components/execom/ExecomView";
import { execomYears, getExecom, getSocieties } from "@/lib/content";



export async function generateMetadata({ params }: PageProps<"/execom/[year]">): Promise<Metadata> {
  const { year } = await params;
  return { title: `Execom ${year}` };
}

export default async function ExecomYearPage({ params }: PageProps<"/execom/[year]">) {
  const year = Number((await params).year);
  const [members, societies] = await Promise.all([getExecom(), getSocieties()]);
  const years = execomYears(members);
  if (!years.includes(year)) notFound();
  if (year === years[0]) redirect("/execom");
  return <ExecomView year={year} years={years} members={members.filter((m) => m.year === year)} societies={societies} />;
}
