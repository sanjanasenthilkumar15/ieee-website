/**
 * Static site configuration: navigation and fallback branch details.
 * Contact email, address and social links shown on the site come from Site
 * Settings in the Studio; these values are used only when those are empty.
 */

export const site = {
  shortName: "IEEE SB RMKEC",
  name: "IEEE Student Branch, RMK Engineering College",
  branchCode: "SB61871",
  tagline: "Advancing technology for humanity — from RMKEC, Chennai.",
  established: 2026,
  // IEEE Madras Section is the section for Chennai, in IEEE Region 10 (Asia-Pacific).
  affiliation: "IEEE Madras Section · IEEE Region 10",
  college: "R.M.K. Engineering College",
  // TODO(branch): replace with the branch-owned email. Address is from the event posters.
  contact: {
    email: "ieee-sb@example.com",
    address:
      "R.M.K. Engineering College, RSM Nagar, Kavaraipettai, Gummidipoondi Taluk, Tiruvallur District, Tamil Nadu 601 206",
  },
  // Real profile URLs come from Site Settings in the Studio; none shown until set.
  social: {} as Partial<Record<"instagram" | "linkedin" | "youtube", string>>,
} as const;

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Execom", href: "/execom" },
  { label: "Events", href: "/events" },
  { label: "Achievements", href: "/achievements" },
  { label: "Publications", href: "/publications" },
  { label: "Blog", href: "/blog" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export const joinCta: NavItem = { label: "Join IEEE", href: "/join" };
