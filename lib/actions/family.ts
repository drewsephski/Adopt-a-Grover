"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

// ============================================
// CREATE FAMILY
// ============================================
export async function createFamily(campaignId: string, alias: string) {
    const family = await db.family.create({
        data: {
            alias,
            campaignId,
        },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/families");
    revalidatePath(`/admin/campaigns/${campaignId}`);

    return family;
}

// ============================================
// UPDATE FAMILY
// ============================================
export async function updateFamily(familyId: string, alias: string) {
    const family = await db.family.update({
        where: { id: familyId },
        data: { alias },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/families");
    revalidatePath(`/admin/campaigns/${family.campaignId}`);

    return family;
}

// ============================================
// DELETE FAMILY
// ============================================
export async function deleteFamily(familyId: string) {
    // Cascade delete handles gifts + claims automatically
    const family = await db.family.delete({
        where: { id: familyId },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/families");
    revalidatePath(`/admin/campaigns/${family.campaignId}`);
}

// ============================================
// GET FAMILY BY ID
// ============================================
export async function getFamilyById(familyId: string) {
    return db.family.findUnique({
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
                },
            },
        },
    });
}

// ============================================
// GET FAMILIES BY CAMPAIGN
// ============================================
export async function getFamiliesByCampaign(campaignId: string) {
    return db.family.findMany({
        where: { campaignId },
        include: {
            gifts: {
                include: {
                    claims: true,
                },
            },
        },
        orderBy: { alias: "asc" },
    });
}
