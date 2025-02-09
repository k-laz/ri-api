import dotenv from "dotenv";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Load environment variables
dotenv.config();

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testSESConnection() {
  try {
    console.log("Testing SES connection...");
    console.log("Region:", process.env.AWS_REGION);
    console.log(
      "Access Key ID:",
      process.env.AWS_ACCESS_KEY_ID
        ? "****" + process.env.AWS_ACCESS_KEY_ID.slice(-4)
        : "missing"
    );

    const params = {
      Source: "your-verified-email@example.com",
      Destination: {
        ToAddresses: ["your-verified-email@example.com"],
      },
      Message: {
        Subject: {
          Data: "SES Test Email",
        },
        Body: {
          Text: {
            Data: "This is a test email from SES",
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const result = await ses.send(command);
    console.log("Email sent successfully:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

testSESConnection();
