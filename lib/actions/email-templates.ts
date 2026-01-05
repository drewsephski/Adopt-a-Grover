"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const templates = await db.$queryRaw<EmailTemplate[]>`
      SELECT * FROM "EmailTemplate" 
      ORDER BY type ASC
    `;
    return templates;
  } catch (error) {
    console.error("Failed to get email templates:", error);
    throw new Error("Failed to retrieve email templates");
  }
}

export async function getEmailTemplate(type: EmailTemplateType): Promise<EmailTemplate | null> {
  try {
    const templates = await db.$queryRaw<EmailTemplate[]>`
      SELECT * FROM "EmailTemplate" 
      WHERE type = ${type}
      LIMIT 1
    `;
    return templates[0] || null;
  } catch (error) {
    console.error(`Failed to get email template ${type}:`, error);
    throw new Error(`Failed to retrieve email template: ${type}`);
  }
}

export async function createEmailTemplate(data: {
  type: EmailTemplateType;
  name: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  description?: string;
}): Promise<EmailTemplate> {
  try {
    const result = await db.$queryRaw<EmailTemplate[]>`
      INSERT INTO "EmailTemplate" (type, name, subject, "htmlContent", "textContent", "isActive", description, "createdAt", "updatedAt")
      VALUES (${data.type}, ${data.name}, ${data.subject}, ${data.htmlContent || null}, ${data.textContent || null}, true, ${data.description || null}, NOW(), NOW())
      RETURNING *
    `;
    
    revalidatePath("/admin/email-templates");
    return result[0];
  } catch (error) {
    console.error("Failed to create email template:", error);
    throw new Error("Failed to create email template");
  }
}

export async function updateEmailTemplate(
  id: string,
  data: {
    name?: string;
    subject?: string;
    htmlContent?: string | null;
    textContent?: string | null;
    isActive?: boolean;
    description?: string | null;
  }
): Promise<EmailTemplate> {
  try {
    // Build the update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (data.name !== undefined) {
      updateFields.push(`name = ?`);
      updateValues.push(data.name);
    }
    if (data.subject !== undefined) {
      updateFields.push(`subject = ?`);
      updateValues.push(data.subject);
    }
    if (data.htmlContent !== undefined) {
      updateFields.push(`"htmlContent" = ?`);
      updateValues.push(data.htmlContent);
    }
    if (data.textContent !== undefined) {
      updateFields.push(`"textContent" = ?`);
      updateValues.push(data.textContent);
    }
    if (data.isActive !== undefined) {
      updateFields.push(`"isActive" = ?`);
      updateValues.push(data.isActive);
    }
    if (data.description !== undefined) {
      updateFields.push(`description = ?`);
      updateValues.push(data.description);
    }
    
    updateFields.push(`"updatedAt" = NOW()`);
    updateValues.push(id);
    
    const query = `
      UPDATE "EmailTemplate" 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
      RETURNING *
    `;
    
    const result = await db.$queryRawUnsafe<EmailTemplate[]>(query, ...updateValues);
    
    revalidatePath("/admin/email-templates");
    return result[0];
  } catch (error) {
    console.error("Failed to update email template:", error);
    throw new Error("Failed to update email template");
  }
}

export async function deleteEmailTemplate(id: string): Promise<{ success: boolean }> {
  try {
    await db.$queryRaw`
      DELETE FROM "EmailTemplate" 
      WHERE id = ${id}
    `;

    revalidatePath("/admin/email-templates");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete email template:", error);
    throw new Error("Failed to delete email template");
  }
}

export async function seedDefaultEmailTemplates() {
  try {
    const defaultTemplates = [
      {
        type: EmailTemplateType.CLAIM_CONFIRMATION,
        name: "Claim Confirmation",
        subject: "🎁 Gift Claim Confirmation - {{campaignName}}",
        htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h1>Thank you, {{donorName}}!</h1><p>We've successfully recorded your gift claim for <strong>{{campaignName}}</strong>. Your generosity makes a real difference in our community!</p><h2>YOUR CLAIMED ITEMS</h2>{{#each items}}<div style="margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee;"><strong>{{quantity}}x {{name}}</strong><br><span style="color: #666;">For {{familyAlias}}</span></div>{{/each}}<h2>DROP-OFF INSTRUCTIONS</h2><p>Please deliver your items (unwrapped, unless specified) to our collection point.</p><div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 10px 0;"><strong>{{dropOffAddress}}</strong><br><strong>Deadline:</strong> {{dropOffDeadline}}</div><p>If you have any questions or need to change your claim, please reply to this email.</p><p>Together, we're making the holidays brighter for everyone in Fox River Grove.</p></div>`,
        textContent: `Thank you, {{donorName}}!\n\nWe've successfully recorded your gift claim for {{campaignName}}. Your generosity makes a real difference in our community!\n\nYOUR CLAIMED ITEMS\n{{#each items}}\n- {{quantity}}x {{name}} (for {{familyAlias}})\n{{/each}}\n\nDROP-OFF INSTRUCTIONS\nPlease deliver your items (unwrapped, unless specified) to our collection point.\nLocation: {{dropOffAddress}}\nDeadline: {{dropOffDeadline}}\n\nIf you have any questions or need to change your claim, please reply to this email.\nTogether, we're making the holidays brighter for everyone in Fox River Grove.`,
        description: "Email sent to donors when they claim gifts"
      },
      {
        type: EmailTemplateType.DONOR_REMINDER,
        name: "Donor Reminder",
        subject: "{{urgencyEmoji}} Reminder: Drop-off deadline is {{dropOffDate}}!",
        htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>Hi {{donorName}},</h2><p>This is a friendly reminder about your gift drop-off by {{dropOffDate}}.</p><h3>Your claimed items:</h3>{{#each items}}<div style="margin: 5px 0;">- {{quantity}}x {{name}} (for {{familyAlias}})</div>{{/each}}<p><strong>Drop-off location:</strong> {{dropOffAddress}}</p><p><strong>Drop-off date:</strong> {{dropOffDate}}</p>{{#if campaignName}}<p><strong>Campaign:</strong> {{campaignName}}</p>{{/if}}<p>Thank you for making the holidays brighter for local families!</p><p>If you have any questions, please reply to this email.</p><p>---<br>Pitch In List</p>{{#if isUrgent}}<p style="color: red; font-weight: bold;">URGENT: Please deliver your items by December 19th!</p>{{/if}}</div>`,
        textContent: `Hi {{donorName}},\n\nThis is a friendly reminder about your gift drop-off by {{dropOffDate}}.\n\nYour claimed items:\n{{#each items}}\n- {{quantity}}x {{name}} (for {{familyAlias}})\n{{/each}}\n\nDrop-off location: {{dropOffAddress}}\nDrop-off date: {{dropOffDate}}\n{{#if campaignName}}Campaign: {{campaignName}}{{/if}}\n\nThank you for making the holidays brighter for local families!\n\nIf you have any questions, please reply to this email.\n\n---\nPitch In List\n{{#if isUrgent}}URGENT: Please deliver your items by December 19th!{{/if}}`,
        description: "Reminder email sent to donors before drop-off deadline"
      },
      {
        type: EmailTemplateType.WELCOME_EMAIL,
        name: "Welcome Email",
        subject: "🎄 Welcome to {{campaignName}} - Pitch In List",
        htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h1>Hi {{recipientName}}!</h1><p>Welcome to Pitch In List{{#if campaignName}} and the {{campaignName}} campaign!{{else}}!{{/if}}</p><p>We're excited to have you participate in making the holidays brighter for local families. Here's how to get started:</p><ol><li>Browse available gifts on our website</li><li>Select items you'd like to donate</li><li>Complete the claim form</li><li>Deliver your items by the deadline</li></ol><p>Thank you for your generosity!</p><p>If you have any questions, please reply to this email.</p><p>---<br>Pitch In List</p>{{#if campaignName}}<p>Campaign: {{campaignName}}</p>{{/if}}</div>`,
        textContent: `Hi {{recipientName}},\n\nWelcome to Pitch In List{{#if campaignName}} and the {{campaignName}} campaign!{{else}}!{{/if}}\n\nWe're excited to have you participate in making the holidays brighter for local families. Here's how to get started:\n\n1. Browse available gifts on our website\n2. Select items you'd like to donate\n3. Complete the claim form\n4. Deliver your items by the deadline\n\nThank you for your generosity!\n\nIf you have any questions, please reply to this email.\n\n---\nPitch In List\n{{#if campaignName}}Campaign: {{campaignName}}{{/if}}`,
        description: "Welcome email sent to new users"
      },
      {
        type: EmailTemplateType.CAMPAIGN_UPDATE,
        name: "Campaign Update",
        subject: "{{typeEmoji}} Campaign Update: {{campaignName}}",
        htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>Hello,</h2><p>{{updateMessage}}</p><hr style="margin: 20px 0;"><p><strong>Campaign:</strong> {{campaignName}}</p><p><strong>Type:</strong> {{updateType}}</p><p><strong>Sent:</strong> {{sentDate}}</p><p>Pitch In List</p></div>`,
        textContent: `Hello,\n\n{{updateMessage}}\n\n---\nCampaign: {{campaignName}}\nType: {{updateType}}\nSent: {{sentDate}}\n\nPitch In List`,
        description: "General campaign update email sent to recipients"
      },
      {
        type: EmailTemplateType.CAMPAIGN_COMPLETION,
        name: "Campaign Completion",
        subject: "Campaign Completion Report - {{campaignName}}",
        htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>Great news!</h2><p>The {{campaignName}} campaign has been completed.</p><h3>📊 Campaign Summary:</h3><ul><li>Families served: {{totalFamilies}}</li><li>Total gifts listed: {{totalGifts}}</li><li>Items claimed: {{totalClaims}}</li><li>Completion rate: {{completionRate}}%</li></ul><p>The campaign is now ready for archival. You can view detailed reports in the admin dashboard.</p><p>---<br>Pitch In List Admin System</p></div>`,
        textContent: `Great news! The {{campaignName}} campaign has been completed.\n\n📊 Campaign Summary:\n• Families served: {{totalFamilies}}\n• Total gifts listed: {{totalGifts}}\n• Items claimed: {{totalClaims}}\n• Completion rate: {{completionRate}}%\n\nThe campaign is now ready for archival. You can view detailed reports in the admin dashboard.\n\n---\nPitch In List Admin System`,
        description: "Email sent to admin when campaign is completed"
      },
      {
        type: EmailTemplateType.ADMIN_NOTIFICATION,
        name: "Admin Notification",
        subject: "{{priorityPrefix}} {{subject}}",
        htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>{{subject}}</h2><p>{{message}}</p><hr style="margin: 20px 0;"><p>Sent from Pitch In List Admin System</p><p><strong>Priority:</strong> {{priority}}</p></div>`,
        textContent: `{{message}}\n\n---\nSent from Pitch In List Admin System\nPriority: {{priority}}`,
        description: "General admin notification email"
      }
    ];

    for (const templateData of defaultTemplates) {
      const existing = await getEmailTemplate(templateData.type);

      if (!existing) {
        await createEmailTemplate(templateData);
      }
    }

    return { success: true, seeded: defaultTemplates.length };
  } catch (error) {
    console.error("Failed to seed default email templates:", error);
    throw new Error("Failed to seed default email templates");
  }
}

// Template rendering helper
export function renderTemplate(template: string, variables: Record<string, string | number | boolean | Array<Record<string, string | number>>>): string {
  let rendered = template;

  // Simple variable replacement {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(value || ''));
  });

  // Handle simple #each blocks for arrays
  rendered = rendered.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayName, content) => {
    const array = variables[arrayName];
    if (!Array.isArray(array)) return '';
    
    return array.map(item => {
      let itemContent = content;
      Object.entries(item).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        itemContent = itemContent.replace(regex, String(value || ''));
      });
      return itemContent;
    }).join('');
  });

  // Handle simple #if blocks
  rendered = rendered.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, varName, content) => {
    const value = variables[varName];
    return value ? content : '';
  });

  return rendered;
}
