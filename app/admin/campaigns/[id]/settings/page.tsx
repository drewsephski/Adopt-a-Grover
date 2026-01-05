import { getCampaignById } from "@/lib/actions/campaign";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Settings2, ArrowLeft } from "lucide-react";
import { CampaignSettingsForm } from "./settings-form";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";

export default async function CampaignSettingsPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = await params;
    const campaign = await getCampaignById(id);

    if (!campaign) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <AdminBreadcrumbs />

            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b border-border pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight uppercase">Campaign Settings</h1>
                        <div className="p-2 rounded-lg bg-muted border border-border">
                            <Settings2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">
                        Configure the basic information and scheduling for your donation campaign.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/campaigns/${campaign.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Campaign
                    </Link>
                </div>
            </div>

            <div className="max-w-2xl">
                <CampaignSettingsForm campaign={campaign} />
            </div>
        </div>
    );
}
