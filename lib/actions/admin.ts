"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sendAdminNotification, sendDonorReminder } from "@/lib/email";
import { getAvailableQuantity, CampaignStatus } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";

// ============================================
// AUTH HELPER
// ============================================

async function requireAuth() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized: Admin access required");
    }
    
    // Check if user is the admin
    const adminUserId = process.env.ADMIN_USER_ID;
    if (!adminUserId) {
        throw new Error("Server configuration error: Admin user ID not set");
    }
    
    if (userId !== adminUserId) {
        console.warn(`Unauthorized admin access attempt by user: ${userId}`);
        throw new Error("Access denied: Admin privileges required");
    }
    
    return userId;
}

// ============================================
// CAMPAIGN MANAGEMENT
// ============================================

export async function updateCampaignSettings(
    campaignId: string,
    settings: {
        dropOffAddress?: string;
        dropOffDeadline?: Date;
        startsAt?: Date;
        endsAt?: Date;
        status?: CampaignStatus;
    }
) {
    try {
        await requireAuth();

        // Validate dates
        if (settings.startsAt && settings.endsAt) {
            if (settings.startsAt >= settings.endsAt) {
                throw new Error("Start date must be before end date");
            }
        }

        if (settings.dropOffDeadline && settings.endsAt) {
            if (settings.dropOffDeadline > settings.endsAt) {
                throw new Error("Drop-off deadline cannot be after campaign end date");
            }
        }

        const campaign = await db.campaign.update({
            where: { id: campaignId },
            data: {
                ...settings,
                updatedAt: new Date(),
            },
        });

        revalidatePath("/admin");
        revalidatePath(`/admin/campaigns/${campaignId}`);
        revalidatePath("/");

        return {
            success: true,
            campaign,
            message: "Campaign settings updated successfully",
        };
    } catch (error) {
        console.error("Error updating campaign settings:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update campaign",
        };
    }
}

// ============================================
// CAMPAIGN SUMMARY
// ============================================

