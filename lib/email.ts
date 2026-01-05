import { Resend } from "resend";
import ClaimConfirmationEmail from "@/components/emails/claim-confirmation";
import React from "react";

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const DEFAULT_DROP_OFF_ADDRESS = "624 Ellington Court, Fox River Grove, IL 60021";

export async function sendClaimConfirmation({
    donorName,
    donorEmail,
    items,
    dropOffAddress,
    dropOffDeadline,
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
}) {
    if (!resend) {
        console.warn("Resend API key not found. Email not sent.");
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: "Pitch In List <onboarding@resend.dev>", // Use Resend's default domain
            to: [donorEmail],
            subject: `🎁 Gift Claim Confirmation - Pitch In List`,
            react: React.createElement(ClaimConfirmationEmail, {
                donorName,
                items,
                dropOffAddress: dropOffAddress || DEFAULT_DROP_OFF_ADDRESS,
                dropOffDeadline: dropOffDeadline,
            }),
        });

        if (error) {
            console.error("Error sending email:", error);
            // We don't throw here to prevent the UI from breaking if email fails
            return { error };
        }

        return { data };
    } catch (err) {
        console.error("Failed to send confirmation email:", err);
        return { error: err };
    }
}

export async function sendAdminNotification({
    adminEmail,
    subject,
    message,
    campaignName,
}: {
    adminEmail: string;
    subject: string;
    message: string;
    campaignName?: string;
}) {
    if (!resend) {
        console.warn("Resend API key not found. Admin notification not sent.");
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: "Pitch In List <onboarding@resend.dev>",
            to: [adminEmail],
            subject: `${campaignName ? `[${campaignName}] ` : ""}${subject}`,
            text: message,
        });

        if (error) {
            console.error("Error sending admin notification:", error);
            return { error };
        }

        return { data };
    } catch (err) {
        console.error("Failed to send admin notification:", err);
        return { error: err };
    }
}

export async function sendDonorReminder({
    donorEmail,
    donorName,
    items,
    dropOffAddress,
    dropOffDeadline,
    daysUntilDeadline,
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
}) {
    if (!resend) {
        console.warn("Resend API key not found. Donor reminder not sent.");
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: "Pitch In List <onboarding@resend.dev>",
            to: [donorEmail],
            subject: daysUntilDeadline <= 3 
                ? `🎅 Reminder: Drop-off deadline in ${daysUntilDeadline} days!`
                : `🎁 Friendly Reminder: Your Pitch In List donation`,
            text: `Hi ${donorName},\n\nThis is a friendly reminder that your drop-off deadline is ${daysUntilDeadline} days away.\n\nYour claimed items:\n${items.map(item => `- ${item.quantity}x ${item.name} (for ${item.familyAlias})`).join('\n')}\n\nDrop-off location: ${dropOffAddress || DEFAULT_DROP_OFF_ADDRESS}\nDeadline: ${dropOffDeadline ? dropOffDeadline.toLocaleDateString() : 'TBD'}\n\nThank you for making the holidays brighter for local families!\n\nIf you have any questions, please reply to this email.`,
        });

        if (error) {
            console.error("Error sending donor reminder:", error);
            return { error };
        }

        return { data };
    } catch (err) {
        console.error("Failed to send donor reminder:", err);
        return { error: err };
    }
}
