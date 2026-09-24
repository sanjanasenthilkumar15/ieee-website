/**
 * SAMPLE content — placeholders so the Achievements, Publications and Blog
 * pages have something to show before real entries exist.
 *
 * Only seeded with `--with-samples`. Every sample has an _id starting with
 * "sample-", so they can be removed in one go (see scripts/seed/README.md).
 */

export const achievements = [
  {
    id: "sample-achievement-hackathon",
    title: "Finalist — National Level Hackathon (sample entry)",
    category: "hackathon",
    memberName: "Sample Student A, Sample Student B",
    department: "CSE",
    yearOfStudy: "3",
    organizer: "Sample organiser",
    position: "Finalist",
    projectTitle: "Low-cost IoT air-quality monitor for classrooms",
    date: "2026-09-12",
    featured: true,
  },
  {
    id: "sample-achievement-paper",
    title: "Paper accepted at an IEEE conference (sample entry)",
    category: "research",
    memberName: "Sample Student C",
    department: "ECE",
    yearOfStudy: "4",
    organizer: "IEEE conference (sample)",
    position: "Paper accepted",
    projectTitle: "Energy-efficient approximate multipliers for edge AI",
    date: "2026-09-05",
    featured: true,
  },
  {
    id: "sample-achievement-award",
    title: "Best Project Award (sample entry)",
    category: "award",
    memberName: "Sample Student D",
    department: "EEE",
    yearOfStudy: "3",
    organizer: "Sample project expo",
    position: "1st Prize",
    date: "2026-08-28",
    featured: true,
  },
];

export const publications = [
  {
    id: "sample-publication-1",
    title: "Energy-Efficient Approximate Multipliers for Edge AI Accelerators (sample entry)",
    authors: ["Sample Student C", "Sample Faculty Member"],
    venueType: "conference",
    venue: "Sample IEEE International Conference",
    year: 2026,
    researchArea: "vlsi-embedded",
    abstract:
      "This is placeholder text for a sample publication. Replace this entry with the branch's real publications in the Studio.",
  },
  {
    id: "sample-publication-2",
    title: "Functional Data Analysis for Wireless Channel Prediction (sample entry)",
    authors: ["Sample Student E", "Sample Student F", "Sample Faculty Member"],
    venueType: "journal",
    venue: "Sample IEEE Journal",
    year: 2026,
    researchArea: "communications",
    abstract:
      "This is placeholder text for a sample publication. Replace this entry with the branch's real publications in the Studio.",
  },
];

export const posts = [
  {
    id: "sample-post-welcome",
    title: "Welcome to the IEEE Student Branch at RMKEC (sample post)",
    type: "article",
    author: "IEEE SB RMKEC",
    date: "2026-09-15",
    excerpt: "A sample post showing how articles appear on the site. Replace it with the branch's first real article.",
    body: [
      "This is a sample article created by the seed script so the Blog page has something to show.",
      "Office bearers can write articles, event reports, student stories, newsletters and resources from the Studio under “Blog, Newsletters & Resources”.",
    ],
  },
  {
    id: "sample-post-webinar-report",
    title: "Webinar Series Report: July–September 2026 (sample post)",
    type: "event-report",
    author: "IEEE SB RMKEC",
    date: "2026-09-20",
    excerpt: "A sample event report. Replace it with a real write-up of the weekly webinar series.",
    body: [
      "This is a sample event report created by the seed script.",
      "A real report would summarise each webinar, its speaker, attendance and key takeaways.",
    ],
    relatedEvent: "webinar-08-digital-auscultation",
  },
];
