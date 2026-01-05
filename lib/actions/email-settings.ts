"use server";

import { emailService } from "@/lib/email-service";
import { revalidatePath } from "next/cache";

export async function sendTestEmail(email: string) {
  try {
    const result = await emailService.sendTestEmail(email);
    revalidatePath("/admin/settings");
    return { success: true, message: "Test email sent successfully!" };
  } catch (error) {
    console.error("Failed to send test email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send test email" 
    };
  }
}

export async function getEmailConfigurationStatus() {
  try {
    const status = await emailService.getEmailConfigurationStatus();
    return { success: true, status };
  } catch (error) {
    console.error("Failed to get email configuration status:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get email configuration" 
    };
  }
}
