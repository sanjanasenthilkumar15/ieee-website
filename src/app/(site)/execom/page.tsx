import type { Metadata } from "next";
import { ExecomView } from "@/components/execom/ExecomView";
import { execomYears, getExecom, getSocieties } from "@/lib/content";


export const metadata: Metadata = {
  title: "Execom",
  description: "Office bearers, faculty counselor and IEEE societies of the IEEE Student Branch at R.M.K. Engineering College.",
};

export default async function ExecomPage() {
  const [members, societies] = await Promise.all([getExecom(), getSocieties()]);
  const years = execomYears(members);
  const year = years[0] ?? new Date().getFullYear();
  return (
    <ExecomView
      year={year}
      years={years.length ? years : [year]}
      members={members.filter((m) => m.year === year)}
      societies={societies}
    />
  );
}
