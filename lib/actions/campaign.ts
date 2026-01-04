"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CampaignStatus } from "@/lib/types";

// ============================================
// CREATE CAMPAIGN
// ============================================
export async function createCampaign(name: string) {
    const campaign = await db.campaign.create({
        data: { name },
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return campaign;
}

// ============================================
// UPDATE CAMPAIGN STATUS
// ============================================
export async function updateCampaignStatus(
    campaignId: string,
    status: CampaignStatus
) {
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
        data: { status },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/families");
    revalidatePath(`/admin/campaigns/${campaignId}`);

    return campaign;
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
    }
) {
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
        data,
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/families");
    revalidatePath(`/admin/campaigns/${campaignId}`);

    return campaign;
}

// ============================================
// DELETE CAMPAIGN
// ============================================
export async function deleteCampaign(campaignId: string) {
    await db.campaign.delete({
        where: { id: campaignId },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/families");
    revalidatePath(`/admin/campaigns/${campaignId}`);
}

// ============================================
// GET CAMPAIGNS
// ============================================
export async function getCampaigns() {
    return db.campaign.findMany({
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
}

// ============================================
// GET ACTIVE CAMPAIGN
// ============================================
export async function getActiveCampaign() {
    const campaign = await db.campaign.findFirst({
        where: { status: "ACTIVE" },
        include: {
            families: {
                include: {
                    persons: {
                        include: {
                            gifts: {
                                include: {
                                    claims: true,
                                },
                            },
                        },
                    },
                    gifts: {
                        include: {
                            claims: true,
                        },
                    },
                },
            },
        },
    });

    if (!campaign) return null;

    // Sanitize data for public view (hide names)
    return {
        ...campaign,
        families: campaign.families.map((family: any) => ({
            ...family,
            gifts: family.gifts.map((gift: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { firstName: _fn, lastName: _ln, ...publicGift } = gift;
                return publicGift;
            })
        }))
    } as any;
}

// ============================================
// GET CAMPAIGN BY ID
// ============================================
export async function getCampaignById(campaignId: string) {
    return db.campaign.findUnique({
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
}
