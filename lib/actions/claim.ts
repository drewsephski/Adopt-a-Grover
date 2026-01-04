"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CampaignStatus } from "@/lib/types";
import { getAvailableQuantity } from "@/lib/types";
import { sendClaimConfirmation } from "@/lib/email";

// ============================================
// CLAIM GIFT
// ============================================
export async function claimGift(
    giftId: string,
    donorName: string,
    donorEmail: string,
    quantity: number = 1
) {
    // Start a transaction for atomicity
    return await db.$transaction(async (tx: any) => {
        // Get the gift with its claims and campaign status
        const gift = await tx.gift.findUnique({
            where: { id: giftId },
            include: {
                claims: true,
                family: {
                    include: {
                        campaign: true,
                    },
                },
            },
        });

        if (!gift) {
            throw new Error("Gift not found");
        }

        // Validate campaign is active
        if (gift.family.campaign.status !== CampaignStatus.ACTIVE) {
            throw new Error("This campaign is not currently accepting donations");
        }

        // Validate availability
        const available = getAvailableQuantity(gift);
        if (quantity > available) {
            throw new Error(
                `Only ${available} available. Please reduce your quantity.`
            );
        }

        // Create the claim
        const claim = await tx.claim.create({
            data: {
                giftId,
                donorName,
                donorEmail,
                quantity,
            },
        });

        // Revalidate paths
        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${gift.family.campaignId}`);

        // Send confirmation email
        await sendClaimConfirmation({
            donorName,
            donorEmail,
            items: [{
                name: gift.name,
                quantity,
                familyAlias: gift.family.alias
            }]
        });

        return claim;
    });
}

// ============================================
// ADOPT FAMILY (Power Action)
// ============================================
export async function adoptFamily(
    familyId: string,
    donorName: string,
    donorEmail: string
) {
    return await db.$transaction(async (tx: any) => {
        // Get family with all gifts and their claims
        const family = await tx.family.findUnique({
            where: { id: familyId },
            include: {
                campaign: true,
                gifts: {
                    include: {
                        claims: true,
                    },
                },
            },
        });

        if (!family) {
            throw new Error("Family not found");
        }

        // Validate campaign is active
        if (family.campaign.status !== CampaignStatus.ACTIVE) {
            throw new Error("This campaign is not currently accepting donations");
        }

        // Create claims for all gifts with available quantity
        const claims = [];
        for (const gift of family.gifts) {
            const available = getAvailableQuantity(gift);
            if (available > 0) {
                const claim = await tx.claim.create({
                    data: {
                        giftId: gift.id,
                        donorName,
                        donorEmail,
                        quantity: available,
                    },
                });
                claims.push(claim);
            }
        }

        if (claims.length === 0) {
            throw new Error("All gifts for this family have already been claimed");
        }

        // Revalidate paths
        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${family.campaignId}`);

        // Send confirmation email with all claimed items
        await sendClaimConfirmation({
            donorName,
            donorEmail,
            items: family.gifts
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((g: any) => getAvailableQuantity(g) > 0)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((g: any) => ({
                    name: g.name,
                    quantity: getAvailableQuantity(g),
                    familyAlias: family.alias
                }))
        });

        return claims;
    });
}

// ============================================
// ADOPT PERSON (Power Action)
// ============================================
export async function adoptPerson(
    familyId: string,
    personId: string,
    donorName: string,
    donorEmail: string
) {
    return await db.$transaction(async (tx: any) => {
        // Get person with their gifts and family info
        const person = await tx.person.findUnique({
            where: { id: personId },
            include: {
                family: {
                    include: {
                        campaign: true,
                    },
                },
                gifts: {
                    include: {
                        claims: true,
                    },
                },
            },
        });

        if (!person) {
            throw new Error("Person not found");
        }

        // Validate campaign is active
        if (person.family.campaign.status !== CampaignStatus.ACTIVE) {
            throw new Error("This campaign is not currently accepting donations");
        }

        // Create claims for all of this person's gifts with available quantity
        const claims = [];
        for (const gift of person.gifts) {
            const available = getAvailableQuantity(gift);
            if (available > 0) {
                const claim = await tx.claim.create({
                    data: {
                        giftId: gift.id,
                        donorName,
                        donorEmail,
                        quantity: available,
                    },
                });
                claims.push(claim);
            }
        }

        if (claims.length === 0) {
            throw new Error("All gifts for this person have already been claimed");
        }

        // Revalidate paths
        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${person.family.campaignId}`);

        // Send confirmation email with all claimed items
        await sendClaimConfirmation({
            donorName,
            donorEmail,
            items: person.gifts
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((g: any) => getAvailableQuantity(g) > 0)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((g: any) => ({
                    name: g.name,
                    quantity: getAvailableQuantity(g),
                    familyAlias: person.family.alias
                }))
        });

        return claims;
    });
}

// ============================================
// REMOVE CLAIM (Admin Safety Action)
// ============================================
export async function removeClaim(claimId: string) {
    const claim = await db.claim.delete({
        where: { id: claimId },
        include: {
            gift: {
                include: {
                    family: true,
                },
            },
        },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/families");
    revalidatePath(`/admin/campaigns/${claim.gift.family.campaignId}`);
}

// ============================================
// GET CLAIMS BY GIFT
// ============================================
export async function getClaimsByGift(giftId: string) {
    return db.claim.findMany({
        where: { giftId },
        orderBy: { createdAt: "desc" },
    });
}

// ============================================
// GET ALL CLAIMS FOR CAMPAIGN
// ============================================
export async function getClaimsByCampaign(campaignId: string) {
    return db.claim.findMany({
        where: {
            gift: {
                family: {
                    campaignId,
                },
            },
        },
        include: {
            gift: {
                include: {
                    family: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}
