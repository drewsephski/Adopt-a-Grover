import { getFamilyById } from "@/lib/actions/family";
import { GiftList } from "@/components/admin/gift-list";
import { CreateGiftDialog } from "@/components/admin/create-gift-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    PlusCircle,
    CheckCircle2,
    Package,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFamilyProgress } from "@/lib/types";

export default async function FamilyDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = await params;
    const family = await getFamilyById(id);

    if (!family) {
        notFound();
    }

    const stats = getFamilyProgress(family);

    return (
        <div className="space-y-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <Link href="/admin/campaigns" className="hover:text-indigo-600 transition-colors">Campaigns</Link>
                <span className="text-slate-300">/</span>
                <Link href={`/admin/campaigns/${family.campaignId}`} className="hover:text-indigo-600 transition-colors">{family.campaign.name}</Link>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-medium">{family.alias}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b border-slate-200 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">{family.alias}</h1>
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase tracking-wider text-[10px]">
                            {stats.percentComplete === 100 ? 'Fully Claimed' : 'Progressing'}
                        </Badge>
                    </div>
                    <p className="text-slate-500 max-w-2xl">
                        Listing gifts for {family.alias}. Donors will see these gift descriptions and quantities.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/campaigns/${family.campaignId}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Campaign
                        </Link>
                    </Button>
                    <CreateGiftDialog familyId={family.id}>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Gift
                        </Button>
                    </CreateGiftDialog>
                </div>
            </div>

            {/* Family Stats */}
            <div className="grid gap-6 md:grid-cols-2">
                <SummaryCard
                    icon={<Package className="h-5 w-5 text-indigo-600" />}
                    label="Gift Types"
                    value={stats.totalGifts.toString()}
                />
                <SummaryCard
                    icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    label="Items Claimed"
                    value={`${stats.claimedQuantity} of ${stats.totalQuantity}`}
                    progress={stats.percentComplete}
                />
            </div>

            {/* Gifts List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900 uppercase">Requested Gifts</h2>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <GiftList gifts={family.gifts} />
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
