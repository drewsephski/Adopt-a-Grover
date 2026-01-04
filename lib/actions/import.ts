"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export interface ImportFamily {
    alias: string;
    gifts: {
        name: string;
        quantity: number;
        description?: string;
        productUrl?: string;
        firstName?: string;
        lastName?: string;
    }[];
}

export interface ImportResult {
    success: boolean;
    familiesCreated: number;
    giftsCreated: number;
    error?: string;
}

export async function importFromCSV(campaignId: string, data: ImportFamily[]) {
    try {
        // We use a transaction to ensure either everything is imported or nothing is
        const result = await db.$transaction(async (tx: any) => {
            let familiesCreated = 0;
            let giftsCreated = 0;

            for (const item of data) {
                // 1. Create the family
                const family = await tx.family.create({
                    data: {
                        alias: item.alias,
                        campaignId,
                    },
                });
                familiesCreated++;

                // 2. Create gifts for this family if any
                if (item.gifts && item.gifts.length > 0) {
                    await tx.gift.createMany({
                        data: item.gifts.map((g) => ({
                            familyId: family.id,
                            name: g.name,
                            quantity: g.quantity,
                            description: g.description || null,
                            productUrl: g.productUrl || null,
                            firstName: g.firstName || null,
                            lastName: g.lastName || null,
                        })),
                    });
                    giftsCreated += item.gifts.length;
                }
            }

            return { familiesCreated, giftsCreated };
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/families");
        revalidatePath(`/admin/campaigns/${campaignId}`);

        return { success: true, familiesCreated: result.familiesCreated, giftsCreated: result.giftsCreated };
    } catch (error) {
        console.error("Import error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error during import" };
    }
}
