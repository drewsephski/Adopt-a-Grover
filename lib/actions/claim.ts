"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CampaignStatus } from "@prisma/client";
import { getAvailableQuantity } from "@/lib/types";
import { sendClaimConfirmation, sendAdminNotification } from "@/lib/email";
import { auth } from "@clerk/nextjs/server";
import { ClaimError } from "@/lib/claim-errors";

// ============================================
// RATE LIMITING
// ============================================

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_CLAIMS_PER_WINDOW = 5; // Max 5 claims per minute per email
const claimAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(email: string): { allowed: boolean; resetIn?: number } {
    const now = Date.now();
    const key = email.toLowerCase();
    const attempt = claimAttempts.get(key);

    if (!attempt || now > attempt.resetAt) {
        claimAttempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return { allowed: true };
    }

    if (attempt.count >= MAX_CLAIMS_PER_WINDOW) {
        const resetIn = Math.ceil((attempt.resetAt - now) / 1000);
        return { allowed: false, resetIn };
    }

    attempt.count++;
    return { allowed: true };
}

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, attempt] of claimAttempts.entries()) {
        if (now > attempt.resetAt) {
            claimAttempts.delete(key);
        }
    }
}, 5 * 60 * 1000);

// ============================================
// VALIDATION HELPERS
// ============================================

function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateDonorName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
}

function sanitizeInput(input: string): string {
    return input.trim().slice(0, 200);
}

// ============================================
// CLAIM GIFT
// ============================================

