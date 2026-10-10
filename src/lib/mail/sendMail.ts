import nodemailer, { type Transporter } from "nodemailer";

// Server-only SMTP sender (Route Handlers). Same account WP Mail SMTP uses on
// the WordPress site; every value comes from env vars — never a NEXT_PUBLIC_ one.
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM (optional), MAIL_FROM_NAME (optional)

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    // 465 = implicit SSL; 587 = STARTTLS (WP Mail SMTP's "TLS" option).
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    // Fail fast — a stalled SMTP server must not hang the form request.
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  });
  return transporter;
}

/** Strip CR/LF so visitor input can never inject extra mail headers. */
export const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  /** The visitor — so replying to the lead mail reaches them. */
  replyTo?: string;
}

/** Returns true when the SMTP server accepted the message. Never throws. */
export async function sendMail({ to, subject, text, replyTo }: MailInput): Promise<boolean> {
  const smtp = getTransporter();
  if (!smtp) {
    console.error("[mail] SMTP_HOST/SMTP_USER/SMTP_PASS are not configured");
    return false;
  }
  const user = process.env.SMTP_USER as string;
  const fromAddress = process.env.MAIL_FROM || user;
  try {
    await smtp.sendMail({
      from: { name: process.env.MAIL_FROM_NAME || "תמר קוסמטיקס", address: fromAddress },
      to,
      subject: oneLine(subject),
      text,
      replyTo: replyTo ? oneLine(replyTo) : undefined,
    });
    return true;
  } catch (error) {
    console.error("[mail] send failed:", error instanceof Error ? error.message : error);
    return false;
  }
}
