import { getSettings } from "@/lib/actions/settings";
import { getEmailTemplate, renderTemplate } from "@/lib/actions/email-templates";
import { EmailTemplateType } from "@/lib/email-template-types";
import { 
    sendEmail, 
    sendAdminNotification as sendAdminNotificationEmail, 
    sendDonorReminder as sendDonorReminderEmail,
    sendCampaignUpdate as sendCampaignUpdateEmail,
    sendWelcomeEmail as sendWelcomeEmailEmail,
    sendCampaignCompletion as sendCampaignCompletionEmail,
    sendBatchEmails as sendBatchEmailsEmail,
    sendClaimConfirmation as sendClaimConfirmationEmail,
    validateEmail,
    EMAIL_CONFIG,
    EmailError
} from "@/lib/email";

export class EmailService {
    private static instance: EmailService;
    private settingsCache: any = null;
    private cacheExpiry = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    private async getSettings() {
        const now = Date.now();
        if (!this.settingsCache || now > this.cacheExpiry) {
            this.settingsCache = await getSettings();
            this.cacheExpiry = now + this.CACHE_DURATION;
        }
        return this.settingsCache;
    }

    async sendClaimConfirmation(params: {
        donorName: string;
        donorEmail: string;
        items: Array<{
            name: string;
            quantity: number;
            familyAlias: string;
        }>;
        dropOffAddress?: string;
        dropOffDeadline?: Date;
        campaignName?: string;
    }) {
        const settings = await this.getSettings();
        
        if (!settings.emailNotifications) {
            console.log("Email notifications disabled - skipping claim confirmation");
            return { success: false, reason: "Email notifications disabled" };
        }

        // Validate email
        if (!validateEmail(params.donorEmail)) {
            throw new EmailError("Invalid donor email address", "INVALID_EMAIL");
        }

        try {
            // Try to get dynamic template first
            const template = await getEmailTemplate(EmailTemplateType.CLAIM_CONFIRMATION);
            
            if (template && template.isActive) {
                // Use dynamic template
                const variables = {
                    donorName: params.donorName,
                    campaignName: params.campaignName || "Pitch In List",
                    items: params.items,
                    dropOffAddress: params.dropOffAddress || EMAIL_CONFIG.defaultDropOffAddress,
                    dropOffDeadline: params.dropOffDeadline?.toLocaleDateString() || "TBD"
                };

                const subject = await renderTemplate(template.subject, variables);
                const htmlContent = template.htmlContent ? await renderTemplate(template.htmlContent, variables) : undefined;
                const textContent = template.textContent ? await renderTemplate(template.textContent, variables) : undefined;

                return await sendEmail({
                    to: params.donorEmail,
                    subject,
                    template: {
                        html: htmlContent,
                        text: textContent
                    },
                    replyTo: EMAIL_CONFIG.replyTo,
                });
            } else {
                // Fallback to original implementation
                return await sendClaimConfirmationEmail(params);
            }
        } catch (error) {
            console.error("Failed to send claim confirmation:", error);
            
            // Send error notification to admin
            await this.sendAdminErrorNotification("Claim Confirmation Failed", 
                `Failed to send claim confirmation to ${params.donorEmail}: ${error}`);
            
            throw error;
        }
    }

    async sendAdminNotification(params: {
        subject: string;
        message: string;
        campaignName?: string;
        priority?: 'low' | 'normal' | 'high';
    }) {
        const settings = await this.getSettings();
        
        if (!settings.emailNotifications) {
            console.log("Email notifications disabled - skipping admin notification");
            return { success: false, reason: "Email notifications disabled" };
        }

        return sendAdminNotificationEmail({
            ...params,
            adminEmail: EMAIL_CONFIG.adminEmail,
        });
    }

