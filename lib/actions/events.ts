"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { OrganizationType } from "@prisma/client";
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

function validateEventName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
}

function validateDates(startsAt?: Date | null, endsAt?: Date | null, eventDate?: Date | null): string[] {
    const errors: string[] = [];
    
    if (startsAt && endsAt && startsAt >= endsAt) {
        errors.push("Start date must be before end date");
    }
    
    if (eventDate && startsAt && eventDate < startsAt) {
        errors.push("Event date cannot be before start date");
    }
    
    if (eventDate && endsAt && eventDate > endsAt) {
        errors.push("Event date cannot be after end date");
    }
    
    return errors;
}

// ============================================
// CREATE EVENT
// ============================================
export async function createEvent(data: {
    name: string;
    description?: string;
    eventType: "POTLUCK" | "SPORTS_TEAM" | "VOLUNTEER" | "PARTY" | "SCHOOL_EVENT" | "DONATION_DRIVE" | "CUSTOM";
    organizationType: OrganizationType;
    templateConfig?: Record<string, unknown>;
    startsAt?: Date | null;
    endsAt?: Date | null;
    eventDate?: Date | null;
    location?: string | null;
    isVirtual?: boolean;
    meetingUrl?: string | null;
    allowPublicSignup?: boolean;
    requireApproval?: boolean;
    maxParticipants?: number | null;
}) {
    try {
        await requireAuth();
        
        if (!validateEventName(data.name)) {
            throw new Error("Event name must be between 2 and 100 characters");
        }

        // For now, create using the existing Campaign model with generalized fields
        // We'll migrate to the new Event model later
        const event = await db.campaign.create({
            data: {
                name: data.name.trim(),
                organizationType: data.organizationType,
                startsAt: data.startsAt,
                endsAt: data.endsAt,
                dropOffAddress: data.location, // Using existing field for location
            },
        });

        // Create categories and items from template if provided
        if (data.templateConfig && typeof data.templateConfig === 'object' && 'categories' in data.templateConfig) {
            const categories = (data.templateConfig as { categories: Array<{name: string, description?: string, items?: Array<{name: string, quantity?: number, itemType?: string, detailsUrl?: string}>}> }).categories;
            for (const categoryData of categories) {
                // For now, create as Family (will be migrated to Category later)
                const category = await db.family.create({
                    data: {
                        alias: categoryData.name,
                        campaignId: event.id,
                    },
                });

                // Create items for this category
                if (categoryData.items && categoryData.items.length > 0) {
                    for (const itemData of categoryData.items) {
                        await db.gift.create({
                            data: {
                                name: itemData.name,
                                description: `${categoryData.description || ''} - ${itemData.itemType || 'QUANTITY_BASED'}`,
                                quantity: itemData.quantity || 1,
                                familyId: category.id,
                                productUrl: itemData.detailsUrl,
                            },
                        });
                    }
                }
            }
        }

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/events");
        revalidatePath("/admin/campaigns"); // Keep existing path for backward compatibility

        return {
            success: true,
            event,
            message: "Event created successfully"
        };
    } catch (error) {
        console.error("Error creating event:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create event"
        };
    }
}

// ============================================
// GET EVENTS
// ============================================
export async function getEvents() {
    try {
        return await db.campaign.findMany({
            include: {
                families: {
                    include: {
                        gifts: {
                            include: {
                                claims: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

// ============================================
// GET ACTIVE EVENT
// ============================================
export async function getActiveEvent() {
    try {
        const event = await db.campaign.findFirst({
            where: { status: "ACTIVE" },
            include: {
                families: {
                    include: {
                        gifts: {
                            include: {
                                claims: true,
                                person: true,
                            },
                        },
                        persons: true,
                    },
                },
            },
        });

        return event;
    } catch (error) {
        console.error("Error fetching active event:", error);
        return null;
    }
}

// ============================================
// GET EVENT BY ID
// ============================================
export async function getEventById(eventId: string) {
    try {
        if (!eventId || typeof eventId !== "string") {
            throw new Error("Invalid event ID");
        }
        
        return await db.campaign.findUnique({ 
            where: { id: eventId },
            include: {
                families: {
                    include: {
                        gifts: {
                            include: {
                                claims: true,
                                person: true,
                            },
                        },
                        persons: true,
                    },
                },
            },
        });
    } catch (error) {
        console.error("Error fetching event by ID:", error);
        return null;
    }
}

// ============================================
// UPDATE EVENT STATUS
// ============================================
export async function updateEventStatus(
    eventId: string,
    status: "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED"
) {
    try {
        await requireAuth();
        
        if (!eventId || typeof eventId !== "string") {
            throw new Error("Invalid event ID");
        }

        // If setting to ACTIVE, ensure no other event is active
        if (status === "ACTIVE") {
            const existingActive = await db.campaign.findFirst({
                where: {
                    status: "ACTIVE",
                    id: { not: eventId },
                },
            });

            if (existingActive) {
                throw new Error(
                    `Cannot activate event. "${existingActive.name}" is already active. Please deactivate it first.`
                );
            }
        }

        const event = await db.campaign.update({
            where: { id: eventId },
            data: { status, updatedAt: new Date() },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/events");
        revalidatePath("/admin/campaigns");
        revalidatePath(`/admin/events/${eventId}`);

        return {
            success: true,
            event,
            message: `Event status updated to ${status}`
        };
    } catch (error) {
        console.error("Error updating event status:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update event status"
        };
    }
}

// ============================================
// GET EVENT STATS
// ============================================
export async function getEventStats(eventId: string) {
    try {
        if (!eventId || typeof eventId !== "string") {
            throw new Error("Invalid event ID");
        }
        
        const event = await db.campaign.findUnique({
            where: { id: eventId },
            include: {
                families: {
                    include: {
                        gifts: {
                            include: {
                                claims: true,
                            },
                        },
                        persons: true,
                    },
                },
            },
        });
        
        if (!event) {
            throw new Error("Event not found");
        }
        
        const totalCategories = event.families.length;
        const totalItems = event.families.flatMap((f) => f.gifts).length;
        const totalQuantity = event.families.flatMap((f) => f.gifts).reduce((sum, item) => sum + item.quantity, 0);
        const claimedQuantity = event.families
            .flatMap((f) => f.gifts)
            .reduce((sum, item) => 
                sum + item.claims.reduce((claimSum, claim) => claimSum + claim.quantity, 0), 0);
        const uniqueParticipants = new Set(
            event.families.flatMap((f) => 
                f.gifts.flatMap((g) => g.claims.map((c) => c.donorEmail))
            )
        ).size;
        
        return {
            totalCategories,
            totalItems,
            totalQuantity,
            claimedQuantity,
            percentComplete: totalQuantity > 0 ? Math.round((claimedQuantity / totalQuantity) * 100) : 0,
            uniqueParticipants,
        };
    } catch (error) {
        console.error("Error fetching event stats:", error);
        throw error;
    }
}
