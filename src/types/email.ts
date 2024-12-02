export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
}

export interface EmailTemplateData {
  [key: string]: string | number | boolean;
}
