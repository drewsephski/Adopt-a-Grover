"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { EmailTemplateType, EmailTemplate } from "@/lib/email-template-types";

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
    let paramIndex = 1;
    
    if (data.name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      updateValues.push(data.name);
      paramIndex++;
    }
    if (data.subject !== undefined) {
      updateFields.push(`subject = $${paramIndex}`);
      updateValues.push(data.subject);
      paramIndex++;
    }
    if (data.htmlContent !== undefined) {
      updateFields.push(`"htmlContent" = $${paramIndex}`);
      updateValues.push(data.htmlContent);
      paramIndex++;
    }
    if (data.textContent !== undefined) {
      updateFields.push(`"textContent" = $${paramIndex}`);
      updateValues.push(data.textContent);
      paramIndex++;
    }
    if (data.isActive !== undefined) {
      updateFields.push(`"isActive" = $${paramIndex}`);
      updateValues.push(data.isActive);
      paramIndex++;
    }
    if (data.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      updateValues.push(data.description);
      paramIndex++;
    }
    
    updateFields.push(`"updatedAt" = NOW()`);
    updateValues.push(id);
    
    const query = `
      UPDATE "EmailTemplate" 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
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
export async function sendTestEmailTemplate(
  type: EmailTemplateType,
  testEmails: string[],
  variables: Record<string, string | number | boolean | Array<Record<string, string | number>>> = {}
): Promise<{ success: boolean; message: string }> {
  try {
    const template = await getEmailTemplate(type);
    
    if (!template) {
      return { success: false, message: "Template not found" };
    }

    if (!template.isActive) {
      return { success: false, message: "Template is not active" };
    }

    // Import the sendEmail function
    const { sendEmail: sendEmailFunc } = await import("@/lib/email");
    const { renderTemplate: renderTemplateFunc } = await import("@/lib/actions/email-templates");
    const defaultVariables = {
      [EmailTemplateType.CLAIM_CONFIRMATION]: {
        donorName: "Test Donor",
        campaignName: "Test Campaign",
        items: [
          { name: "Test Gift", quantity: 1, familyAlias: "Test Family" }
        ],
        dropOffAddress: "123 Test St, Test City, IL",
        dropOffDeadline: "December 25, 2025"
      },
      [EmailTemplateType.DONOR_REMINDER]: {
        donorName: "Test Donor",
        items: [
          { name: "Test Gift", quantity: 1, familyAlias: "Test Family" }
        ],
        dropOffAddress: "123 Test St, Test City, IL",
        dropOffDate: "December 25, 2025",
        campaignName: "Test Campaign",
        urgencyEmoji: "🎁",
        isUrgent: false
      },
      [EmailTemplateType.WELCOME_EMAIL]: {
        recipientName: "Test User",
        campaignName: "Test Campaign"
      },
      [EmailTemplateType.CAMPAIGN_UPDATE]: {
        campaignName: "Test Campaign",
        updateMessage: "This is a test campaign update message.",
        updateType: "general",
        sentDate: new Date().toLocaleDateString()
      },
      [EmailTemplateType.CAMPAIGN_COMPLETION]: {
        campaignName: "Test Campaign",
        totalFamilies: 10,
        totalGifts: 25,
        totalClaims: 20,
        completionRate: 80
      },
      [EmailTemplateType.ADMIN_NOTIFICATION]: {
        subject: "Test Admin Notification",
        message: "This is a test admin notification message.",
        priority: "normal"
      }
    };

    const mergedVariables = { ...defaultVariables[type], ...variables };

    const subject = await renderTemplateFunc(template.subject, mergedVariables);
    const htmlContent = template.htmlContent ? await renderTemplateFunc(template.htmlContent, mergedVariables) : undefined;
    const textContent = template.textContent ? await renderTemplateFunc(template.textContent, mergedVariables) : undefined;

    // Debug logging
    console.log('Template Debug:', {
      templateType: template.type,
      hasOriginalHtml: !!template.htmlContent,
      hasOriginalText: !!template.textContent,
      renderedHtmlLength: htmlContent?.length || 0,
      renderedTextLength: textContent?.length || 0,
      subject
    });

    // Validate rendered content
    const validHtmlContent = htmlContent && htmlContent.trim() !== '' ? htmlContent : undefined;
    const validTextContent = textContent && textContent.trim() !== '' ? textContent : undefined;

    // Send to all provided emails
    for (const testEmail of testEmails) {
      const emailData: {
        to: string;
        subject: string;
        template?: {
          html?: string;
          text?: string;
        };
      } = {
        to: testEmail,
        subject: `[TEST] ${subject}`
      };

      if (validHtmlContent) {
        emailData.template = { html: validHtmlContent };
      } else if (validTextContent) {
        emailData.template = { text: validTextContent };
      } else {
        // If no content at all, provide a fallback
        emailData.template = { 
          text: `Test email for ${template.name}\n\nTemplate type: ${template.type}\nSubject: ${subject}` 
        };
      }

      // Debug the email data being sent
      console.log('Email Data Being Sent:', {
        to: emailData.to,
        subject: emailData.subject,
        hasTemplate: !!emailData.template,
        templateKeys: emailData.template ? Object.keys(emailData.template) : [],
        htmlLength: emailData.template?.html?.length || 0,
        textLength: emailData.template?.text?.length || 0
      });

      await sendEmailFunc(emailData);
    }

    return { success: true, message: `Test email${testEmails.length > 1 ? 's' : ''} sent successfully` };
  } catch (error) {
    console.error("Failed to send test email:", error);
    return { success: false, message: `Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Template rendering helper
