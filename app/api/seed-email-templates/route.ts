import { NextResponse } from "next/server";
import { seedDefaultEmailTemplates } from "@/lib/actions/email-templates";

export async function POST() {
  try {
    const result = await seedDefaultEmailTemplates();
    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${result.seeded} email templates`,
      seeded: result.seeded 
    });
  } catch (error) {
    console.error("Failed to seed email templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed email templates" },
      { status: 500 }
    );
  }
}
