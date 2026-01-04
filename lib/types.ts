import type { Campaign, Family, Gift, Claim, Person } from "@prisma/client";
export type { Campaign, Family, Gift, Claim, Person };

export enum CampaignStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    CLOSED = "CLOSED",
    ARCHIVED = "ARCHIVED",
}

// ============================================
// EXTENDED TYPES WITH RELATIONS
// ============================================

export type GiftWithClaims = Gift & {
    claims: Claim[];
    person?: Person;
};

export type FamilyWithGifts = Family & {
    gifts: GiftWithClaims[];
    persons?: PersonWithGifts[];
};

export type CampaignWithFamilies = Campaign & {
    families: FamilyWithGifts[];
};

export type PersonWithGifts = Person & {
    gifts: GiftWithClaims[];
    fullName?: string;
    role?: string | null;
    age?: number | null;
};

export type FamilyWithPersons = Family & {
    persons: PersonWithGifts[];
    gifts: GiftWithClaims[];
};

export type GiftWithFamily = Gift & {
    family: Family & {
        campaign: Campaign;
    };
    person?: Person & {
        firstName: string;
        lastName: string;
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
    return gift.claims.reduce((sum: number, claim: Claim) => sum + claim.quantity, 0);
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

// ============================================
// PERSON GROUPING HELPERS
// ============================================

/**
 * Group gifts by person within a family
 * Uses the Person model if available, otherwise falls back to firstName/lastName on gifts
 */
export function groupGiftsByPerson(family: FamilyWithGifts | FamilyWithPersons): PersonWithGifts[] {
    // Check if family has persons (new schema)
    if ('persons' in family && family.persons && family.persons.length > 0) {
        // Add fullName to each person
        return family.persons.map((person: PersonWithGifts) => ({
            ...person,
            fullName: `${person.firstName} ${person.lastName}`.trim()
        }));
    }

    // Fallback: group gifts by person relation
    const personMap = new Map<string, PersonWithGifts>();

    for (const gift of family.gifts) {
        // Try to get person from gift relation
        if (gift.person) {
            const fullName = `${gift.person.firstName} ${gift.person.lastName}`.trim();

            if (!personMap.has(fullName)) {
                personMap.set(fullName, {
                    ...gift.person,
                    gifts: [],
                    fullName
                });
            }

            personMap.get(fullName)!.gifts.push(gift);
        } else {
            // Unassigned gifts - group under "Unassigned"
            const fullName = "Unassigned";

            if (!personMap.has(fullName)) {
                personMap.set(fullName, {
                    id: "temp-unassigned",
                    firstName: "",
                    lastName: "",
                    familyId: family.id,
                    gifts: [],
                    fullName,
                    role: null,
                    age: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            personMap.get(fullName)!.gifts.push(gift);
        }
    }

    return Array.from(personMap.values());
}

/**
 * Calculate person progress
 */
export function getPersonProgress(person: PersonWithGifts | { firstName: string; lastName: string; gifts: GiftWithClaims[] }): {
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

    for (const gift of person.gifts) {
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
 * Check if a person is fully claimed
 */
export function isPersonFullyClaimed(person: PersonWithGifts | { firstName: string; lastName: string; gifts: GiftWithClaims[] }): boolean {
    return person.gifts.every((gift: GiftWithClaims) => getAvailableQuantity(gift) === 0);
}
