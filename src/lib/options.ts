/**
 * Option lists shared by the Sanity schemas and the website.
 * Plain data only — no "sanity" import — so site pages can use it without
 * bundling the Studio.
 */

// TODO(branch): confirm this matches RMKEC's current department list.
export const departments = [
  { title: "Computer Science and Engineering (CSE)", value: "CSE" },
  { title: "Computer Science and Design (CSD)", value: "CSD" },
  { title: "Computer Science and Business Systems (CSBS)", value: "CSBS" },
  { title: "Artificial Intelligence and Data Science (AI&DS)", value: "AIDS" },
  { title: "Information Technology (IT)", value: "IT" },
  { title: "Electronics and Communication Engineering (ECE)", value: "ECE" },
  { title: "ECE (Advanced Communication Technology)", value: "ECE-ACT" },
  { title: "Electronics Engineering (VLSI Design and Technology) (EEV)", value: "EEV" },
  { title: "Electrical and Electronics Engineering (EEE)", value: "EEE" },
  { title: "Electronics and Instrumentation Engineering (EIE)", value: "EIE" },
  { title: "Mechanical Engineering", value: "MECH" },
  { title: "Civil Engineering", value: "CIVIL" },
  { title: "Science and Humanities", value: "S&H" },
  { title: "Other", value: "OTHER" },
];

/** Short labels shown on the website (e.g. "3rd yr, ECE ACT"). */
export const departmentShort: Record<string, string> = {
  CSE: "CSE",
  CSD: "CSD",
  CSBS: "CSBS",
  AIDS: "AI&DS",
  IT: "IT",
  ECE: "ECE",
  "ECE-ACT": "ECE ACT",
  EEV: "EEV",
  EEE: "EEE",
  EIE: "EIE",
  MECH: "Mechanical",
  CIVIL: "Civil",
  "S&H": "S&H",
  OTHER: "",
};

export const yearsOfStudy = [
  { title: "1st year", value: "1" },
  { title: "2nd year", value: "2" },
  { title: "3rd year", value: "3" },
  { title: "4th year", value: "4" },
  { title: "Postgraduate", value: "PG" },
  { title: "Faculty / Staff", value: "faculty" },
];

/** Event types drive the coloured stripe on event cards. Keep in sync with src/lib/categories.ts. */
export const eventTypes = [
  { title: "Webinar / Online talk", value: "webinar" },
  { title: "Workshop / Hands-on session", value: "workshop" },
  { title: "Hackathon", value: "hackathon" },
  { title: "Competition / Contest", value: "competition" },
  { title: "Meeting", value: "meeting" },
  { title: "Membership drive / Outreach", value: "membership" },
  { title: "Inauguration / Ceremony", value: "ceremony" },
  { title: "Other", value: "other" },
];

/** Achievement categories drive the coloured stripe on achievement cards. */
export const achievementCategories = [
  { title: "Hackathon", value: "hackathon" },
  { title: "Competition", value: "competition" },
  { title: "Award", value: "award" },
  { title: "Research (paper / patent / grant)", value: "research" },
  { title: "Reviewer role", value: "reviewer" },
  { title: "Other", value: "other" },
];

export const postTypes = [
  { title: "Article", value: "article" },
  { title: "Event Report", value: "event-report" },
  { title: "Student Story", value: "student-story" },
  { title: "Newsletter", value: "newsletter" },
  { title: "Resource (guide, slides, notes)", value: "resource" },
];

export const researchAreas = [
  { title: "Artificial Intelligence & Machine Learning", value: "ai-ml" },
  { title: "Communications & Networking", value: "communications" },
  { title: "Signal & Image Processing", value: "signal-processing" },
  { title: "VLSI & Embedded Systems", value: "vlsi-embedded" },
  { title: "Power & Energy Systems", value: "power-energy" },
  { title: "Photonics & Optics", value: "photonics" },
  { title: "Antennas & Electromagnetics", value: "antennas" },
  { title: "Biomedical Engineering", value: "biomedical" },
  { title: "Robotics & Automation", value: "robotics" },
  { title: "IoT & Sensors", value: "iot-sensors" },
  { title: "Cloud & Distributed Computing", value: "cloud" },
  { title: "Cybersecurity", value: "security" },
  { title: "Other", value: "other" },
];
