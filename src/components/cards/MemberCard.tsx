import Image from "next/image";
import type { ExecomMember } from "@/lib/content/types";
import { studyLine } from "@/lib/format";

function initials(name: string) {
  return name
    .replace(/^(Dr|Mr|Ms|Mrs|Prof)\.?\s+/i, "")
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Circular portrait with name, role and study details. */
export function MemberCard({ member, size = "md" }: { member: ExecomMember; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-40 w-40" : "h-32 w-32";
  const study = member.memberType === "faculty" ? "" : studyLine(member.yearOfStudy, member.department);
  return (
    <article className="flex flex-col items-center text-center">
      <div className={`relative ${dim} overflow-hidden rounded-full bg-surface ring-4 ring-ieee-blue-light ring-offset-2`}>
        {member.photo ? (
          <Image
            src={member.photo.url}
            alt={member.photo.alt || member.name}
            fill
            sizes="160px"
            className="photo-grade object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-ieee-blue" aria-hidden="true">
            {initials(member.name)}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-base leading-snug font-bold">{member.name}</h3>
      <p className="mt-0.5 text-sm font-semibold text-ieee-blue">{member.role}</p>
      {study && <p className="text-sm text-muted">{study}</p>}
      {member.linkedin && (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-xs font-semibold text-muted hover:text-rmkec-green"
          aria-label={`${member.name} on LinkedIn`}
        >
          LinkedIn
        </a>
      )}
    </article>
  );
}
