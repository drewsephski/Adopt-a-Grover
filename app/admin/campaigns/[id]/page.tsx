import { getCampaignById } from "@/lib/actions/campaign";
import { getCampaignProgress } from "@/lib/types";
import {
    Users,
    Settings2,
    PlusCircle,
    Box,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FamilyList } from "@/components/admin/family-list";
import { CreateFamilyDialog } from "@/components/admin/create-family-dialog";

export default async function CampaignDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = await params;
    const campaign = await getCampaignById(id);

    if (!campaign) {
        notFound();
    }

    const stats = getCampaignProgress(campaign);

    return (
        <div className="space-y-8">
            {/* Breadcrumbs & Navigation */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <Link href="/admin/campaigns" className="hover:text-indigo-600 transition-colors">Campaigns</Link>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-medium">{campaign.name}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b border-slate-200 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">{campaign.name}</h1>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 uppercase tracking-wider text-[10px]">
                            {campaign.status}
                        </Badge>
                    </div>
                    <p className="text-slate-500 max-w-2xl">
                        Manage the families and gifts for this campaign. All information added here is used to coordinate donations.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/campaigns/${campaign.id}/settings`}>
                            <Settings2 className="mr-2 h-4 w-4" />
                            Settings
                        </Link>
                    </Button>
                    <CreateFamilyDialog campaignId={campaign.id}>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Family
                        </Button>
                    </CreateFamilyDialog>
                </div>
            </div>

            {/* Campaign Summary Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <SummaryCard
                    icon={<Users className="h-5 w-5 text-indigo-600" />}
                    label="Families"
                    value={stats.totalFamilies.toString()}
                />
                <SummaryCard
                    icon={<Box className="h-5 w-5 text-blue-600" />}
                    label="Total Gifts"
                    value={stats.totalQuantity.toString()}
                />
                <SummaryCard
                    icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    label="Claimed Items"
                    value={stats.claimedQuantity.toString()}
                    progress={stats.percentComplete}
                />
            </div>

            {/* Families List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900 uppercase">Participating Families</h2>
                    <span className="text-sm text-slate-500">{campaign.families.length} families added</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <FamilyList families={campaign.families} />
                </div>
            </div>
        </div>
    );
}

function SummaryCard({
    icon,
    label,
    value,
    progress
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    progress?: number;
}) {
    return (
        <div className="flex flex-col gap-2 p-6 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    {icon}
                </div>
                <span className="text-sm font-medium text-slate-500">{label}</span>
            </div>
            <div className="flex items-end justify-between gap-4 pt-2">
                <span className="text-3xl font-bold text-slate-900">{value}</span>
                {progress !== undefined && (
                    <div className="flex flex-col items-end gap-1 mb-1">
                        <span className="text-xs font-semibold text-emerald-600">{progress}% complete</span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
