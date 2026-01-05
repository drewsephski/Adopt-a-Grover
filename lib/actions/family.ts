"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";

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
// MAGIC LINK GENERATION
// ============================================

function generateMagicToken(): string {
    return randomBytes(32).toString('hex');
}

function generateMagicLink(familyId: string, token: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/family/${familyId}?token=${token}`;
}

// ============================================
// VALIDATION HELPERS
// ============================================

function validateFamilyAlias(alias: string): boolean {
    return alias.trim().length >= 2 && alias.trim().length <= 50;
}

// ============================================
// CREATE FAMILY
// ============================================
export async function createFamily(campaignId: string, alias: string) {
    try {
        await requireAuth();
        
        if (!campaignId || typeof campaignId !== "string") {
            throw new Error("Invalid campaign ID");
        }
        
        if (!validateFamilyAlias(alias)) {
            throw new Error("Family alias must be between 2 and 50 characters");
        }

        const family = await db.family.create({
            data: {
                alias: alias.trim(),
                campaignId,
            },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${campaignId}`);

        return {
            success: true,
            family,
            message: "Family created successfully"
        };
    } catch (error) {
        console.error("Error creating family:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create family"
        };
    }
}

// ============================================
// UPDATE FAMILY
// ============================================
export async function updateFamily(familyId: string, alias: string) {
    try {
        await requireAuth();
        
        if (!familyId || typeof familyId !== "string") {
            throw new Error("Invalid family ID");
        }
        
        if (!validateFamilyAlias(alias)) {
            throw new Error("Family alias must be between 2 and 50 characters");
        }
        
        const family = await db.family.update({
            where: { id: familyId },
            data: { alias: alias.trim() },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${family.campaignId}`);

        return {
            success: true,
            family,
            message: "Family updated successfully"
        };
    } catch (error) {
        console.error("Error updating family:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update family"
        };
    }
}

// ============================================
// DELETE FAMILY
// ============================================
export async function deleteFamily(familyId: string) {
    try {
        await requireAuth();
        
        if (!familyId || typeof familyId !== "string") {
            throw new Error("Invalid family ID");
        }
        
        // Check if family has any claims before allowing deletion
        const familyWithClaims = await db.family.findUnique({
            where: { id: familyId },
            include: {
                gifts: {
                    include: {
                        claims: true
                    }
                }
            }
        });
        
        if (!familyWithClaims) {
            throw new Error("Family not found");
        }
        
        const totalClaims = familyWithClaims.gifts.flatMap(g => g.claims).length;
        if (totalClaims > 0) {
            throw new Error(`Cannot delete family with ${totalClaims} existing claims`);
        }
        
        // Cascade delete handles gifts + claims automatically
        const family = await db.family.delete({
            where: { id: familyId },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${family.campaignId}`);
        
        return {
            success: true,
            family,
            message: "Family deleted successfully"
        };
    } catch (error) {
        console.error("Error deleting family:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete family"
        };
    }
}

// ============================================
// GENERATE FAMILY MAGIC LINK
// ============================================
export async function generateFamilyMagicLink(familyId: string) {
    try {
        await requireAuth();
        
        if (!familyId || typeof familyId !== "string") {
            throw new Error("Invalid family ID");
        }
        
        const family = await db.family.findUnique({
            where: { id: familyId },
            include: {
                campaign: true
            }
        });
        
        if (!family) {
            throw new Error("Family not found");
        }
        
        const token = generateMagicToken();
        const magicLink = generateMagicLink(familyId, token);
        
        // In a real implementation, you'd store this token in the database
        // with an expiration date. For now, we'll return the link.
        
        return {
            success: true,
            magicLink,
            token,
            family,
            message: "Magic link generated successfully"
        };
    } catch (error) {
        console.error("Error generating magic link:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to generate magic link"
        };
    }
}

// ============================================
// GET FAMILY BY ID
// ============================================
export async function getFamilyById(familyId: string) {
    try {
        if (!familyId || typeof familyId !== "string") {
            throw new Error("Invalid family ID");
        }
        
        return await db.family.findUnique({
            where: { id: familyId },
            include: {
                campaign: true,
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
                        person: true,
                    },
                },
            },
        });
    } catch (error) {
        console.error("Error fetching family:", error);
        return null;
    }
}

// ============================================
// GET FAMILIES BY CAMPAIGN
// ============================================
export async function getFamiliesByCampaign(campaignId: string) {
    try {
        if (!campaignId || typeof campaignId !== "string") {
            throw new Error("Invalid campaign ID");
        }
        
        return await db.family.findMany({
            where: { campaignId },
            include: {
                persons: true,
                gifts: {
                    include: {
                        claims: true,
                        person: true,
                    },
                },
            },
            orderBy: { alias: "asc" },
        });
    } catch (error) {
        console.error("Error fetching families:", error);
        return [];
    }
}

// ============================================
// GET FAMILY STATS
// ============================================
export async function getFamilyStats(familyId: string) {
    try {
        if (!familyId || typeof familyId !== "string") {
            throw new Error("Invalid family ID");
        }
        
        const family = await db.family.findUnique({
            where: { id: familyId },
            include: {
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
            throw new Error("Family not found");
        }
        
        const totalGifts = family.gifts.length;
        const totalQuantity = family.gifts.reduce((sum, gift) => sum + gift.quantity, 0);
        const claimedQuantity = family.gifts.reduce(
            (sum, gift) => sum + gift.claims.reduce((claimSum, claim) => claimSum + claim.quantity, 0),
            0
        );
        const uniqueDonors = new Set(
            family.gifts.flatMap(gift => gift.claims.map(claim => claim.donorEmail))
        ).size;
        
        return {
            totalGifts,
            totalQuantity,
            claimedQuantity,
            percentComplete: totalQuantity > 0 ? Math.round((claimedQuantity / totalQuantity) * 100) : 0,
            uniqueDonors,
            memberCount: family.persons.length,
        };
    } catch (error) {
        console.error("Error fetching family stats:", error);
        throw error;
    }
}
