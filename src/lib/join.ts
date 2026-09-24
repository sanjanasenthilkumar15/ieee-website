import { departments, yearsOfStudy } from "@/lib/options";

/** Join-form validation, shared by the browser form and the API route. */
export type JoinInput = {
  name: string;
  department: string;
  year: string;
  email: string;
  phone: string;
  reason: string;
  website?: string; // honeypot — must stay empty
};

export type JoinErrors = Partial<Record<keyof JoinInput, string>>;

const deptValues = new Set(departments.map((d) => d.value));
const yearValues = new Set(yearsOfStudy.filter((y) => y.value !== "faculty").map((y) => y.value));

export function validateJoin(raw: Partial<Record<string, unknown>>): { data?: JoinInput; errors: JoinErrors } {
  const s = (k: string, max: number) => String(raw[k] ?? "").trim().slice(0, max);
  const data: JoinInput = {
    name: s("name", 100),
    department: s("department", 20),
    year: s("year", 10),
    email: s("email", 120).toLowerCase(),
    phone: s("phone", 20).replace(/[\s-]/g, ""),
    reason: s("reason", 1200),
    website: s("website", 200),
  };
  const errors: JoinErrors = {};
  if (data.name.length < 2) errors.name = "Please enter your full name.";
  if (!deptValues.has(data.department)) errors.department = "Please choose your department.";
  if (!yearValues.has(data.year)) errors.year = "Please choose your year of study.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = "Please enter a valid email address.";
  if (!/^(\+91)?[6-9]\d{9}$/.test(data.phone)) errors.phone = "Please enter a 10-digit Indian mobile number.";
  if (data.reason.length < 20) errors.reason = "Please tell us a little more (at least 20 characters).";
  return Object.keys(errors).length ? { errors } : { data, errors };
}