export async function sendCampaignSummary(campaignId: string) {
    try {
        await requireAuth();

        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                families: {
                    include: {
                        gifts: {
                            include: {
                                claims: true,
                                person: true,
                            },
                        },
                        persons: true,
                    },
                },
            },
        });

        if (!campaign) {
            throw new Error("Campaign not found");
        }

        // Calculate statistics
        const totalGifts = campaign.families.flatMap((f) => f.gifts).length;
        const totalQuantity = campaign.families
            .flatMap((f) => f.gifts)
            .reduce((sum, gift) => sum + gift.quantity, 0);
        const claimedQuantity = campaign.families
            .flatMap((f) => f.gifts)
            .reduce(
                (sum, gift) =>
                    sum + gift.claims.reduce((claimSum, claim) => claimSum + claim.quantity, 0),
                0
            );
        const totalFamilies = campaign.families.length;
        const fullyAdoptedFamilies = campaign.families.filter((f) =>
            f.gifts.every((g) => getAvailableQuantity(g) === 0)
        ).length;
        const partiallyAdoptedFamilies = campaign.families.filter(
            (f) =>
                f.gifts.some((g) => getAvailableQuantity(g) === 0) &&
                f.gifts.some((g) => getAvailableQuantity(g) > 0)
        ).length;
        const unadoptedFamilies =
            totalFamilies - fullyAdoptedFamilies - partiallyAdoptedFamilies;

        // Get unique donors
        const uniqueDonors = new Set(
            campaign.families.flatMap((f) => f.gifts.flatMap((g) => g.claims.map((c) => c.donorEmail)))
        ).size;

        // Recent activity (last 10 claims)
        const recentClaims = campaign.families
            .flatMap((family) =>
                family.gifts.flatMap((gift) =>
                    gift.claims.map((claim) => ({
                        claim,
                        giftName: gift.name,
                        familyAlias: family.alias,
                        personName: gift.person?.firstName,
                    }))
                )
            )
            .sort((a, b) => b.claim.createdAt.getTime() - a.claim.createdAt.getTime())
            .slice(0, 10);

        // Families needing attention (less than 30% claimed)
        const needsAttention = campaign.families
            .map((family) => {
                const familyTotal = family.gifts.reduce((sum, g) => sum + g.quantity, 0);
                const familyClaimed = family.gifts.reduce(
                    (sum, g) =>
                        sum + g.claims.reduce((cs, c) => cs + c.quantity, 0),
                    0
                );
                const percent = familyTotal > 0 ? (familyClaimed / familyTotal) * 100 : 0;
                return { family, percent };
            })
            .filter((f) => f.percent < 30)
            .sort((a, b) => a.percent - b.percent);

        const summary = `
Campaign Summary for ${campaign.name}
Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

📊 OVERALL PROGRESS
═══════════════════════════════════════
• Gifts: ${claimedQuantity}/${totalQuantity} claimed (${Math.round((claimedQuantity / totalQuantity) * 100)}%)
• Unique gift items: ${totalGifts}
• Families: ${fullyAdoptedFamilies} fully adopted, ${partiallyAdoptedFamilies} partial, ${unadoptedFamilies} none
• Unique donors: ${uniqueDonors}

👥 FAMILY STATUS
═══════════════════════════════════════
✅ Fully Adopted: ${fullyAdoptedFamilies}/${totalFamilies} (${Math.round((fullyAdoptedFamilies / totalFamilies) * 100)}%)
🔄 Partially Adopted: ${partiallyAdoptedFamilies}/${totalFamilies}
❌ Not Yet Adopted: ${unadoptedFamilies}/${totalFamilies}

🎁 RECENT ACTIVITY
═══════════════════════════════════════
${recentClaims.length > 0 ? recentClaims.map(({ claim, giftName, familyAlias, personName }) => 
    `• ${claim.donorName} claimed ${claim.quantity}x ${giftName}${personName ? ` for ${personName}` : ''} (${familyAlias}) - ${new Date(claim.createdAt).toLocaleDateString()}`
).join('\n') : '• No recent activity'}

⚠️ FAMILIES NEEDING ATTENTION (<30% claimed)
═══════════════════════════════════════
${needsAttention.length > 0 ? needsAttention.slice(0, 5).map(({ family, percent }) => 
    `• ${family.alias}: ${Math.round(percent)}% claimed`
).join('\n') : '• All families are doing well!'}

📅 CAMPAIGN DETAILS
═══════════════════════════════════════
• Status: ${campaign.status}
• Drop-off deadline: ${campaign.dropOffDeadline ? campaign.dropOffDeadline.toLocaleDateString() : 'Not set'}
• Drop-off location: ${campaign.dropOffAddress || 'Not set'}
        `.trim();

        await sendAdminNotification({
            adminEmail: process.env.ADMIN_EMAIL || "test@example.com",
            subject: "Campaign Summary Report",
            message: summary,
            campaignName: campaign.name,
        });

        return {
            success: true,
            stats: {
                totalGifts,
                totalQuantity,
                claimedQuantity,
                totalFamilies,
                fullyAdoptedFamilies,
                partiallyAdoptedFamilies,
                unadoptedFamilies,
                uniqueDonors,
            },
        };
    } catch (error) {
        console.error("Error sending campaign summary:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to send summary",
        };
    }
}

// ============================================
// DONOR REMINDERS
// ============================================