export async function claimGift(
    giftId: string,
    donorName: string,
    donorEmail: string,
    quantity: number = 1
) {
    try {
        // Input validation
        if (!giftId || typeof giftId !== "string") {
            throw new ClaimError("Invalid gift ID", "INVALID_INPUT");
        }

        donorName = sanitizeInput(donorName);
        donorEmail = sanitizeInput(donorEmail.toLowerCase());

        if (!validateDonorName(donorName)) {
            throw new ClaimError(
                "Donor name must be between 2 and 100 characters",
                "INVALID_INPUT"
            );
        }

        if (!validateEmail(donorEmail)) {
            throw new ClaimError("Invalid email address", "INVALID_INPUT");
        }

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
            throw new ClaimError(
                "Quantity must be between 1 and 50",
                "INVALID_INPUT"
            );
        }

        // Rate limiting
        const rateLimitCheck = checkRateLimit(donorEmail);
        if (!rateLimitCheck.allowed) {
            throw new ClaimError(
                `Too many claim attempts. Please try again in ${rateLimitCheck.resetIn} seconds.`,
                "RATE_LIMIT"
            );
        }

        // Transaction for atomicity
        const result = await db.$transaction(async (tx) => {
            // Get the gift with all related data
            const gift = await tx.gift.findUnique({
                where: { id: giftId },
                include: {
                    claims: true,
                    person: true,
                    family: {
                        include: {
                            campaign: true,
                        },
                    },
                },
            });

            if (!gift) {
                throw new ClaimError("Gift not found", "GIFT_NOT_FOUND");
            }

            // Validate campaign is active
            if (gift.family.campaign.status !== CampaignStatus.ACTIVE) {
                throw new ClaimError(
                    "This campaign is not currently accepting donations",
                    "CAMPAIGN_INACTIVE"
                );
            }

            // Check availability
            const available = getAvailableQuantity(gift);
            if (quantity > available) {
                throw new ClaimError(
                    `Only ${available} available. Please reduce your quantity.`,
                    "INSUFFICIENT_QUANTITY"
                );
            }

            // Check if this donor already claimed this exact gift
            const existingClaims = gift.claims?.filter(
                (c) => c.donorEmail.toLowerCase() === donorEmail
            ) || [];

            // Calculate how much this donor has already claimed from this gift
            const alreadyClaimedQuantity = existingClaims.reduce(
                (sum, claim) => sum + claim.quantity,
                0
            );

            // Check if adding this claim would exceed the gift's total quantity
            if (alreadyClaimedQuantity + quantity > gift.quantity) {
                throw new ClaimError(
                    `You've already claimed ${alreadyClaimedQuantity} of ${gift.quantity} items. Only ${gift.quantity - alreadyClaimedQuantity} more available.`,
                    "INSUFFICIENT_QUANTITY"
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

            return { claim, gift };
        });

        const { claim, gift } = result;

        // Revalidate paths
        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${gift.family.campaignId}`);

        // Send confirmation email (non-blocking)
        sendClaimConfirmation({
            donorName,
            donorEmail,
            items: [
                {
                    name: gift.name,
                    quantity,
                    familyAlias: gift.family.alias,
                },
            ],
            dropOffAddress: gift.family?.campaign?.dropOffAddress || undefined,
            dropOffDeadline: gift.family?.campaign?.dropOffDeadline || undefined,
        }).catch((err) => console.error("Failed to send confirmation email:", err));

        // Send admin notification for high-value or large quantity claims
        const isHighValue =
            quantity >= 3 ||
            gift.name.toLowerCase().includes("bike") ||
            gift.name.toLowerCase().includes("tablet") ||
            gift.name.toLowerCase().includes("laptop") ||
            gift.name.toLowerCase().includes("console") ||
            gift.name.toLowerCase().includes("ipad");

        if (isHighValue) {
            sendAdminNotification({
                adminEmail: process.env.ADMIN_EMAIL || "test@example.com",
                subject: "High-value gift claimed",
                message: `${donorName} claimed ${quantity}x ${gift.name} for ${gift.family.alias}.\n\nDonor email: ${donorEmail}\nPerson: ${gift.person?.firstName || "Family gift"}`,
                campaignName: gift.family.campaign.name,
            }).catch((err) =>
                console.error("Failed to send admin notification:", err)
            );
        }

        return {
            success: true,
            claim,
            message: "Gift claimed successfully!",
        };
    } catch (error) {
        if (error instanceof ClaimError) {
            return {
                success: false,
                error: error.message,
                code: error.code,
            };
        }

        console.error("Unexpected error in claimGift:", error);
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
            code: "DATABASE_ERROR" as const,
        };
    }
}

// ============================================
// CLAIM FAMILY (Power Action)
// ============================================

export async function claimFamily(
    familyId: string,
    donorName: string,
    donorEmail: string
) {
    try {
        // Input validation
        if (!familyId || typeof familyId !== "string") {
            throw new ClaimError("Invalid family ID", "INVALID_INPUT");
        }

        donorName = sanitizeInput(donorName);
        donorEmail = sanitizeInput(donorEmail.toLowerCase());

        if (!validateDonorName(donorName)) {
            throw new ClaimError(
                "Donor name must be between 2 and 100 characters",
                "INVALID_INPUT"
            );
        }

        if (!validateEmail(donorEmail)) {
            throw new ClaimError("Invalid email address", "INVALID_INPUT");
        }

        // Rate limiting (stricter for family claim)
        const rateLimitCheck = checkRateLimit(donorEmail);
        if (!rateLimitCheck.allowed) {
            throw new ClaimError(
                `Too many claim attempts. Please try again in ${rateLimitCheck.resetIn} seconds.`,
                "RATE_LIMIT"
            );
        }

        const result = await db.$transaction(async (tx) => {
            // Get family with all gifts and their claims
            const family = await tx.family.findUnique({
                where: { id: familyId },
                include: {
                    campaign: true,
                    persons: true,
                    gifts: {
                        include: {
                            claims: true,
                            person: true,
                        },
                    },
                },
            });

            if (!family) {
                throw new ClaimError("Family not found", "FAMILY_NOT_FOUND");
            }

            // Validate campaign is active
            if (family.campaign.status !== CampaignStatus.ACTIVE) {
                throw new ClaimError(
                    "This campaign is not currently accepting donations",
                    "CAMPAIGN_INACTIVE"
                );
            }

            // Find gifts that are available and not already claimed by this donor
            const giftsToClaim = family.gifts.filter((gift) => {
                const available = getAvailableQuantity(gift);
                if (available === 0) {
                    return false; // No items available
                }
                
                // Check how many this donor has already claimed from this gift
                const alreadyClaimed = gift.claims?.filter(
                    (c) => c.donorEmail.toLowerCase() === donorEmail
                ).reduce((sum, claim) => sum + claim.quantity, 0) || 0;
                
                // Only claim if there are still items available for this donor
                return alreadyClaimed < gift.quantity;
            });

            if (giftsToClaim.length === 0) {
                throw new ClaimError(
                    "All gifts for this family have already been claimed or you've already claimed all available items.",
                    "INSUFFICIENT_QUANTITY"
                );
            }

            // Create claims for all available gifts that this donor hasn't fully claimed
            const claims = await Promise.all(
                giftsToClaim.map((gift) => {
                    const available = getAvailableQuantity(gift);
                    return tx.claim.create({
                        data: {
                            giftId: gift.id,
                            donorName,
                            donorEmail,
                            quantity: available,
                        },
                    });
                })
            );

            return { claims, family, giftsToClaim };
        });

        const { claims, family, giftsToClaim } = result;

        // Revalidate paths
        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${family.campaignId}`);

        // Send confirmation email
        sendClaimConfirmation({
            donorName,
            donorEmail,
            items: giftsToClaim.map((gift) => ({
                name: gift.name,
                quantity: getAvailableQuantity(gift),
                familyAlias: family.alias,
            })),
            dropOffAddress: family.campaign.dropOffAddress || undefined,
            dropOffDeadline: family.campaign.dropOffDeadline || undefined,
        }).catch((err) => console.error("Failed to send confirmation email:", err));

        // Send admin notification
        sendAdminNotification({
            adminEmail: process.env.ADMIN_EMAIL || "test@example.com",
            subject: "Family fully claimed! 🎉",
            message: `${donorName} claimed ${claims.length} items from the ${family.alias} family!\n\nDonor email: ${donorEmail}\n\nGifts claimed:\n${giftsToClaim.map((g) => `• ${g.name} (${getAvailableQuantity(g)}x)`).join("\n")}`,
            campaignName: family.campaign.name,
        }).catch((err) => console.error("Failed to send admin notification:", err));

        return {
            success: true,
            claims,
            message: `Successfully claimed ${family.alias}! You claimed ${claims.length} items.`,
            itemCount: claims.length,
        };
    } catch (error) {
        if (error instanceof ClaimError) {
            return {
                success: false,
                error: error.message,
                code: error.code,
            };
        }

        console.error("Unexpected error in claimFamily:", error);
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
            code: "DATABASE_ERROR" as const,
        };
    }
}

