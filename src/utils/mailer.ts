import { EmailService } from "../services/emailService.js";
import { emailTemplates } from "./emailTemplates.js";

export async function sendVerificationEmail(
  email: string,
  verificationToken: string
) {
  // Send verification email
  await EmailService.sendTemplatedEmail(
    email,
    emailTemplates.verification.name,
    {
      verificationLink: `${process.env.APP_URL}/auth/verify-email?token=${verificationToken}`,
    }
  );
}

export async function sendListingEmail(
  to: string,
  listings: Object[],
  unsubscribeUrl: string
) {
  await EmailService.sendTemplatedEmail(to, emailTemplates.listings.name, {
    listings: listings,
    unsubscribeUrl: unsubscribeUrl,
  });
}
