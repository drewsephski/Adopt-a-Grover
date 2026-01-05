"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CampaignStatus, OrganizationType } from "@prisma/client";
import type { CampaignWithFamilies } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";

// ============================================
// AUTH HELPER
// ============================================

async function requireAuth() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized: Admin access required");
    }
    return userId;
}

// ============================================
// VALIDATION HELPERS
// ============================================

function validateCampaignName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
}

function validateDates(startsAt?: Date | null, endsAt?: Date | null, dropOffDeadline?: Date | null): string[] {
    const errors: string[] = [];
    
    if (startsAt && endsAt && startsAt >= endsAt) {
        errors.push("Start date must be before end date");
    }
    
    if (dropOffDeadline && endsAt && dropOffDeadline > endsAt) {
        errors.push("Drop-off deadline cannot be after campaign end date");
    }
    
    if (startsAt && dropOffDeadline && startsAt > dropOffDeadline) {
        errors.push("Drop-off deadline cannot be before campaign start date");
    }
    
    return errors;
}

// ============================================
// CREATE CAMPAIGN
// ============================================
export async function createCampaign(name: string, organizationType: OrganizationType = "NONPROFIT") {
    try {
        await requireAuth();
        
        if (!validateCampaignName(name)) {
            throw new Error("Campaign name must be between 2 and 100 characters");
        }

        const campaign = await db.campaign.create({
            data: {
                name: name.trim(),
                organizationType,
            },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");

        return {
            success: true,
            campaign,
            message: "Campaign created successfully"
        };
    } catch (error) {
        console.error("Error creating campaign:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create campaign"
        };
    }
}

// ============================================
// UPDATE CAMPAIGN STATUS
// ============================================
export async function updateCampaignStatus(
    campaignId: string,
    status: CampaignStatus
) {
    try {
        await requireAuth();
        
        if (!campaignId || typeof campaignId !== "string") {
            throw new Error("Invalid campaign ID");
        }

        // If setting to ACTIVE, ensure no other campaign is active
        if (status === CampaignStatus.ACTIVE) {
            const existingActive = await db.campaign.findFirst({
                where: {
                    status: CampaignStatus.ACTIVE,
                    id: { not: campaignId },
                },
            });

            if (existingActive) {
                throw new Error(
                    `Cannot activate campaign. "${existingActive.name}" is already active. Please deactivate it first.`
                );
            }
        }

        const campaign = await db.campaign.update({
            where: { id: campaignId },
            data: { status, updatedAt: new Date() },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${campaignId}`);

        return {
            success: true,
            campaign,
            message: `Campaign status updated to ${status}`
        };
    } catch (error) {
        console.error("Error updating campaign status:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update campaign status"
        };
    }
}

// ============================================
// UPDATE CAMPAIGN
// ============================================
export async function updateCampaign(
    campaignId: string,
    data: {
        name?: string;
        startsAt?: Date | null;
        endsAt?: Date | null;
        status?: CampaignStatus;
        organizationType?: OrganizationType;
        dropOffAddress?: string | null;
        dropOffDeadline?: Date | null;
    }
) {
    try {
        await requireAuth();
        
        if (!campaignId || typeof campaignId !== "string") {
            throw new Error("Invalid campaign ID");
        }
        
        if (data.name && !validateCampaignName(data.name)) {
            throw new Error("Campaign name must be between 2 and 100 characters");
        }
        
        // Validate dates
        const dateErrors = validateDates(data.startsAt, data.endsAt, data.dropOffDeadline);
        if (dateErrors.length > 0) {
            throw new Error(dateErrors.join(", "));
        }

        // If setting to ACTIVE, ensure no other campaign is active
        if (data.status === CampaignStatus.ACTIVE) {
            const existingActive = await db.campaign.findFirst({
                where: {
                    status: CampaignStatus.ACTIVE,
                    id: { not: campaignId },
                },
            });

            if (existingActive) {
                throw new Error(
                    `Cannot activate campaign. "${existingActive.name}" is already active. Please deactivate it first.`
                );
            }
        }

        const campaign = await db.campaign.update({
            where: { id: campaignId },
            data: {
                ...data,
                name: data.name?.trim(),
                updatedAt: new Date(),
            },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${campaignId}`);

        return {
            success: true,
            campaign,
            message: "Campaign updated successfully"
        };
    } catch (error) {
        console.error("Error updating campaign:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update campaign"
        };
    }
}

// ============================================
// ARCHIVE CAMPAIGN
// ============================================
export async function archiveCampaign(campaignId: string) {
    try {
        await requireAuth();
        
        if (!campaignId || typeof campaignId !== "string") {
            throw new Error("Invalid campaign ID");
        }

        const campaign = await db.campaign.update({
            where: { id: campaignId },
            data: { 
                status: CampaignStatus.ARCHIVED,
                updatedAt: new Date()
            },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${campaignId}`);

        return {
            success: true,
            campaign,
            message: "Campaign archived successfully"
        };
    } catch (error) {
        console.error("Error archiving campaign:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to archive campaign"
        };
    }
}

// ============================================
// DELETE CAMPAIGN
// ============================================
export async function deleteCampaign(campaignId: string) {
    try {
        await requireAuth();
        
        if (!campaignId || typeof campaignId !== "string") {
            throw new Error("Invalid campaign ID");
        }
        
        // Check if campaign has any claims before allowing deletion
        const campaignWithClaims = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                families: {
                    include: {
                        gifts: {
                            include: {
                                claims: true
                            }
                        }
                    }
                }
            }
        });
        
        if (!campaignWithClaims) {
            throw new Error("Campaign not found");
        }
        
        const totalClaims = campaignWithClaims.families.flatMap((f) => 
            f.gifts.flatMap((g) => g.claims)
        ).length;
        
        if (totalClaims > 0) {
            throw new Error(`Cannot delete campaign with ${totalClaims} existing claims. Archive the campaign instead.`);
        }

        await db.campaign.delete({
            where: { id: campaignId },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${campaignId}`);

        return {
            success: true,
            message: "Campaign deleted successfully"
        };
    } catch (error) {
        console.error("Error deleting campaign:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete campaign"
        };
    }
}

// ============================================
// GET CAMPAIGNS
// ============================================
export async function getCampaigns() {
    try {
        return await db.campaign.findMany({
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
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        return [];
    }
}

// ============================================
// GET ACTIVE CAMPAIGN
// ============================================
export async function getActiveCampaign(): Promise<CampaignWithFamilies | null> {
    try {
        const campaign = await db.campaign.findFirst({
            where: { status: "ACTIVE" },
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

        if (!campaign) return null;

        // Return the campaign with families and items
        return campaign as CampaignWithFamilies;
    } catch (error) {
        console.error("Error fetching active campaign:", error);
        return null;
    }
}

// ============================================
// GET CAMPAIGN BY ID
// ============================================
export async function getCampaignById(campaignId: string) {
    try {
        if (!campaignId || typeof campaignId !== "string") {
            throw new Error("Invalid campaign ID");
        }
        
        return await db.campaign.findUnique({ 
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
    } catch (error) {
        console.error("Error fetching campaign by ID:", error);
        return null;
    }
}

// ============================================
// GET CAMPAIGN STATS
// ============================================
export async function getCampaignStats(campaignId: string) {
    try {
        if (!campaignId || typeof campaignId !== "string") {
            throw new Error("Invalid campaign ID");
        }
        
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
                        persons: true,
                    },
                },
            },
        });
        
        if (!campaign) {
            throw new Error("Campaign not found");
        }
        
        const totalFamilies = campaign.families.length;
        const totalGifts = campaign.families.flatMap((f) => f.gifts).length;
        const totalQuantity = campaign.families.flatMap((f) => f.gifts).reduce((sum, gift) => sum + gift.quantity, 0);
        const claimedQuantity = campaign.families
            .flatMap((f) => f.gifts)
            .reduce((sum, gift) => 
                sum + gift.claims.reduce((claimSum, claim) => claimSum + claim.quantity, 0), 0);
        const uniqueDonors = new Set(
            campaign.families.flatMap((f) => 
                f.gifts.flatMap((g) => g.claims.map((c) => c.donorEmail))
            )
        ).size;
        
        return {
            totalFamilies,
            totalGifts,
            totalQuantity,
            claimedQuantity,
            percentComplete: totalQuantity > 0 ? Math.round((claimedQuantity / totalQuantity) * 100) : 0,
            uniqueDonors,
        };
    } catch (error) {
        console.error("Error fetching campaign stats:", error);
        throw error;
    }
}
