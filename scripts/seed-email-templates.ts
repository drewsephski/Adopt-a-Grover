import { seedDefaultEmailTemplates } from "@/lib/actions/email-templates";

export async function seedEmailTemplates() {
  try {
    console.log("Seeding default email templates...");
    const result = await seedDefaultEmailTemplates();
    console.log(`Successfully seeded ${result.seeded} email templates`);
    return result;
  } catch (error) {
    console.error("Failed to seed email templates:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedEmailTemplates()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
