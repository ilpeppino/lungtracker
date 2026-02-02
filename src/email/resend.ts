import { Resend } from "resend";
import { config } from "../config.js";

const resend = new Resend(config.RESEND_API_KEY);

export async function sendReportLinkEmail(params: {
  to: string;
  link: string;
  expiresAtIso: string;
}) {
  const { to, link, expiresAtIso } = params;

  await resend.emails.send({
    from: config.REPORT_FROM_EMAIL,
    to,
    subject: "Your Lung Tracker report",
    text: `Your report is ready.

Download link (expires ${expiresAtIso}):
${link}
`
  });
}
