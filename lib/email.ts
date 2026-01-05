import { Resend } from "resend";
import ClaimConfirmationEmail from "@/components/emails/claim-confirmation";
import React from "react";

// Enhanced Resend configuration
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

// Email configuration
export const EMAIL_CONFIG = {
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    replyTo: process.env.EMAIL_REPLY_TO || "onboarding@resend.dev",
    adminEmail: process.env.ADMIN_EMAIL || "onboarding@resend.dev",
    defaultDropOffAddress: "624 Ellington Court, Fox River Grove, IL 60021",
};

// Email types
export interface EmailRecipient {
    email: string;
    name?: string;
}

export interface EmailTemplate {
    react?: React.ReactElement;
    text?: string;
    html?: string;
}

export interface EmailOptions {
    to: string | string[];
    subject: string;
    template?: EmailTemplate;
    replyTo?: string;
    headers?: Record<string, string>;
}

// Error handling
export class EmailError extends Error {
    constructor(
        message: string,
        public code?: string,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'EmailError';
    }
}

// Core email sending function
export async function sendEmail(options: EmailOptions) {
    if (!resend) {
        throw new EmailError(
            "Resend API key not configured",
            "MISSING_API_KEY"
        );
    }

    try {
        const emailData: any = {
            from: EMAIL_CONFIG.from,
            to: Array.isArray(options.to) ? options.to : [options.to],
            subject: options.subject,
        };

        if (options.template?.react) {
            emailData.react = options.template.react;
        } else if (options.template?.html) {
            emailData.html = options.template.html;
        } else if (options.template?.text) {
            emailData.text = options.template.text;
        }

        if (options.replyTo) {
            emailData.replyTo = options.replyTo;
        }

        if (options.headers) {
            emailData.headers = options.headers;
        }

        const { data, error } = await resend.emails.send(emailData);

        if (error) {
            throw new EmailError(
                error.message || "Failed to send email",
                (error as any).code,
                error
            );
        }

        return { success: true, data };
    } catch (error) {
        if (error instanceof EmailError) {
            throw error;
        }
        throw new EmailError(
            "Unexpected error sending email",
            "SEND_ERROR",
            error
        );
    }
}

// Enhanced claim confirmation
export async function sendClaimConfirmation({
    donorName,
    donorEmail,
    items,
    dropOffAddress,
    dropOffDeadline,
    campaignName,
}: {
    donorName: string;
    donorEmail: string;
    items: {
        name: string;
        quantity: number;
        familyAlias: string;
    }[];
    dropOffAddress?: string;
    dropOffDeadline?: Date;
    campaignName?: string;
}) {
    return sendEmail({
        to: donorEmail,
        subject: campaignName 
            ? `🎁 Gift Claim Confirmation - ${campaignName}`
            : "🎁 Gift Claim Confirmation - Pitch In List",
        template: {
            react: React.createElement(ClaimConfirmationEmail, {
                donorName,
                items,
                dropOffAddress: dropOffAddress || EMAIL_CONFIG.defaultDropOffAddress,
                dropOffDeadline,
            }),
        },
        replyTo: EMAIL_CONFIG.replyTo,
    });
}

// Enhanced admin notifications
export async function sendAdminNotification({
    subject,
    message,
    campaignName,
    priority = 'normal',
    adminEmail = EMAIL_CONFIG.adminEmail,
}: {
    subject: string;
    message: string;
    campaignName?: string;
    priority?: 'low' | 'normal' | 'high';
    adminEmail?: string;
}) {
    const priorityPrefix = priority === 'high' ? '🚨' : priority === 'low' ? 'ℹ️' : '📢';
    
    return sendEmail({
        to: adminEmail,
        subject: `${campaignName ? `[${campaignName}] ` : ""}${priorityPrefix} ${subject}`,
        template: {
            text: `${message}\n\n---\nSent from Pitch In List Admin System\nPriority: ${priority.toUpperCase()}`,
        },
        headers: {
            'X-Priority': priority === 'high' ? '1' : priority === 'low' ? '5' : '3',
        },
    });
}

