import {
  SESClient,
  SendTemplatedEmailCommand,
  CreateTemplateCommand,
} from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export class EmailService {
  static async createTemplate(
    templateName: string,
    subject: string,
    htmlContent: string
  ) {
    const command = new CreateTemplateCommand({
      Template: {
        TemplateName: templateName,
        SubjectPart: subject,
        HtmlPart: htmlContent,
        TextPart: "Text version of the email", // Optional
      },
    });

    try {
      await sesClient.send(command);
      console.log(`Template ${templateName} created successfully`);
    } catch (error) {
      console.error("Error creating template:", error);
      throw error;
    }
  }

  static async sendTemplatedEmail(
    to: string,
    templateName: string,
    templateData: Record<string, any>
  ) {
    const command = new SendTemplatedEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Source: process.env.SES_SENDER_EMAIL,
      Template: templateName,
      TemplateData: JSON.stringify(templateData),
    });

    try {
      await sesClient.send(command);
      console.log(`Email sent to ${to} using template ${templateName}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}