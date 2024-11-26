import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export class EmailService {
  private ses: SESClient;

  constructor() {
    this.ses = new SESClient({
      region: "us-west-2", // Match your error region
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    const senderEmail = "newsletter@rentalsinsight.com";

    try {
      const command = new SendEmailCommand({
        Source: senderEmail,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: { Data: subject },
          Body: { Html: { Data: html } },
        },
      });

      const response = await this.ses.send(command);
      return response;
    } catch (error: any) {
      console.error(`Failed to send email to ${to}:`, error);
      throw new Error(`Email send failed: ${error.message}`);
    }
  }
}
