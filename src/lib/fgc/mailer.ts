import { getFgcRuntimeConfig } from "@/lib/fgc/env";

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

export class FgcEmailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FgcEmailConfigurationError";
  }
}

export async function sendFgcMail(message: MailMessage) {
  const config = getFgcRuntimeConfig();
  if (!config.emailProvider || !config.emailFrom || !config.emailApiKey) {
    throw new FgcEmailConfigurationError("Transactional email is not configured. Set FGC_EMAIL_PROVIDER, FGC_EMAIL_FROM and FGC_EMAIL_API_KEY.");
  }

  if (config.emailProvider !== "resend") {
    throw new FgcEmailConfigurationError(`Unsupported FGC_EMAIL_PROVIDER "${config.emailProvider}". Configure a supported provider adapter before sending email.`);
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.emailApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: config.emailFrom,
      to: message.to,
      subject: message.subject,
      text: message.text
    })
  });

  if (!response.ok) {
    throw new Error(`Email delivery failed with status ${response.status}.`);
  }

  return response.json() as Promise<{ id?: string }>;
}
