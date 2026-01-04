"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

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
    newPerson?: { role?: string; age?: number } | null
) {
    let finalPersonId = personId || null;

    // If creating a new person with role/age
    if (newPerson && !personId) {
        const person = await db.person.create({
            data: {
                familyId,
                firstName: newPerson.role || "Person",
                lastName: "",
                role: newPerson.role || null,
                age: newPerson.age || null,
            },
        });
        finalPersonId = person.id;
    }

    const gift = await db.gift.create({
        data: {
            familyId,
            name,
            quantity,
            description: description || null,
            productUrl: productUrl || null,
            personId: finalPersonId,
        },
        include: {
            family: true,
        },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/families");
    revalidatePath(`/admin/campaigns/${gift.family.campaignId}`);

    return gift;
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
    const gift = await db.gift.update({
        where: { id: giftId },
        data: updates,
        include: {
            family: true,
        },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/families");
    revalidatePath(`/admin/campaigns/${gift.family.campaignId}`);

    return gift;
}

// ============================================
// DELETE GIFT
// ============================================
export async function deleteGift(giftId: string) {
    const gift = await db.gift.delete({
        where: { id: giftId },
        include: {
            family: true,
        },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/families");
    revalidatePath(`/admin/campaigns/${gift.family.campaignId}`);
}

// ============================================
// GET GIFT BY ID
// ============================================
export async function getGiftById(giftId: string) {
    return db.gift.findUnique({
        where: { id: giftId },
        include: {
            family: {
                include: {
                    campaign: true,
                },
            },
            claims: true,
        },
    });
}

// ============================================
// GET GIFTS BY CAMPAIGN
// ============================================
export async function getGiftsByCampaign(campaignId: string) {
    return db.gift.findMany({
        where: {
            family: {
                campaignId: campaignId,
            },
        },
        include: {
            family: true,
            claims: true,
        },
        orderBy: [
            { family: { alias: "asc" } },
            { name: "asc" }
        ],
    });
}
