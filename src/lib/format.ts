import { departmentShort } from "@/lib/options";

const TZ = "Asia/Kolkata";

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  // Plain YYYY-MM-DD dates have no time: treat them as IST calendar dates.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00+05:30`) : new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: TZ, ...opts });
}

export function formatTime(iso: string) {
  return new Date(iso)
    .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ })
    .toUpperCase();
}

/** Day number and short month for date badges, e.g. { day: "22", month: "JUL" }. */
export function dateParts(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-IN", { day: "2-digit", timeZone: TZ }),
    month: d.toLocaleDateString("en-IN", { month: "short", timeZone: TZ }).toUpperCase(),
    year: d.toLocaleDateString("en-IN", { year: "numeric", timeZone: TZ }),
  };
}

/** "6:30 PM – 7:30 PM IST" or "" when the time is hidden. */
export function timeRange(e: { startDate: string; endDate?: string; hideTime: boolean }) {
  if (e.hideTime) return "";
  const start = formatTime(e.startDate);
  return e.endDate ? `${start} – ${formatTime(e.endDate)} IST` : `${start} IST`;
}

const ordinal = (n: string) => ({ "1": "1st", "2": "2nd", "3": "3rd", "4": "4th" })[n] ?? n;

/** "3rd yr, ECE ACT" style line used on member and achievement cards. */
export function studyLine(yearOfStudy?: string, department?: string) {
  const dept = department ? (departmentShort[department] ?? department) : "";
  const yr =
    yearOfStudy && yearOfStudy !== "faculty"
      ? yearOfStudy === "PG"
        ? "PG"
        : `${ordinal(yearOfStudy)} yr`
      : "";
  return [yr, dept].filter(Boolean).join(", ");
}
