// Import AWS SDK
import AWS from "aws-sdk";

// Initialize the SES client
const ses = new AWS.SES({ region: "us-west-2" });

/**
 * Sends an email via AWS SES.
 * @param {string} toEmail - Recipient email address.
 * @param {string} subject - Subject of the email.
 * @param {string} body - Body content of the email.
 */
async function sendEmail(toEmail, subject, body) {
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

// Test the function
const test = async () => {
  const toEmail = "klazarevdev@gmail.com"; // Replace with the recipient's email
  const subject = "Test Email";
  const body = "<p>This is a test email sent using AWS SES.</p>";

  await sendEmail(toEmail, subject, body);
};

test();
