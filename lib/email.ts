import { Resend } from "resend";
import ClaimConfirmationEmail from "@/components/emails/claim-confirmation";
import React from "react";

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const DROP_OFF_ADDRESS = "624 Ellington Court, Fox River Grove, IL 60021";

export async function sendClaimConfirmation({
    donorName,
    donorEmail,
    items,
}: {
    donorName: string;
    donorEmail: string;
    items: {
        name: string;
        quantity: number;
        familyAlias: string;
    }[];
}) {
    if (!resend) {
        console.warn("Resend API key not found. Email not sent.");
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: "Adopt a Grover <donations@adoptagrover.com>", // This requires domain verification in Resend
            to: [donorEmail],
            subject: `🎁 Gift Claim Confirmation - Adopt a Grover`,
            react: React.createElement(ClaimConfirmationEmail, {
                donorName,
                items,
                dropOffAddress: DROP_OFF_ADDRESS,
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