    async sendDonorReminder(params: {
        donorEmail: string;
        donorName: string;
        items: Array<{
            name: string;
            quantity: number;
            familyAlias: string;
        }>;
        dropOffAddress?: string;
        dropOffDeadline?: Date;
        daysUntilDeadline: number;
        campaignName?: string;
    }) {
        const settings = await this.getSettings();
        
        if (!settings.emailNotifications) {
            console.log("Email notifications disabled - skipping donor reminder");
            return { success: false, reason: "Email notifications disabled" };
        }

        // Validate email
        if (!validateEmail(params.donorEmail)) {
            throw new EmailError("Invalid donor email address", "INVALID_EMAIL");
        }

        try {
            // Try to get dynamic template first
            const template = await getEmailTemplate(EmailTemplateType.DONOR_REMINDER);
            
            if (template && template.isActive) {
                // Use dynamic template
                const urgencyLevel = params.daysUntilDeadline <= 3 ? 'high' : params.daysUntilDeadline <= 7 ? 'medium' : 'low';
                const urgencyEmoji = urgencyLevel === 'high' ? '🎅' : urgencyLevel === 'medium' ? '⏰' : '🎁';
                const dropOffDate = params.dropOffDeadline ? params.dropOffDeadline.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                }) : 'December 19th';

                const variables = {
                    donorName: params.donorName,
                    items: params.items,
                    dropOffAddress: params.dropOffAddress || EMAIL_CONFIG.defaultDropOffAddress,
                    dropOffDate,
                    campaignName: params.campaignName || '',
                    urgencyEmoji,
                    isUrgent: urgencyLevel === 'high'
                };

                const subject = await renderTemplate(template.subject, variables);
                const htmlContent = template.htmlContent ? await renderTemplate(template.htmlContent, variables) : undefined;
                const textContent = template.textContent ? await renderTemplate(template.textContent, variables) : undefined;

                return await sendEmail({
                    to: params.donorEmail,
                    subject: params.campaignName ? `${subject} - ${params.campaignName}` : subject,
                    template: {
                        html: htmlContent,
                        text: textContent
                    },
                    replyTo: EMAIL_CONFIG.replyTo,
                });
            } else {
                // Fallback to original implementation
                return await sendDonorReminderEmail(params);
            }
        } catch (error) {
            console.error("Failed to send donor reminder:", error);
            throw error;
        }
    }

    async sendCampaignUpdate(params: {
        recipients: Array<{ email: string; name?: string }>;
        campaignName: string;
        updateMessage: string;
        updateType?: 'general' | 'urgent' | 'celebration';
    }) {
        const settings = await this.getSettings();
        
        if (!settings.emailNotifications) {
            console.log("Email notifications disabled - skipping campaign update");
            return { success: false, reason: "Email notifications disabled" };
        }

        // Validate all emails
        const invalidEmails = params.recipients.filter(r => !validateEmail(r.email));
        if (invalidEmails.length > 0) {
            throw new EmailError(
                `Invalid email addresses: ${invalidEmails.map(e => e.email).join(', ')}`,
                "INVALID_EMAILS"
            );
        }

        try {
            return await sendCampaignUpdateEmail(params);
        } catch (error) {
            console.error("Failed to send campaign update:", error);
            throw error;
        }
    }

    async sendWelcomeEmail(params: {
        recipient: { email: string; name?: string };
        campaignName?: string;
    }) {
        const settings = await this.getSettings();
        
        if (!settings.emailNotifications) {
            console.log("Email notifications disabled - skipping welcome email");
            return { success: false, reason: "Email notifications disabled" };
        }

        // Validate email
        if (!validateEmail(params.recipient.email)) {
            throw new EmailError("Invalid recipient email address", "INVALID_EMAIL");
        }

        try {
            // Try to get dynamic template first
            const template = await getEmailTemplate(EmailTemplateType.WELCOME_EMAIL);
            
            if (template && template.isActive) {
                // Use dynamic template
                const variables = {
                    recipientName: params.recipient.name || 'there',
                    campaignName: params.campaignName || ''
                };

                const subject = await renderTemplate(template.subject, variables);
                const htmlContent = template.htmlContent ? await renderTemplate(template.htmlContent, variables) : undefined;
                const textContent = template.textContent ? await renderTemplate(template.textContent, variables) : undefined;

                return await sendEmail({
                    to: params.recipient.email,
                    subject,
                    template: {
                        html: htmlContent,
                        text: textContent
                    },
                });
            } else {
                // Fallback to original implementation
                return await sendWelcomeEmailEmail(params);
            }
        } catch (error) {
            console.error("Failed to send welcome email:", error);
            throw error;
        }
    }

    async sendCampaignCompletion(params: {
        campaignName: string;
        totalFamilies: number;
        totalGifts: number;
        totalClaims: number;
    }) {
        const settings = await this.getSettings();
        
        if (!settings.emailNotifications) {
            console.log("Email notifications disabled - skipping campaign completion");
            return { success: false, reason: "Email notifications disabled" };
        }

        try {
            // Try to get dynamic template first
            const template = await getEmailTemplate(EmailTemplateType.CAMPAIGN_COMPLETION);
            
            if (template && template.isActive) {
                // Use dynamic template
                const completionRate = Math.round((params.totalClaims / params.totalGifts) * 100);
                const variables = {
                    campaignName: params.campaignName,
                    totalFamilies: params.totalFamilies,
                    totalGifts: params.totalGifts,
                    totalClaims: params.totalClaims,
                    completionRate
                };

                const subject = await renderTemplate(template.subject, variables);
                const htmlContent = template.htmlContent ? await renderTemplate(template.htmlContent, variables) : undefined;
                const textContent = template.textContent ? await renderTemplate(template.textContent, variables) : undefined;

                return await sendEmail({
                    to: EMAIL_CONFIG.adminEmail,
                    subject,
                    template: {
                        html: htmlContent,
                        text: textContent
                    },
                });
            } else {
                // Fallback to original implementation
                return await sendCampaignCompletionEmail({
                    ...params,
                    adminEmail: EMAIL_CONFIG.adminEmail,
                });
            }
        } catch (error) {
            console.error("Failed to send campaign completion:", error);
            throw error;
        }
    }

    async sendBatchEmails(params: {
        recipients: Array<{ email: string; name?: string }>;
        subject: string;
        template: {
            text?: string;
            html?: string;
        };
        batchSize?: number;
        delayBetweenBatches?: number;
    }) {
        const settings = await this.getSettings();
        
        if (!settings.emailNotifications) {
            console.log("Email notifications disabled - skipping batch emails");
            return { success: false, reason: "Email notifications disabled" };
        }

        // Validate all emails
        const invalidEmails = params.recipients.filter(r => !validateEmail(r.email));
        if (invalidEmails.length > 0) {
            throw new EmailError(
                `Invalid email addresses: ${invalidEmails.map(e => e.email).join(', ')}`,
                "INVALID_EMAILS"
            );
        }

        try {
            return await sendBatchEmailsEmail(params);
        } catch (error) {
            console.error("Failed to send batch emails:", error);
            throw error;
        }
    }

    async sendTestEmail(email: string) {
        if (!validateEmail(email)) {
            throw new EmailError("Invalid email address", "INVALID_EMAIL");
        }

        const settings = await this.getSettings();
        
        if (!settings.emailNotifications) {
            throw new EmailError("Email notifications are disabled", "NOTIFICATIONS_DISABLED");
        }

        return sendEmail({
            to: email,
            subject: "🧪 Test Email - Pitch In List",
            template: {
                text: `This is a test email from Pitch In List.

If you received this email, your email configuration is working correctly!

Settings status:
• Email notifications: ${settings.emailNotifications ? 'Enabled' : 'Disabled'}
• Auto-archive campaigns: ${settings.autoArchiveCampaigns ? 'Enabled' : 'Disabled'}
• Automatic backups: ${settings.automaticBackups ? 'Enabled' : 'Disabled'}
• Two-factor auth: ${settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
• Admin registration: ${settings.allowAdminRegistration ? 'Enabled' : 'Disabled'}

Sent at: ${new Date().toISOString()}

---
Pitch In List Email System`,
            },
        });
    }

    private async sendAdminErrorNotification(subject: string, message: string) {
        try {
            await sendAdminNotificationEmail({
                subject: `🚨 Email System Error: ${subject}`,
                message,
                priority: 'high',
            });
        } catch (error) {
            console.error("Failed to send admin error notification:", error);
        }
    }

    async getEmailConfigurationStatus() {
        const settings = await this.getSettings();
        const hasApiKey = !!process.env.RESEND_API_KEY;
        const hasFromEmail = !!process.env.EMAIL_FROM;
        const hasReplyTo = !!process.env.EMAIL_REPLY_TO;
        const hasAdminEmail = !!process.env.ADMIN_EMAIL;

        return {
            configured: hasApiKey && hasFromEmail,
            apiKey: hasApiKey,
            fromEmail: hasFromEmail,
            replyTo: hasReplyTo,
            adminEmail: hasAdminEmail,
            notificationsEnabled: settings.emailNotifications,
            resendConfigured: hasApiKey,
            testEmailAvailable: hasApiKey && settings.emailNotifications,
        };
    }

    clearCache() {
        this.settingsCache = null;
        this.cacheExpiry = 0;
    }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