// Donor reminder with better formatting
export async function sendDonorReminder({
    donorEmail,
    donorName,
    items,
    dropOffAddress,
    dropOffDeadline,
    daysUntilDeadline,
    campaignName,
}: {
    donorEmail: string;
    donorName: string;
    items: {
        name: string;
        quantity: number;
        familyAlias: string;
    }[];
    dropOffAddress?: string;
    dropOffDeadline?: Date;
    daysUntilDeadline: number;
    campaignName?: string;
}) {
    const urgencyLevel = daysUntilDeadline <= 3 ? 'high' : daysUntilDeadline <= 7 ? 'medium' : 'low';
    const urgencyEmoji = urgencyLevel === 'high' ? '🎅' : urgencyLevel === 'medium' ? '⏰' : '🎁';
    
    // Use the specific drop-off date (December 19th) instead of "x days away"
    const dropOffDate = dropOffDeadline ? dropOffDeadline.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    }) : 'December 19th';
    
    const subject = daysUntilDeadline <= 3 
        ? `${urgencyEmoji} Reminder: Drop-off deadline is ${dropOffDate}!`
        : `${urgencyEmoji} Friendly Reminder: Your Pitch In List donation`;

    const message = `Hi ${donorName},

This is a friendly reminder about your gift drop-off by December 19th.

Your claimed items:
${items.map(item => `- ${item.quantity}x ${item.name} (for ${item.familyAlias})`).join('\n')}

Drop-off location: ${dropOffAddress || EMAIL_CONFIG.defaultDropOffAddress}
Drop-off date: ${dropOffDate}
${campaignName ? `Campaign: ${campaignName}` : ''}

Thank you for making the holidays brighter for local families!

If you have any questions, please reply to this email.

---
Pitch In List
${urgencyLevel === 'high' ? 'URGENT: Please deliver your items by December 19th!' : ''}`;

    return sendEmail({
        to: donorEmail,
        subject: campaignName ? `${subject} - ${campaignName}` : subject,
        template: { text: message },
        replyTo: EMAIL_CONFIG.replyTo,
    });
}

// New email functions for different scenarios

export async function sendCampaignUpdate({
    recipients,
    campaignName,
    updateMessage,
    updateType = 'general',
}: {
    recipients: EmailRecipient[];
    campaignName: string;
    updateMessage: string;
    updateType?: 'general' | 'urgent' | 'celebration';
}) {
    const typeEmoji = updateType === 'urgent' ? '🚨' : updateType === 'celebration' ? '🎉' : '📢';
    const subject = `${typeEmoji} Campaign Update: ${campaignName}`;

    const message = `Hello,

${updateMessage}

---
Campaign: ${campaignName}
Type: ${updateType}
Sent: ${new Date().toLocaleDateString()}

Pitch In List`;

    return sendEmail({
        to: recipients.map(r => r.email),
        subject,
        template: { text: message },
    });
}

export async function sendWelcomeEmail({
    recipient,
    campaignName,
}: {
    recipient: EmailRecipient;
    campaignName?: string;
}) {
    const subject = campaignName 
        ? `🎄 Welcome to ${campaignName} - Pitch In List`
        : "🎄 Welcome to Pitch In List";

    const message = `Hi ${recipient.name || 'there'},

Welcome to Pitch In List${campaignName ? ` and the ${campaignName} campaign!` : '!'}

We're excited to have you participate in making the holidays brighter for local families. Here's how to get started:

1. Browse available gifts on our website
2. Select items you'd like to donate
3. Complete the claim form
4. Deliver your items by the deadline

Thank you for your generosity!

If you have any questions, please reply to this email.

---
Pitch In List
${campaignName ? `Campaign: ${campaignName}` : ''}`;

    return sendEmail({
        to: recipient.email,
        subject,
        template: { text: message },
    });
}

export async function sendCampaignCompletion({
    adminEmail,
    campaignName,
    totalFamilies,
    totalGifts,
    totalClaims,
}: {
    adminEmail: string;
    campaignName: string;
    totalFamilies: number;
    totalGifts: number;
    totalClaims: number;
}) {
    const message = `Great news! The ${campaignName} campaign has been completed.

📊 Campaign Summary:
• Families served: ${totalFamilies}
• Total gifts listed: ${totalGifts}
• Items claimed: ${totalClaims}
• Completion rate: ${Math.round((totalClaims / totalGifts) * 100)}%

The campaign is now ready for archival. You can view detailed reports in the admin dashboard.

---
Pitch In List Admin System`;

    return sendAdminNotification({
        subject: "Campaign Completion Report",
        message,
        campaignName,
        priority: 'normal',
        adminEmail,
    });
}

// Email validation helper
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Batch email sending for large lists
export async function sendBatchEmails({
    recipients,
    subject,
    template,
    batchSize = 50,
    delayBetweenBatches = 1000, // milliseconds
}: {
    recipients: EmailRecipient[];
    subject: string;
    template: EmailTemplate;
    batchSize?: number;
    delayBetweenBatches?: number;
}) {
    const results = [];
    
    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        const batchPromises = batch.map(recipient =>
            sendEmail({
                to: recipient.email,
                subject,
                template,
            }).catch(error => ({
                email: recipient.email,
                error: error.message,
                success: false
            }))
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Add delay between batches to avoid rate limiting
        if (i + batchSize < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
    }
    
    return results;
}
