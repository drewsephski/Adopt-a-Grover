import { getCampaignById } from "@/lib/actions/campaign";
import { getCampaignProgress } from "@/lib/types";
import {
    Settings2,
    Heart,
    Box,
    Users,
    PlusCircle,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FamilyList } from "@/components/admin/family-list";
import { CreateFamilyDialog } from "@/components/admin/create-family-dialog";
import { ImportCSVDialog } from "@/components/admin/import-csv-dialog";
import { ExportButton } from "@/components/admin/export-button";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { FileUp } from "lucide-react";

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
            <AdminBreadcrumbs />

            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b border-border pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight uppercase">{campaign.name}</h1>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 uppercase tracking-wider text-[10px]">
                            {campaign.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">
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
                    <ImportCSVDialog campaignId={campaign.id}>
                        <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/5 hover:text-primary">
                            <FileUp className="mr-2 h-4 w-4" />
                            Import Data
                        </Button>
                    </ImportCSVDialog>
                    <CreateFamilyDialog campaignId={campaign.id}>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Family
                        </Button>
                    </CreateFamilyDialog>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionButton
                    href={`/admin/gifts?campaignId=${campaign.id}`}
                    icon={<Box className="h-4 w-4" />}
                    label="View All Gifts"
                />
                <QuickActionButton
                    href={`/admin/claims?campaignId=${campaign.id}`}
                    icon={<Heart className="h-4 w-4" />}
                    label="View All Claims"
                />

                <ImportCSVDialog campaignId={campaign.id}>
                    <Button variant="outline" className="h-12 justify-start gap-2 rounded-xl bg-card border-border hover:bg-primary/5 hover:text-primary transition-all">
                        <FileUp className="h-4 w-4" />
                        <span>Import Document</span>
                    </Button>
                </ImportCSVDialog>
                <Button variant="outline" className="h-12 justify-start gap-2 rounded-xl bg-card border-border hover:bg-primary/5 hover:text-primary transition-all" asChild>
                    <Link href={`/admin/campaigns/${campaign.id}/settings`}>
                        <Settings2 className="h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </Button>
            </div>
            <div className="flex gap-4 justify-center">
                <ExportButton
                    campaignId={campaign.id}
                    campaignName={campaign.name}
                    type="claims"
                    label="Export Claims"
                />
                <ExportButton
                    campaignId={campaign.id}
                    campaignName={campaign.name}
                    type="inventory"
                    label="Export Inventory"
                />
            </div>
            {/* Campaign Summary Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <SummaryCard
                    icon={<Users className="h-5 w-5 text-primary" />}
                    label="Families"
                    value={stats.totalFamilies.toString()}
                />
                <SummaryCard
                    icon={<Box className="h-5 w-5 text-primary" />}
                    label="Total Gifts"
                    value={stats.totalQuantity.toString()}
                />
                <SummaryCard
                    icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
                    label="Claimed Items"
                    value={stats.claimedQuantity.toString()}
                    progress={stats.percentComplete}
                />
            </div>

            {/* Families List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground uppercase">Participating Families</h2>
                    <span className="text-sm text-muted-foreground">{campaign.families.length} families added</span>
                </div>

                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <FamilyList families={campaign.families} />
                </div>
            </div>
        </div>
    );
}

function QuickActionButton({
    href,
    icon,
    label
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <Button variant="outline" className="h-12 justify-start gap-2 rounded-xl bg-card border-border hover:bg-primary/5 hover:text-primary transition-all" asChild>
            <Link href={href}>
                {icon}
                <span>{label}</span>
            </Link>
        </Button>
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
        <div className="flex flex-col gap-2 p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted border border-border">
                    {icon}
                </div>
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
            </div>
            <div className="flex items-end justify-between gap-4 pt-2">
                <span className="text-3xl font-bold text-foreground">{value}</span>
                {progress !== undefined && (
                    <div className="flex flex-col items-end gap-1 mb-1">
                        <span className="text-xs font-semibold text-primary">{progress}% complete</span>
                        <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