export async function sendDeadlineReminders(
    campaignId: string,
    daysBeforeDeadline?: number
) {
    try {
        await requireAuth();

        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                families: {
                    include: {
                        gifts: {
                            include: {
                                claims: true,
                            },
                        },
                    },
                },
            },
        });

        if (!campaign || !campaign.dropOffDeadline) {
            throw new Error("Campaign not found or no deadline set");
        }

        const daysUntilDeadline = Math.ceil(
            (campaign.dropOffDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        // If daysBeforeDeadline is specified, only send if we're at that threshold
        if (daysBeforeDeadline && daysUntilDeadline !== daysBeforeDeadline) {
            return {
                success: false,
                message: `Current days until deadline: ${daysUntilDeadline}. Only sending reminders at ${daysBeforeDeadline} days.`,
            };
        }

        // Default behavior: send reminders 7, 3, and 1 day(s) before deadline
        if (!daysBeforeDeadline && ![7, 3, 1].includes(daysUntilDeadline)) {
            return {
                success: false,
                message: `No reminders scheduled for ${daysUntilDeadline} days before deadline`,
            };
        }

        if (daysUntilDeadline < 0) {
            return {
                success: false,
                message: "Deadline has passed",
            };
        }

        // Group claims by donor to avoid duplicate emails
        const donorClaims = new Map<
            string,
            {
                name: string;
                email: string;
                items: { name: string; quantity: number; familyAlias: string }[];
            }
        >();

        campaign.families.forEach((family) => {
            family.gifts.forEach((gift) => {
                gift.claims.forEach((claim) => {
                    const key = claim.donorEmail.toLowerCase();
                    if (!donorClaims.has(key)) {
                        donorClaims.set(key, {
                            name: claim.donorName,
                            email: claim.donorEmail,
                            items: [],
                        });
                    }
                    donorClaims.get(key)!.items.push({
                        name: gift.name,
                        quantity: claim.quantity,
                        familyAlias: family.alias,
                    });
                });
            });
        });

        // Send reminders
        const reminderPromises = Array.from(donorClaims.values()).map((donor) =>
            sendDonorReminder({
                donorEmail: donor.email,
                donorName: donor.name,
                items: donor.items,
                dropOffAddress: campaign.dropOffAddress || undefined,
                dropOffDeadline: campaign.dropOffDeadline || undefined,
                daysUntilDeadline,
            })
        );

        const results = await Promise.allSettled(reminderPromises);
        const successful = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;

        // Log failures
        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(
                    `Failed to send reminder to ${Array.from(donorClaims.values())[index].email}:`,
                    result.reason
                );
            }
        });

        await sendAdminNotification({
            adminEmail: process.env.ADMIN_EMAIL || "test@example.com",
            subject: `Reminder emails sent (${daysUntilDeadline} days until deadline)`,
            message: `Sent ${successful} reminder emails${failed > 0 ? ` (${failed} failed)` : ""} for ${campaign.name}.\n\nDeadline: ${campaign.dropOffDeadline.toLocaleDateString()}\nDays remaining: ${daysUntilDeadline}\nUnique donors: ${donorClaims.size}`,
            campaignName: campaign.name,
        });

        return {
            success: true,
            sent: successful,
            failed,
            daysUntilDeadline,
            totalDonors: donorClaims.size,
            message: `Sent ${successful} reminders to donors`,
        };
    } catch (error) {
        console.error("Error sending deadline reminders:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to send reminders",
        };
    }
}

// ============================================
// SEND REMINDERS TO ALL DONORS
// ============================================

