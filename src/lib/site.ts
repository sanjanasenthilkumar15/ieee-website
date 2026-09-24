/**
 * Static site configuration used by the layout (header/footer).
 * In Phase 2 the contact/social values move to the Sanity `siteSettings`
 * singleton; these act as fallbacks until that document is filled in.
 */

export const site = {
  shortName: "IEEE SB RMKEC",
  name: "IEEE Student Branch, RMK Engineering College",
  branchCode: "SB #61871",
  tagline: "Advancing technology for humanity — from RMKEC, Chennai.",
  established: 2026,
  // IEEE Madras Section is the section for Chennai, in IEEE Region 10 (Asia-Pacific).
  affiliation: "IEEE Madras Section · IEEE Region 10",
  college: "R.M.K. Engineering College",
  // TODO(branch): replace with the branch-owned email and confirmed address.
  contact: {
    email: "ieee-sb@example.com",
    address: "R.M.K. Engineering College, RSM Nagar, Kavaraipettai, Gummidipoondi Taluk, Tiruvallur District, Tamil Nadu 601206",
  },
  // TODO(branch): replace with real profile URLs.
  social: {
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
    youtube: "https://www.youtube.com/",
  },
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
