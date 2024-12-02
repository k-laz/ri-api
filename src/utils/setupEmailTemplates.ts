import { EmailService } from "../services/emailService.js";
import { emailTemplates } from "./emailTemplates.js";

async function setupTemplates() {
  try {
    for (const template of Object.values(emailTemplates)) {
      await EmailService.createTemplate(
        template.name,
        template.subject,
        template.html
      );
    }
    console.log("All email templates created successfully");
  } catch (error) {
    console.error("Error setting up templates:", error);
  }
}

// Run this script once to set up your templates
setupTemplates();
