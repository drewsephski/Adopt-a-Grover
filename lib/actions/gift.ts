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
    productUrl?: string
) {
    const gift = await db.gift.create({
        data: {
            familyId,
            name,
            quantity,
            description: description || null,
            productUrl: productUrl || null,
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