export async function renderTemplate(template: string, variables: Record<string, string | number | boolean | Array<Record<string, string | number>>>): Promise<string> {
  let rendered = template;

  // Simple variable replacement {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(value || ''));
  });

  // Handle simple #each blocks for arrays
  rendered = rendered.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match: any, arrayName: any, content: any) => {
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
  rendered = rendered.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match: any, varName: any, content: any) => {
    const value = variables[varName];
    return value ? content : '';
  });

  return rendered;
}

// Get donor's claimed items with all necessary data for email templates
export async function getDonorClaimedItems(donorEmail: string): Promise<{
  donorName: string;
  items: Array<{
    name: string;
    quantity: number;
    familyAlias: string;
  }>;
  campaignName?: string;
  dropOffAddress?: string;
  dropOffDeadline?: Date;
} | null> {
  try {
    const claims = await db.$queryRaw`
      SELECT 
        c."donorName",
        c.quantity,
        g.name as "giftName",
        f.alias as "familyAlias",
        cam.name as "campaignName",
        cam."dropOffAddress",
        cam."dropOffDeadline"
      FROM "Claim" c
      JOIN "Gift" g ON c."giftId" = g.id
      JOIN "Family" f ON g."familyId" = f.id
      JOIN "Campaign" cam ON f."campaignId" = cam.id
      WHERE LOWER(c."donorEmail") = LOWER(${donorEmail})
      ORDER BY c."createdAt" DESC
    `;

    if (!Array.isArray(claims) || claims.length === 0) {
      return null;
    }

    const claimsArray = claims as any[];
    const donorName = claimsArray[0].donorName;
    const campaignName = claimsArray[0].campaignName;
    const dropOffAddress = claimsArray[0].dropOffAddress;
    const dropOffDeadline = claimsArray[0].dropOffDeadline;

    const items = claimsArray.map(claim => ({
      name: claim.giftName,
      quantity: claim.quantity,
      familyAlias: claim.familyAlias
    }));

    return {
      donorName,
      items,
      campaignName: campaignName || undefined,
      dropOffAddress: dropOffAddress || undefined,
      dropOffDeadline: dropOffDeadline ? new Date(dropOffDeadline) : undefined
    };
  } catch (error) {
    console.error("Failed to get donor claimed items:", error);
    throw new Error("Failed to retrieve donor claimed items");
  }
}

// Send real claim confirmation email to a specific donor
export async function sendRealClaimConfirmationEmail(
  donorEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Get donor's claimed items
    const donorData = await getDonorClaimedItems(donorEmail);
    
    if (!donorData) {
      return { success: false, message: "No claimed items found for this donor" };
    }

    // Get the claim confirmation template
    const template = await getEmailTemplate(EmailTemplateType.CLAIM_CONFIRMATION);
    
    if (!template) {
      return { success: false, message: "Claim confirmation template not found" };
    }

    if (!template.isActive) {
      return { success: false, message: "Claim confirmation template is not active" };
    }

    // Import the sendEmail function
    const { sendEmail: sendEmailFunc } = await import("@/lib/email");
    
    // Prepare template variables
    const variables = {
      donorName: donorData.donorName,
      campaignName: donorData.campaignName || "Pitch In List",
      items: donorData.items,
      dropOffAddress: donorData.dropOffAddress || "TBD",
      dropOffDeadline: donorData.dropOffDeadline?.toLocaleDateString() || "TBD"
    };

    // Render the template
    const subject = await renderTemplate(template.subject, variables);
    const htmlContent = template.htmlContent ? await renderTemplate(template.htmlContent, variables) : undefined;
    const textContent = template.textContent ? await renderTemplate(template.textContent, variables) : undefined;

    // Validate rendered content
    const validHtmlContent = htmlContent && htmlContent.trim() !== '' ? htmlContent : undefined;
    const validTextContent = textContent && textContent.trim() !== '' ? textContent : undefined;

    // Send the email
    const emailData: {
      to: string;
      subject: string;
      template?: {
        html?: string;
        text?: string;
      };
    } = {
      to: donorEmail,
      subject
    };

    if (validHtmlContent) {
      emailData.template = { html: validHtmlContent };
    } else if (validTextContent) {
      emailData.template = { text: validTextContent };
    } else {
      // If no content at all, provide a fallback
      emailData.template = { 
        text: `Thank you, ${donorData.donorName}!\n\nWe've successfully recorded your gift claim for ${donorData.campaignName || 'Pitch In List'}. Your generosity makes a real difference in our community!\n\nYOUR CLAIMED ITEMS\n${donorData.items.map(item => `- ${item.quantity}x ${item.name} (for ${item.familyAlias})`).join('\n')}\n\nThank you for making the holidays brighter for local families!\n\nIf you have any questions, please reply to this email.\n\n---\nPitch In List` 
      };
    }

    await sendEmailFunc(emailData);

    return { success: true, message: `Claim confirmation email sent to ${donorEmail}` };
  } catch (error) {
    console.error("Failed to send real claim confirmation email:", error);
    return { success: false, message: `Failed to send claim confirmation email: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