export async function sendRemindersToAllDonors(campaignId: string) {
    try {
        await requireAuth();

        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                families: {
                    include: {
                        gifts: {
                            include: {
                                claims: true,
                            },
                        },
                    },
                },
            },
        });

        if (!campaign) {
            throw new Error("Campaign not found");
        }

        // Group claims by donor to avoid duplicate emails
        const donorClaims = new Map<
            string,
            {
                name: string;
                email: string;
                items: { name: string; quantity: number; familyAlias: string }[];
            }
        >();

        campaign.families.forEach((family) => {
            family.gifts.forEach((gift) => {
                gift.claims.forEach((claim) => {
                    const key = claim.donorEmail.toLowerCase();
                    if (!donorClaims.has(key)) {
                        donorClaims.set(key, {
                            name: claim.donorName,
                            email: claim.donorEmail,
                            items: [],
                        });
                    }
                    donorClaims.get(key)!.items.push({
                        name: gift.name,
                        quantity: claim.quantity,
                        familyAlias: family.alias,
                    });
                });
            });
        });

        if (donorClaims.size === 0) {
            return {
                success: false,
                message: "No donors found for this campaign",
            };
        }

        // Calculate days until deadline if available
        let daysUntilDeadline = 0;
        if (campaign.dropOffDeadline) {
            daysUntilDeadline = Math.ceil(
                (campaign.dropOffDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
        }

        // Send reminders to all donors
        const reminderPromises = Array.from(donorClaims.values()).map((donor) =>
            sendDonorReminder({
                donorEmail: donor.email,
                donorName: donor.name,
                items: donor.items,
                dropOffAddress: campaign.dropOffAddress || undefined,
                dropOffDeadline: campaign.dropOffDeadline || undefined,
                daysUntilDeadline,
                campaignName: campaign.name,
            })
        );

        const results = await Promise.allSettled(reminderPromises);
        const successful = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;

        // Log failures
        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(
                    `Failed to send reminder to ${Array.from(donorClaims.values())[index].email}:`,
                    result.reason
                );
            }
        });

        await sendAdminNotification({
            adminEmail: process.env.ADMIN_EMAIL || "test@example.com",
            subject: `Bulk reminder emails sent (${donorClaims.size} donors)`,
            message: `Sent ${successful} reminder emails${failed > 0 ? ` (${failed} failed)` : ""} for ${campaign.name}.\n\n${campaign.dropOffDeadline ? `Deadline: ${campaign.dropOffDeadline.toLocaleDateString()}\nDays remaining: ${daysUntilDeadline}` : 'No deadline set'}\nUnique donors: ${donorClaims.size}`,
            campaignName: campaign.name,
        });

        return {
            success: true,
            sent: successful,
            failed,
            totalDonors: donorClaims.size,
            message: `Sent ${successful} reminders to donors`,
        };
    } catch (error) {
        console.error("Error sending reminders to all donors:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to send reminders",
        };
    }
}

// ============================================
// LOW AVAILABILITY ALERTS
// ============================================

export async function checkLowAvailability(
    campaignId: string,
    threshold: number = 2
) {
    try {
        await requireAuth();

        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                families: {
                    include: {
                        gifts: {
                            include: {
                                claims: true,
                                person: true,
                            },
                        },
                    },
                },
            },
        });

        if (!campaign) {
            throw new Error("Campaign not found");
        }

        const lowAvailabilityGifts = campaign.families
            .flatMap((family) =>
                family.gifts.map((gift) => ({
                    ...gift,
                    familyAlias: family.alias,
                }))
            )
            .filter((gift) => {
                const available = getAvailableQuantity(gift);
                return available > 0 && available <= threshold;
            })
            .map((gift) => ({
                name: gift.name,
                familyAlias: gift.familyAlias,
                personName: gift.person?.firstName,
                available: getAvailableQuantity(gift),
                total: gift.quantity,
            }))
            .sort((a, b) => a.available - b.available);

        if (lowAvailabilityGifts.length > 0) {
            const alertMessage = `
Low Availability Alert for ${campaign.name}

The following gifts are running low (${threshold} or fewer remaining):

${lowAvailabilityGifts.map((gift) => 
    `• ${gift.name}${gift.personName ? ` for ${gift.personName}` : ''} (${gift.familyAlias}): ${gift.available}/${gift.total} remaining`
).join("\n")}

💡 SUGGESTIONS:
• Promote these items to donors via email or social media
• Consider highlighting them on the donation page
• Reach out to past donors who might be interested

Total items needing attention: ${lowAvailabilityGifts.length}
            `.trim();

            await sendAdminNotification({
                adminEmail: process.env.ADMIN_EMAIL || "test@example.com",
                subject: `⚠️ Low gift availability alert (${lowAvailabilityGifts.length} items)`,
                message: alertMessage,
                campaignName: campaign.name,
            });
        }

        return {
            success: true,
            lowAvailabilityCount: lowAvailabilityGifts.length,
            gifts: lowAvailabilityGifts,
            message:
                lowAvailabilityGifts.length > 0
                    ? `Found ${lowAvailabilityGifts.length} items with low availability`
                    : "No items with low availability",
        };
    } catch (error) {
        console.error("Error checking low availability:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to check availability",
        };
    }
}

