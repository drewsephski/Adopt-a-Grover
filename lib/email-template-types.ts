export const EmailTemplateType = {
  CLAIM_CONFIRMATION: "CLAIM_CONFIRMATION",
  DONOR_REMINDER: "DONOR_REMINDER", 
  WELCOME_EMAIL: "WELCOME_EMAIL",
  CAMPAIGN_UPDATE: "CAMPAIGN_UPDATE",
  CAMPAIGN_COMPLETION: "CAMPAIGN_COMPLETION",
  ADMIN_NOTIFICATION: "ADMIN_NOTIFICATION"
} as const;

export type EmailTemplateType = typeof EmailTemplateType[keyof typeof EmailTemplateType];

export interface EmailTemplate {
  id: string;
  type: EmailTemplateType;
  name: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
  isActive: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
