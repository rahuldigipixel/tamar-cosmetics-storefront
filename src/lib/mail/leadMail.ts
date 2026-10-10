import { getFormRecipients } from "@/lib/wpgraphql/tamarApi";
import { oneLine, sendMail } from "./sendMail";

export type LeadForm = "order-cancellation" | "contact" | "suppliers" | "wholesale" | "club" | "club-home";

interface LeadFormConfig {
  subject: string;
  intro: string;
  /** Optional env override for this form, used when wp-admin has no recipient set; then MAIL_TO. */
  toEnv: string;
}

const FORMS: Record<LeadForm, LeadFormConfig> = {
  contact: { subject: "פנייה חדשה - צור קשר", intro: "התקבלה פנייה חדשה מדף צור קשר:", toEnv: "MAIL_TO_CONTACT" },
  suppliers: { subject: "פנייה חדשה - ספקים", intro: "התקבלה פנייה חדשה מדף הספקים:", toEnv: "MAIL_TO_SUPPLIERS" },
  "order-cancellation": {
    subject: "בקשת ביטול הזמנה",
    intro: "התקבלה בקשת ביטול הזמנה:",
    toEnv: "MAIL_TO_ORDER_CANCELLATION",
  },
  wholesale: { subject: "בקשת סיטונאות חדשה", intro: "התקבלה בקשת סיטונאות חדשה:", toEnv: "MAIL_TO_WHOLESALE" },
  club: { subject: "הרשמה חדשה - הנבחרת הסודית", intro: "התקבלה הרשמה חדשה לנבחרת הסודית:", toEnv: "MAIL_TO_CLUB" },
  "club-home": {
    subject: "הרשמה חדשה - מועדון הלקוחות (דף הבית)",
    intro: "התקבלה הרשמה חדשה מדף הבית:",
    toEnv: "MAIL_TO_CLUB_HOME",
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LeadFields {
  name: unknown;
  email: unknown;
  phone: unknown;
  birthday?: unknown;
}

/** One or more comma-separated addresses, each validated. "" when none is usable. */
const validRecipients = (value: unknown) =>
  typeof value === "string"
    ? value
        .split(",")
        .map((a) => oneLine(a))
        .filter((a) => EMAIL_RE.test(a))
        .join(", ")
    : "";

/** Recipient order: wp-admin setting for this form → env override → MAIL_TO. */
async function resolveRecipient(form: LeadForm): Promise<string> {
  const fromAdmin = validRecipients((await getFormRecipients())?.[form]);
  return fromAdmin || validRecipients(process.env[FORMS[form].toEnv]) || validRecipients(process.env.MAIL_TO);
}

const clean =(value: unknown, max: number) => (typeof value === "string" ? oneLine(value).slice(0, max) : "");

export function isLeadForm(value: unknown): value is LeadForm {
  return typeof value === "string" && value in FORMS;
}

/** Validate + email one form submission. "invalid" = bad input, "failed" = SMTP/config problem. */
export async function sendLeadMail(form: LeadForm, fields: LeadFields): Promise<"ok" | "invalid" | "failed"> {
  const name = clean(fields.name, 120);
  const email = clean(fields.email, 200);
  const phone = clean(fields.phone, 40);
  const birthday = clean(fields.birthday, 40);
  if (!name || !phone || !EMAIL_RE.test(email)) return "invalid";

  const config = FORMS[form];
  const to = await resolveRecipient(form);
  if (!to) {
    console.error(`[mail] no recipient configured (${config.toEnv} or MAIL_TO)`);
    return "failed";
  }

  const lines = [config.intro, "", `שם: ${name}`, `אימייל: ${email}`, `טלפון: ${phone}`];
  if (birthday) lines.push(`תאריך לידה: ${birthday}`);

  const sent = await sendMail({ to, subject: `${config.subject} - ${name}`, text: lines.join("\n"), replyTo: email });
  return sent ? "ok" : "failed";
}