// ============================================
// EXPORT CAMPAIGN DATA
// ============================================

export async function exportCampaignData(campaignId: string) {
    try {
        await requireAuth();

        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                families: {
                    include: {
                        persons: true,
                        gifts: {
                            include: {
                                claims: true,
                                person: true,
                            },
                        },
                    },
                },
            },
        });

        if (!campaign) {
            throw new Error("Campaign not found");
        }

        // Prepare donor data
        const donorData: Array<{
            donorName: string;
            donorEmail: string;
            familyAlias: string;
            personName: string;
            giftName: string;
            quantity: number;
            claimedDate: string;
        }> = [];

        campaign.families.forEach((family) => {
            family.gifts.forEach((gift) => {
                gift.claims.forEach((claim) => {
                    donorData.push({
                        donorName: claim.donorName,
                        donorEmail: claim.donorEmail,
                        familyAlias: family.alias,
                        personName: gift.person?.firstName || "Family",
                        giftName: gift.name,
                        quantity: claim.quantity,
                        claimedDate: claim.createdAt.toLocaleDateString(),
                    });
                });
            });
        });

        // Prepare family data
        const familyData = campaign.families.map((family) => {
            const totalGifts = family.gifts.reduce((sum, g) => sum + g.quantity, 0);
            const claimedGifts = family.gifts.reduce(
                (sum, g) =>
                    sum + g.claims.reduce((cs, c) => cs + c.quantity, 0),
                0
            );

            return {
                alias: family.alias,
                members: family.persons.length,
                totalGifts,
                claimedGifts,
                percentComplete: totalGifts > 0 ? Math.round((claimedGifts / totalGifts) * 100) : 0,
                status:
                    claimedGifts === 0
                        ? "Unadopted"
                        : claimedGifts === totalGifts
                        ? "Fully Adopted"
                        : "Partially Adopted",
            };
        });

        return {
            success: true,
            campaignName: campaign.name,
            exportDate: new Date().toISOString(),
            donorData,
            familyData,
            summary: {
                totalDonors: new Set(donorData.map((d) => d.donorEmail)).size,
                totalClaims: donorData.length,
                totalFamilies: familyData.length,
                fullyAdoptedFamilies: familyData.filter(
                    (f) => f.status === "Fully Adopted"
                ).length,
            },
        };
    } catch (error) {
        console.error("Error exporting campaign data:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to export data",
        };
    }
}

// ============================================
// BULK DELETE CLAIMS (Admin safety feature)
// ============================================

export async function bulkDeleteClaims(
    campaignId: string,
    donorEmail: string
) {
    try {
        await requireAuth();

        const email = donorEmail.toLowerCase().trim();

        const result = await db.claim.deleteMany({
            where: {
                donorEmail: {
                    equals: email,
                    mode: "insensitive",
                },
                gift: {
                    family: {
                        campaignId,
                    },
                },
            },
        });

        revalidatePath("/admin");
        revalidatePath(`/admin/campaigns/${campaignId}`);
        revalidatePath("/");

        console.log(
            `[ADMIN] Bulk deleted ${result.count} claims for ${email} in campaign ${campaignId}`
        );

        return {
            success: true,
            deletedCount: result.count,
            message: `Deleted ${result.count} claims for ${email}`,
        };
    } catch (error) {
        console.error("Error bulk deleting claims:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete claims",
        };
    }
}