import type { Campaign, Family, Gift, Claim } from "@prisma/client";
export type { Campaign, Family, Gift, Claim };

// ============================================
// EXTENDED TYPES WITH RELATIONS
// ============================================

export type GiftWithClaims = Gift & {
    claims: Claim[];
};

export type FamilyWithGifts = Family & {
    gifts: GiftWithClaims[];
};

export type CampaignWithFamilies = Campaign & {
    families: FamilyWithGifts[];
};

export type GiftWithFamily = Gift & {
    family: Family & {
        campaign: Campaign;
    };
    claims: Claim[];
};

export type ClaimWithGift = Claim & {
    gift: Gift & {
        family: Family;
    };
};

// ============================================
// COMPUTED HELPERS
// ============================================

/**
 * Calculate total claimed quantity for a gift
 */
export function getClaimedQuantity(gift: GiftWithClaims): number {
    return gift.claims.reduce((sum, claim) => sum + claim.quantity, 0);
}

/**
 * Calculate available quantity for a gift
 */
export function getAvailableQuantity(gift: GiftWithClaims): number {
    return Math.max(0, gift.quantity - getClaimedQuantity(gift));
}

/**
 * Get gift status based on availability
 */
export function getGiftStatus(
    gift: GiftWithClaims
): "available" | "partial" | "claimed" {
    const available = getAvailableQuantity(gift);
    if (available === 0) return "claimed";
    if (available === gift.quantity) return "available";
    return "partial";
}

/**
 * Calculate family progress
 */
export function getFamilyProgress(family: FamilyWithGifts): {
    totalGifts: number;
    claimedGifts: number;
    totalQuantity: number;
    claimedQuantity: number;
    percentComplete: number;
} {
    let totalQuantity = 0;
    let claimedQuantity = 0;
    let totalGifts = 0;
    let claimedGifts = 0;

    for (const gift of family.gifts) {
        totalQuantity += gift.quantity;
        const claimed = getClaimedQuantity(gift);
        claimedQuantity += claimed;
        totalGifts++;
        if (claimed >= gift.quantity) {
            claimedGifts++;
        }
    }

    const percentComplete =
        totalQuantity > 0 ? Math.round((claimedQuantity / totalQuantity) * 100) : 0;

    return {
        totalGifts,
        claimedGifts,
        totalQuantity,
        claimedQuantity,
        percentComplete,
    };
}

/**
 * Calculate campaign completion rate
 */
export function getCampaignProgress(campaign: CampaignWithFamilies): {
    totalFamilies: number;
    totalGifts: number;
    totalQuantity: number;
    claimedQuantity: number;
    percentComplete: number;
} {
    let totalGifts = 0;
    let totalQuantity = 0;
    let claimedQuantity = 0;

    for (const family of campaign.families) {
        for (const gift of family.gifts) {
            totalGifts++;
            totalQuantity += gift.quantity;
            claimedQuantity += getClaimedQuantity(gift);
        }
    }

    const percentComplete =
        totalQuantity > 0 ? Math.round((claimedQuantity / totalQuantity) * 100) : 0;

    return {
        totalFamilies: campaign.families.length,
        totalGifts,
        totalQuantity,
        claimedQuantity,
        percentComplete,
    };
}
