"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
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

function validateGiftName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 200;
}

function validateQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity >= 1 && quantity <= 100;
}

function validateUrl(url: string | null | undefined): boolean {
    if (!url) return true;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function validatePersonName(name: string): boolean {
    return name.trim().length >= 1 && name.trim().length <= 50;
}

// ============================================
// CREATE GIFT
// ============================================
export async function createGift(
    familyId: string,
    name: string,
    quantity: number,
    description?: string,
    productUrl?: string,
    personId?: string | null,
    newPerson?: { firstName?: string; role?: string; age?: number } | null
) {
    try {
        await requireAuth();
        
        // Input validation
        if (!familyId || typeof familyId !== "string") {
            throw new Error("Invalid family ID");
        }
        
        if (!validateGiftName(name)) {
            throw new Error("Gift name must be between 2 and 200 characters");
        }
        
        if (!validateQuantity(quantity)) {
            throw new Error("Quantity must be between 1 and 100");
        }
        
        if (productUrl && !validateUrl(productUrl)) {
            throw new Error("Invalid product URL");
        }
        
        if (description && description.length > 500) {
            throw new Error("Description must be 500 characters or less");
        }
        
        if (newPerson && newPerson.firstName && !validatePersonName(newPerson.firstName)) {
            throw new Error("Person name must be between 1 and 50 characters");
        }

        let finalPersonId = personId || null;

        // If creating a new person with firstName
        if (newPerson && !personId && newPerson.firstName) {
            if (!newPerson.firstName.trim()) {
                throw new Error("Name is required when creating a new person");
            }

            const person = await db.person.create({
                data: {
                    familyId,
                    firstName: newPerson.firstName.trim(),
                    role: newPerson.role?.trim() || null,
                    age: newPerson.age || null,
                },
            });
            finalPersonId = person.id;
        }
        
        // Verify person belongs to the same family if personId is provided
        if (finalPersonId) {
            const person = await db.person.findUnique({
                where: { id: finalPersonId },
                select: { familyId: true }
            });
            
            if (!person || person.familyId !== familyId) {
                throw new Error("Person does not belong to the specified family");
            }
        }

        const gift = await db.gift.create({
            data: {
                familyId,
                name: name.trim(),
                quantity,
                description: description?.trim() || null,
                productUrl: productUrl?.trim() || null,
                personId: finalPersonId,
            },
            include: {
                family: {
                    select: {
                        id: true,
                        campaignId: true
                    }
                },
                person: true
            },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${gift.family.campaignId}`);

        return {
            success: true,
            gift,
            message: "Gift created successfully"
        };
    } catch (error) {
        console.error("Error creating gift:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create gift"
        };
    }
}

// ============================================
// UPDATE GIFT
// ============================================
export async function updateGift(
    giftId: string,
    updates: {
        name?: string;
        quantity?: number;
        description?: string | null;
        productUrl?: string | null;
        personId?: string | null;
    }
) {
    try {
        await requireAuth();
        
        if (!giftId || typeof giftId !== "string") {
            throw new Error("Invalid gift ID");
        }
        
        // Validate updates
        if (updates.name !== undefined && !validateGiftName(updates.name)) {
            throw new Error("Gift name must be between 2 and 200 characters");
        }
        
        if (updates.quantity !== undefined && !validateQuantity(updates.quantity)) {
            throw new Error("Quantity must be between 1 and 100");
        }
        
        if (updates.productUrl !== undefined && !validateUrl(updates.productUrl)) {
            throw new Error("Invalid product URL");
        }
        
        if (updates.description !== undefined && updates.description && updates.description.length > 500) {
            throw new Error("Description must be 500 characters or less");
        }
        
        // Get current gift to verify family
        const currentGift = await db.gift.findUnique({
            where: { id: giftId },
            select: { familyId: true }
        });
        
        if (!currentGift) {
            throw new Error("Gift not found");
        }
        
        // Verify person belongs to the same family if personId is being updated
        if (updates.personId !== undefined) {
            if (updates.personId) {
                const person = await db.person.findUnique({
                    where: { id: updates.personId },
                    select: { familyId: true }
                });
                
                if (!person || person.familyId !== currentGift.familyId) {
                    throw new Error("Person does not belong to the gift's family");
                }
            }
        }
        
        const gift = await db.gift.update({
            where: { id: giftId },
            data: {
                ...updates,
                name: updates.name?.trim(),
                description: updates.description?.trim() || null,
                productUrl: updates.productUrl?.trim() || null,
            },
            include: {
                family: {
                    select: {
                        id: true,
                        campaignId: true
                    }
                },
                person: true
            },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${gift.family.campaignId}`);

        return {
            success: true,
            gift,
            message: "Gift updated successfully"
        };
    } catch (error) {
        console.error("Error updating gift:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update gift"
        };
    }
}

// ============================================
// DELETE GIFT
// ============================================
export async function deleteGift(giftId: string) {
    try {
        await requireAuth();
        
        if (!giftId || typeof giftId !== "string") {
            throw new Error("Invalid gift ID");
        }
        
        // Check if gift has any claims before allowing deletion
        const giftWithClaims = await db.gift.findUnique({
            where: { id: giftId },
            include: {
                claims: true,
                family: {
                    select: {
                        id: true,
                        campaignId: true
                    }
                }
            }
        });
        
        if (!giftWithClaims) {
            throw new Error("Gift not found");
        }
        
        if (giftWithClaims.claims.length > 0) {
            throw new Error(`Cannot delete gift with ${giftWithClaims.claims.length} existing claims`);
        }
        
        const gift = await db.gift.delete({
            where: { id: giftId },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${giftWithClaims.family.campaignId}`);
        
        return {
            success: true,
            gift,
            message: "Gift deleted successfully"
        };
    } catch (error) {
        console.error("Error deleting gift:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete gift"
        };
    }
}

// ============================================
// GET GIFT BY ID
// ============================================
export async function getGiftById(giftId: string) {
    try {
        if (!giftId || typeof giftId !== "string") {
            throw new Error("Invalid gift ID");
        }
        
        return await db.gift.findUnique({
            where: { id: giftId },
            include: {
                family: {
                    include: {
                        campaign: {
                            select: {
                                id: true,
                                name: true,
                                status: true
                            }
                        }
                    }
                },
                claims: {
                    orderBy: { createdAt: "desc" }
                },
                person: true
            },
        });
    } catch (error) {
        console.error("Error fetching gift:", error);
        return null;
    }
}

// ============================================
// GET GIFTS BY CAMPAIGN
// ============================================
export async function getGiftsByCampaign(campaignId: string) {
    try {
        if (!campaignId || typeof campaignId !== "string") {
            throw new Error("Invalid campaign ID");
        }
        
        return await db.gift.findMany({
            where: {
                family: {
                    campaignId: campaignId,
                },
            },
            include: {
                family: {
                    select: {
                        id: true,
                        alias: true
                    }
                },
                claims: {
                    orderBy: { createdAt: "desc" }
                },
                person: true
            },
            orderBy: [
                { family: { alias: "asc" } },
                { name: "asc" }
            ],
        });
    } catch (error) {
        console.error("Error fetching gifts by campaign:", error);
        return [];
    }
}

// ============================================
// GET GIFTS BY FAMILY
// ============================================
export async function getGiftsByFamily(familyId: string) {
    try {
        if (!familyId || typeof familyId !== "string") {
            throw new Error("Invalid family ID");
        }
        
        return await db.gift.findMany({
            where: { familyId },
            include: {
                claims: {
                    orderBy: { createdAt: "desc" }
                },
                person: true
            },
            orderBy: { name: "asc" }
        });
    } catch (error) {
        console.error("Error fetching gifts by family:", error);
        return [];
    }
}

// ============================================
// BULK CREATE GIFTS
// ============================================
export async function bulkCreateGifts(
    familyId: string,
    gifts: Array<{
        name: string;
        quantity: number;
        description?: string;
        productUrl?: string;
        personId?: string | null;
    }>
) {
    try {
        await requireAuth();
        
        if (!familyId || typeof familyId !== "string") {
            throw new Error("Invalid family ID");
        }
        
        if (!Array.isArray(gifts) || gifts.length === 0) {
            throw new Error("Gifts array is required and cannot be empty");
        }
        
        if (gifts.length > 50) {
            throw new Error("Cannot create more than 50 gifts at once");
        }
        
        // Validate all gifts
        for (const gift of gifts) {
            if (!validateGiftName(gift.name)) {
                throw new Error(`Gift name "${gift.name}" must be between 2 and 200 characters`);
            }
            if (!validateQuantity(gift.quantity)) {
                throw new Error(`Gift quantity for "${gift.name}" must be between 1 and 100`);
            }
            if (gift.productUrl && !validateUrl(gift.productUrl)) {
                throw new Error(`Invalid product URL for "${gift.name}"`);
            }
            if (gift.description && gift.description.length > 500) {
                throw new Error(`Description for "${gift.name}" must be 500 characters or less`);
            }
        }
        
        // Verify all persons belong to the family
        for (const gift of gifts) {
            if (gift.personId) {
                const person = await db.person.findUnique({
                    where: { id: gift.personId },
                    select: { familyId: true }
                });
                
                if (!person || person.familyId !== familyId) {
                    throw new Error(`Person does not belong to the specified family for gift "${gift.name}"`);
                }
            }
        }
        
        const createdGifts = await db.$transaction(
            gifts.map(gift => 
                db.gift.create({
                    data: {
                        familyId,
                        name: gift.name.trim(),
                        quantity: gift.quantity,
                        description: gift.description?.trim() || null,
                        productUrl: gift.productUrl?.trim() || null,
                        personId: gift.personId || null,
                    },
                    include: {
                        family: {
                            select: {
                                id: true,
                                campaignId: true
                            }
                        },
                        person: true
                    }
                })
            )
        );

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/campaigns");
        revalidatePath("/admin/families");
        if (createdGifts.length > 0) {
            revalidatePath(`/admin/campaigns/${createdGifts[0].family.campaignId}`);
        }

        return {
            success: true,
            gifts: createdGifts,
            message: `Successfully created ${createdGifts.length} gifts`
        };
    } catch (error) {
        console.error("Error bulk creating gifts:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create gifts"
        };
    }
}
