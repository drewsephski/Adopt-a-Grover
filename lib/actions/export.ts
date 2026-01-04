"use server";

import { getClaimsByCampaign } from "./claim";
import { getFamiliesByCampaign } from "./family";
import { format } from "date-fns";
import type { ClaimWithGift, FamilyWithGifts } from "@/lib/types";
import { PAST_EVENTS } from "../archive-data";

/**
 * Generate CSV content for claims in a campaign
 */
export async function exportClaimsToCSV(campaignId: string) {
    const claims = await getClaimsByCampaign(campaignId) as ClaimWithGift[];

    if (claims.length === 0) {
        throw new Error("No claims found for this campaign");
    }

    const headers = ["Donor Name", "Donor Email", "Family", "Gift Item", "Quantity", "Date"];
    const rows: (string | number)[][] = claims.map((claim: ClaimWithGift) => [
        `"${claim.donorName}"`,
        `"${claim.donorEmail}"`,
        `"${claim.gift.family.alias}"`,
        `"${claim.gift.name}"`,
        claim.quantity,
        format(claim.createdAt, "yyyy-MM-dd HH:mm")
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    return csvContent;
}

/**
 * Generate CSV content for the entire campaign inventory
 */
export async function exportCampaignInventoryToCSV(campaignId: string) {
    const families = await getFamiliesByCampaign(campaignId) as FamilyWithGifts[];

    if (families.length === 0) {
        throw new Error("No families found for this campaign");
    }

    const headers = ["Family", "Gift Item", "Description", "Quantity Required", "Quantity Claimed", "Status"];
    const rows: (string | number)[][] = [];

    for (const family of families) {
        for (const gift of family.gifts) {
            const claimed = gift.claims.reduce((sum: number, c: { quantity: number }) => sum + c.quantity, 0);
            const status = claimed === 0 ? "Open" : (claimed >= gift.quantity ? "Full" : "Partial");

            rows.push([
                `"${family.alias}"`,
                `"${gift.name}"`,
                `"${gift.description || ""}"`,
                gift.quantity,
                claimed,
                status
            ]);
        }
    }

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    return csvContent;
}

/**
 * Generate CSV content for a past campaign archive
 */
export async function exportArchiveToCSV(year: string) {
    const campaign = PAST_EVENTS.find(c => c.year === year);
    if (!campaign) {
        throw new Error("Archive for this year not found");
    }

    const headers = ["Family", "Member", "Donor", "Gift Description"];
    const rows: (string | number)[][] = [];

    for (const family of campaign.families) {
        for (const member of family.members) {
            for (const claim of member.claims) {
                rows.push([
                    `"${family.alias}"`,
                    `"${member.relation}"`,
                    `"${claim.donor}"`,
                    `"${claim.comment}"`
                ]);
            }
        }
    }

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    return csvContent;
}
