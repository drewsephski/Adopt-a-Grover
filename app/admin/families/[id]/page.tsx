import { getFamilyById } from "@/lib/actions/family";
import { ManagePersonsDialog } from "@/components/admin/manage-persons-dialog";
import { PersonGiftsSection } from "@/components/admin/person-gifts-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    PlusCircle,
    CheckCircle2,
    Package,
    ArrowLeft,
    Users,
    Gift
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFamilyProgress } from "@/lib/types";
import { CreateGiftDialog } from "@/components/admin/create-gift-dialog";
import type { PersonWithGifts, GiftWithClaims } from "@/lib/types";

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

    // Add fullName to persons for compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const personsWithFullName = family.persons.map((p: any) => ({
        ...p,
        fullName: `${p.firstName} ${p.lastName}`
    })) as PersonWithGifts[];

    return (
        <div className="space-y-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/admin/campaigns" className="hover:text-primary transition-colors">Campaigns</Link>
                <span className="text-muted-foreground/30">/</span>
                <Link href={`/admin/campaigns/${family.campaignId}`} className="hover:text-primary transition-colors">{family.campaign.name}</Link>
                <span className="text-muted-foreground/30">/</span>
                <span className="text-foreground font-medium">{family.alias}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b border-border pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight uppercase">{family.alias}</h1>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 uppercase tracking-wider text-[10px]">
                            {stats.percentComplete === 100 ? 'Fully Claimed' : 'Progressing'}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">
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
                    <ManagePersonsDialog familyId={family.id} familyAlias={family.alias}>
                        <Button size="sm" variant="outline">
                            <Users className="mr-2 h-4 w-4" />
                            Manage People
                        </Button>
                    </ManagePersonsDialog>
                    <CreateGiftDialog familyId={family.id}>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Gift className="mr-2 h-4 w-4" />
                            Add Gift
                        </Button>
                    </CreateGiftDialog>
                </div>
            </div>

            {/* Family Stats */}
            <div className="grid gap-6 md:grid-cols-2">
                <SummaryCard
                    icon={<Package className="h-5 w-5 text-primary" />}
                    label="Gift Types"
                    value={stats.totalGifts.toString()}
                />
                <SummaryCard
                    icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
                    label="Items Claimed"
                    value={`${stats.claimedQuantity} of ${stats.totalQuantity}`}
                    progress={stats.percentComplete}
                />
            </div>

            {/* Persons and Gifts */}
            <PersonGiftsSection
                familyId={family.id}
                persons={personsWithFullName}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                unassignedGifts={family.gifts.filter((g: any) => !g.personId)}
                familyAlias={family.alias}
            />
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
