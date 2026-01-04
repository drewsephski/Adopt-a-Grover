import { getCampaignById } from "@/lib/actions/campaign";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Settings2, ArrowLeft } from "lucide-react";
import { CampaignSettingsForm } from "./settings-form";

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
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <Link href="/admin/campaigns" className="hover:text-indigo-600 transition-colors">Campaigns</Link>
                <span className="text-slate-300">/</span>
                <Link href={`/admin/campaigns/${campaign.id}`} className="hover:text-indigo-600 transition-colors">{campaign.name}</Link>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-medium">Settings</span>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b border-slate-200 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Campaign Settings</h1>
                        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                            <Settings2 className="h-5 w-5 text-slate-600" />
                        </div>
                    </div>
                    <p className="text-slate-500 max-w-2xl">
                        Configure the basic information and scheduling for your donation campaign.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/campaigns/${campaign.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
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
