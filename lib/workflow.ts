import { Client as QStashClient, resend } from "@upstash/qstash";
import config from "@/lib/config";

const qstashClient = new QStashClient({
  token: config.env.upstash.qtashToken,
});

// Send email via QStash + Resend
// From address uses Resend shared domain until a custom domain is connected
export const sendEmail = async ({
  email,
  subject,
  html,
}: {
  email: string;
  subject: string;
  html: string;
}) => {
  try {
    await qstashClient.publishJSON({
      api: {
        name: "email",
        provider: resend({ token: config.env.resendToken }),
      },
      body: {
        // Change "from" to your verified domain when ready, e.g. noreply@cheerity.com
        from: "Cheerity <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      },
    });
  } catch (error) {
    // Log but don't throw - email failure should not block main action
    console.error("Email send failed:", error);
  }
};

// Email templates

export const emailTemplates = {
  welcomeUser: (name: string) => ({
    subject: "Welcome to Cheerity!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #166534;">Welcome to Cheerity, ${name}!</h2>
        <p>Your account has been created successfully. You can now browse donation campaigns and help those in need.</p>
        <p>Visit <a href="${config.env.prodApiEndpoint}" style="color: #166534;">Cheerity</a> to get started.</p>
        <p style="color: #6b7280; font-size: 12px;">Cheerity - Bring Cheer</p>
      </div>
    `,
  }),

  institutionApplicationReceived: (name: string) => ({
    subject: "Application Received - Cheerity",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #166534;">Application Received</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We have received your institution registration request. Our admin team will review your application within 1-3 business days.</p>
        <p>You will be notified via email once your application is reviewed.</p>
        <p style="color: #6b7280; font-size: 12px;">Cheerity - Bring Cheer</p>
      </div>
    `,
  }),

  institutionApproved: (name: string) => ({
    subject: "Your Institution is Approved - Cheerity",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #166534;">Application Approved!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Great news! Your institution has been approved. You can now log in and start creating donation campaigns.</p>
        <a href="${config.env.prodApiEndpoint}/sign-in" style="display: inline-block; background: #166534; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Login Now</a>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">Cheerity - Bring Cheer</p>
      </div>
    `,
  }),

  institutionRejected: (name: string, reason?: string) => ({
    subject: "Institution Application Update - Cheerity",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Application Not Approved</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We have reviewed your institution application and unfortunately we are unable to approve it at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        <p>If you believe this is a mistake, please contact us or reapply with updated information.</p>
        <p style="color: #6b7280; font-size: 12px;">Cheerity - Bring Cheer</p>
      </div>
    `,
  }),
};