"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

// ============================================
// CREATE PERSON
// ============================================
export async function createPerson(
    familyId: string,
    firstName: string,
    lastName: string,
    role?: string | null,
    age?: number | null
) {
    const person = await db.person.create({
        data: {
            familyId,
            firstName,
            lastName,
            role: role || null,
            age: age || null,
        },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/families");

    return person;
}

// ============================================
// DELETE PERSON
// ============================================
export async function deletePerson(personId: string) {
    const person = await db.person.delete({
        where: { id: personId },
        include: {
            family: true,
        },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/families");
    revalidatePath(`/admin/campaigns/${person.family.campaignId}`);

    return person;
}

// ============================================
// GET PERSONS BY FAMILY
// ============================================
export async function getPersonsByFamily(familyId: string) {
    return db.person.findMany({
        where: { familyId },
        include: {
            gifts: {
                include: {
                    claims: true,
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });
}

// ============================================
// GET PERSON BY ID
// ============================================
export async function getPersonById(personId: string) {
    return db.person.findUnique({
        where: { id: personId },
        include: {
            family: true,
            gifts: {
                include: {
                    claims: true,
                },
            },
        },
    });
}
