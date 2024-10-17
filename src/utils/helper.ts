import AWS from "aws-sdk";

// Initialize the SES client
const ses = new AWS.SES({ region: "us-west-2" });

/**
 * Sends an email via AWS SES.
 * @param {string} toEmail - Recipient email address.
 * @param {string} subject - Subject of the email.
 * @param {string} body - Body content of the email.
 */
export async function sendEmail(
  toEmail: string,
  subject: string,
  body: string
): Promise<void> {
  // Construct email parameters
  const params = {
    Destination: {
      ToAddresses: [toEmail], // Recipient email address
    },
    Message: {
      Body: {
        Html: { Data: body }, // You can use Html or Text based on the email type
        Text: { Data: body }, // Plain-text version of the body
      },
      Subject: { Data: subject }, // Email subject
    },
    Source: "newsletter@rental-insight.com", // Sender's verified email
  };

  try {
    // Send email via SES
    await ses.sendEmail(params).promise();
    console.log(`Email sent to ${toEmail} successfully.`);
  } catch (err) {
    console.error(`Failed to send email to ${toEmail}:`, err);
    if (err instanceof Error) {
      throw new Error(`Email send failed: ${err.message}`);
    }
  }
}