// ============================================
// REMOVE CLAIM (Admin Only)
// ============================================

export async function removeClaim(claimId: string) {
    try {
        // Check admin authentication
        const { userId } = await auth();
        if (!userId) {
            throw new Error("Unauthorized: Admin access required");
        }

        const claim = await db.claim.delete({
            where: { id: claimId },
        });

        // Revalidate paths
        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");

        // Log the removal
        console.log(
            `[ADMIN] Claim removed by ${userId}: ${claim.donorName} - Gift ID: ${claim.giftId}`
        );

        return {
            success: true,
            message: "Claim removed successfully",
        };
    } catch (error) {
        console.error("Error removing claim:", error);
        return {
            success: false,
            error:
                error instanceof Error ? error.message : "Failed to remove claim",
        };
    }
}

// ============================================
// GET CLAIMS BY GIFT
// ============================================

export async function getClaimsByGift(giftId: string) {
    try {
        return await db.claim.findMany({
            where: { giftId },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Error fetching claims by gift:", error);
        return [];
    }
}

// ============================================
// GET ALL CLAIMS FOR CAMPAIGN
// ============================================

export async function getClaimsByCampaign(campaignId: string) {
    try {
        return await db.claim.findMany({
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
                        person: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Error fetching claims by campaign:", error);
        return [];
    }
}

// ============================================
// GET DONOR CLAIMS (for donor lookup)
// ============================================

export async function getDonorClaims(donorEmail: string) {
    try {
        const email = donorEmail.toLowerCase().trim();

        if (!validateEmail(email)) {
            return [];
        }

        return await db.claim.findMany({
            where: {
                donorEmail: {
                    equals: email,
                    mode: "insensitive",
                },
            },
            include: {
                gift: {
                    include: {
                        family: {
                            include: {
                                campaign: true,
                            },
                        },
                        person: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Error fetching donor claims:", error);
        return [];
    }
}