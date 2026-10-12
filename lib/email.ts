const RESEND_FROM_EMAIL = "Cheerity <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const resendApiKey = process.env.RESEND_TOKEN;

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return;
    }
    const actualTarget = process.env.NODE_ENV === "development" ? "selviam2017@gmail.com" : to;
    const finalSubject = process.env.NODE_ENV === "development" && to !== "selviam2017@gmail.com" 
      ? `[Original To: ${to}] ${subject}` 
      : subject;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`, 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [actualTarget],
        subject: finalSubject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Email send failed:", error);
    } else {
      console.log("Email sent successfully!");
    }
  } catch (error) {
    console.error("Email send error:", error);
  }
}

// Email templates for different scenarios
export const emailTemplates = {
  // Donatur emails
  welcomeUser: (name: string) => ({
    subject: "Welcome to Cheerity!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #166534;">Welcome to Cheerity, ${name}!</h2>
        <p>Your account has been created successfully. You can now browse donation campaigns and help those in need.</p>
        <p>Visit <a href="${process.env.NEXT_PUBLIC_PROD_API_ENDPOINT}" style="color: #166534;">Cheerity</a> to get started.</p>
        <p style="color: #6b7280; font-size: 12px;">Cheerity - Bring Cheer</p>
      </div>
    `,
  }),

  donationRequestAccepted: (donationTitle: string, institutionName: string) => ({
    subject: "Donation Request Accepted",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #166534;">Donation Request Accepted!</h2>
        <p>Great news! Your donation request for "${donationTitle}" has been accepted by ${institutionName}.</p>
        <p>Please prepare your donation for delivery according to the agreed method.</p>
        <p style="color: #6b7280; font-size: 12px;">Cheerity - Bring Cheer</p>
      </div>
    `,
  }),

  donationRequestRejected: (donationTitle: string, reason?: string) => ({
    subject: "Donation Request Rejected",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Donation Request Rejected</h2>
        <p>Your donation request for "${donationTitle}" has been rejected.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        <p>Please try donating to other campaigns or contact the institution for more information.</p>
        <p style="color: #6b7280; font-size: 12px;">Cheerity - Bring Cheer</p>
      </div>
    `,
  }),

  donationCompleted: (donationTitle: string, institutionName: string) => ({
    subject: "Your Donation is Completed!",
    html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #166534;">Donation Completed!</h2>
      <p>Great news! ${institutionName} has confirmed the arrival and uploaded the documentation proof for your donation "${donationTitle}".</p>
      <p>You can now view the proof of delivery in your donation history.</p>
      <p>Thank you for your incredible generosity!</p>
      <p style="color: #6b7280; font-size: 12px;">Cheerity - Bring Cheer</p>
    </div>
    `,
  }),

  // Lembaga Sosial emails
  institutionApproved: (name: string) => ({
    subject: "Your Institution is Approved - Cheerity",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #166534;">Application Approved!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Great news! Your institution has been approved. You can now log in and start creating donation campaigns.</p>
        <a href="${process.env.NEXT_PUBLIC_PROD_API_ENDPOINT}/sign-in" style="display: inline-block; background: #166534; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Login Now</a>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">Cheerity - Bring Cheer</p>
      </div>
    `,
  }),

  // Admin emails
  newInstitutionRegistration: (institutionName: string, email: string) => ({
    subject: "New Institution Registration Request",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #166534;">New Institution Registration</h2>
        <p>A new institution has registered and requires review:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Institution Name:</strong> ${institutionName}</p>
          <p><strong>Email:</strong> ${email}</p>
        </div>
        <p>Please review the application in the admin dashboard.</p>
        <p style="color: #6b7280; font-size: 12px;">Cheerity - Bring Cheer</p>
      </div>
    `,
  }),
};