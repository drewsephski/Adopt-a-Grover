"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  try {
    // Get the first settings record or create default if none exists
    let settings = await db.settings.findFirst();
    
    if (!settings) {
      settings = await db.settings.create({
        data: {
          emailNotifications: true,
          autoArchiveCampaigns: true,
          automaticBackups: true,
          twoFactorAuth: false,
          allowAdminRegistration: false,
        },
      });
    }
    
    return settings;
  } catch (error) {
    console.error("Failed to get settings:", error);
    throw new Error("Failed to retrieve settings");
  }
}

export async function updateSettings(formData: FormData) {
  try {
    const settings = await getSettings();
    
    const updatedSettings = await db.settings.update({
      where: { id: settings.id },
      data: {
        emailNotifications: formData.get("emailNotifications") === "on",
        autoArchiveCampaigns: formData.get("autoArchiveCampaigns") === "on",
        automaticBackups: formData.get("automaticBackups") === "on",
        twoFactorAuth: formData.get("twoFactorAuth") === "on",
        allowAdminRegistration: formData.get("allowAdminRegistration") === "on",
      },
    });

    revalidatePath("/admin/settings");
    return updatedSettings;
  } catch (error) {
    console.error("Failed to update settings:", error);
    throw new Error("Failed to update settings");
  }
}

export async function exportDatabase() {
  try {
    // This would implement actual database export logic
    // For now, return a placeholder response
    const campaigns = await db.campaign.findMany({
      include: {
        families: {
          include: {
            persons: {
              include: {
                gifts: {
                  include: {
                    claims: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: campaigns,
      exportedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to export database:", error);
    throw new Error("Failed to export database");
  }
}

export async function importDatabase(data: unknown) {
  try {
    // This would implement actual database import logic
    // For now, return a placeholder response
    console.log("Import data received:", data);
    
    return {
      success: true,
      importedAt: new Date().toISOString(),
      recordsProcessed: 0, // Would be actual count
    };
  } catch (error) {
    console.error("Failed to import database:", error);
    throw new Error("Failed to import database");
  }
}
