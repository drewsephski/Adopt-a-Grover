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

function validatePersonName(name: string): boolean {
    return name.trim().length >= 1 && name.trim().length <= 50;
}

function validateRole(role: string | null | undefined): boolean {
    if (!role) return true;
    return role.trim().length <= 30;
}

function validateAge(age: number | null | undefined): boolean {
    if (age === null || age === undefined) return true;
    return Number.isInteger(age) && age >= 0 && age <= 120;
}

// ============================================
// CREATE PERSON
// ============================================
export async function createPerson(
    familyId: string,
    firstName: string,
    role?: string | null,
    age?: number | null
) {
    try {
        await requireAuth();
        
        if (!familyId || typeof familyId !== "string") {
            throw new Error("Invalid family ID");
        }
        
        if (!validatePersonName(firstName)) {
            throw new Error("Person name must be between 1 and 50 characters");
        }
        
        if (!validateRole(role)) {
            throw new Error("Role must be 30 characters or less");
        }
        
        if (!validateAge(age)) {
            throw new Error("Age must be between 0 and 120");
        }
        
        // Verify family exists
        const family = await db.family.findUnique({
            where: { id: familyId },
            select: { id: true, campaignId: true }
        });
        
        if (!family) {
            throw new Error("Family not found");
        }
        
        const person = await db.person.create({
            data: {
                familyId,
                firstName: firstName.trim(),
                role: role?.trim() || null,
                age: age || null,
            },
            include: {
                family: {
                    select: {
                        id: true,
                        campaignId: true
                    }
                }
            }
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${person.family.campaignId}`);

        return {
            success: true,
            person,
            message: "Person created successfully"
        };
    } catch (error) {
        console.error("Error creating person:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create person"
        };
    }
}

// ============================================
// UPDATE PERSON
// ============================================
export async function updatePerson(
    personId: string,
    updates: {
        firstName?: string;
        role?: string | null;
        age?: number | null;
    }
) {
    try {
        await requireAuth();
        
        if (!personId || typeof personId !== "string") {
            throw new Error("Invalid person ID");
        }
        
        // Validate updates
        if (updates.firstName !== undefined && !validatePersonName(updates.firstName)) {
            throw new Error("Person name must be between 1 and 50 characters");
        }
        
        if (updates.role !== undefined && !validateRole(updates.role)) {
            throw new Error("Role must be 30 characters or less");
        }
        
        if (updates.age !== undefined && !validateAge(updates.age)) {
            throw new Error("Age must be between 0 and 120");
        }
        
        // Get current person to verify family
        const currentPerson = await db.person.findUnique({
            where: { id: personId },
            select: { familyId: true }
        });
        
        if (!currentPerson) {
            throw new Error("Person not found");
        }
        
        const person = await db.person.update({
            where: { id: personId },
            data: {
                ...updates,
                firstName: updates.firstName?.trim(),
                role: updates.role?.trim() || null,
            },
            include: {
                family: {
                    select: {
                        id: true,
                        campaignId: true
                    }
                },
                gifts: {
                    include: {
                        claims: {
                            orderBy: { createdAt: "desc" }
                        }
                    }
                }
            }
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${person.family.campaignId}`);

        return {
            success: true,
            person,
            message: "Person updated successfully"
        };
    } catch (error) {
        console.error("Error updating person:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update person"
        };
    }
}

// ============================================
// DELETE PERSON
// ============================================
export async function deletePerson(personId: string) {
    try {
        await requireAuth();
        
        if (!personId || typeof personId !== "string") {
            throw new Error("Invalid person ID");
        }
        
        // Check if person has any gifts with claims before allowing deletion
        const personWithGifts = await db.person.findUnique({
            where: { id: personId },
            include: {
                gifts: {
                    include: {
                        claims: true
                    }
                },
                family: {
                    select: {
                        id: true,
                        campaignId: true
                    }
                }
            }
        });
        
        if (!personWithGifts) {
            throw new Error("Person not found");
        }
        
        const totalClaims = personWithGifts.gifts.flatMap(gift => gift.claims).length;
        if (totalClaims > 0) {
            throw new Error(`Cannot delete person with ${totalClaims} existing claims on their gifts`);
        }
        
        const person = await db.person.delete({
            where: { id: personId },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${personWithGifts.family.campaignId}`);
        
        return {
            success: true,
            person,
            message: "Person deleted successfully"
        };
    } catch (error) {
        console.error("Error deleting person:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete person"
        };
    }
}

// ============================================
// GET PERSONS BY FAMILY
// ============================================
export async function getPersonsByFamily(familyId: string) {
    try {
        if (!familyId || typeof familyId !== "string") {
            throw new Error("Invalid family ID");
        }
        
        return await db.person.findMany({
            where: { familyId },
            include: {
                gifts: {
                    include: {
                        claims: {
                            orderBy: { createdAt: "desc" }
                        }
                    },
                    orderBy: { name: "asc" }
                }
            },
            orderBy: { createdAt: "asc" },
        });
    } catch (error) {
        console.error("Error fetching persons by family:", error);
        return [];
    }
}

// ============================================
// BULK CREATE PERSONS
// ============================================
export async function bulkCreatePersons(
    familyId: string,
    persons: Array<{
        firstName: string;
        role?: string | null;
        age?: number | null;
    }>
) {
    try {
        await requireAuth();
        
        if (!familyId || typeof familyId !== "string") {
            throw new Error("Invalid family ID");
        }
        
        if (!Array.isArray(persons) || persons.length === 0) {
            throw new Error("Persons array is required and cannot be empty");
        }
        
        if (persons.length > 20) {
            throw new Error("Cannot create more than 20 persons at once");
        }
        
        // Verify family exists
        const family = await db.family.findUnique({
            where: { id: familyId },
            select: { id: true, campaignId: true }
        });
        
        if (!family) {
            throw new Error("Family not found");
        }
        
        // Validate all persons
        for (const person of persons) {
            if (!validatePersonName(person.firstName)) {
                throw new Error(`Person name "${person.firstName}" must be between 1 and 50 characters`);
            }
            if (!validateRole(person.role)) {
                throw new Error(`Role for "${person.firstName}" must be 30 characters or less`);
            }
            if (!validateAge(person.age)) {
                throw new Error(`Age for "${person.firstName}" must be between 0 and 120`);
            }
        }
        
        const createdPersons = await db.$transaction(
            persons.map(person => 
                db.person.create({
                    data: {
                        familyId,
                        firstName: person.firstName.trim(),
                        role: person.role?.trim() || null,
                        age: person.age || null,
                    },
                    include: {
                        family: {
                            select: {
                                id: true,
                                campaignId: true
                            }
                        }
                    }
                })
            )
        );

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${family.campaignId}`);

        return {
            success: true,
            persons: createdPersons,
            message: `Successfully created ${createdPersons.length} persons`
        };
    } catch (error) {
        console.error("Error bulk creating persons:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create persons"
        };
    }
}

// ============================================
// GET PERSON STATS
// ============================================
export async function getPersonStats(personId: string) {
    try {
        if (!personId || typeof personId !== "string") {
            throw new Error("Invalid person ID");
        }
        
        const person = await db.person.findUnique({
            where: { id: personId },
            include: {
                gifts: {
                    include: {
                        claims: true
                    }
                },
                family: {
                    select: {
                        id: true,
                        alias: true
                    }
                }
            }
        });
        
        if (!person) {
            throw new Error("Person not found");
        }
        
        const totalGifts = person.gifts.length;
        const totalQuantity = person.gifts.reduce((sum, gift) => sum + gift.quantity, 0);
        const claimedQuantity = person.gifts.reduce(
            (sum, gift) => sum + gift.claims.reduce((claimSum, claim) => claimSum + claim.quantity, 0),
            0
        );
        const uniqueDonors = new Set(
            person.gifts.flatMap(gift => gift.claims.map(claim => claim.donorEmail))
        ).size;
        
        return {
            totalGifts,
            totalQuantity,
            claimedQuantity,
            percentComplete: totalQuantity > 0 ? Math.round((claimedQuantity / totalQuantity) * 100) : 0,
            uniqueDonors,
            familyAlias: person.family.alias,
        };
    } catch (error) {
        console.error("Error fetching person stats:", error);
        throw error;
    }
}

// ============================================
// GET PERSON BY ID
// ============================================
export async function getPersonById(personId: string) {
    try {
        if (!personId || typeof personId !== "string") {
            throw new Error("Invalid person ID");
        }
        
        return await db.person.findUnique({
            where: { id: personId },
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
                gifts: {
                    include: {
                        claims: {
                            orderBy: { createdAt: "desc" }
                        }
                    },
                    orderBy: { name: "asc" }
                }
            },
        });
    } catch (error) {
        console.error("Error fetching person:", error);
        return null;
    }
}
