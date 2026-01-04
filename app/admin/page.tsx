import { getActiveCampaign } from "@/lib/actions/campaign";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Gift,
    Users,
    Heart,
    AlertCircle,
    TrendingUp,
    Calendar,
    PlusCircle,
    History
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {
    Claim,
    FamilyWithGifts,
    getCampaignProgress,
    getFamilyProgress,
    GiftWithClaims
} from "@/lib/types";

export default async function AdminDashboardPage() {
    const activeCampaign = await getActiveCampaign();

    if (!activeCampaign) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-primary/10 p-6 rounded-full mb-6">
                    <Calendar className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">No Active Campaign</h2>
                <p className="text-muted-foreground max-w-sm mb-8">
                    Welcome to Adopt a Grover! Start by creating a new campaign for your donation drive.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg">
                        <Link href="/admin/campaigns">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Manage Campaigns
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/admin/past-events">
                            <History className="mr-2 h-4 w-4" />
                            View Past Events
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const progress = getCampaignProgress(activeCampaign);

    // Get families that need attention (incomplete)
    const incompleteFamilies = activeCampaign.families
        .map((f: FamilyWithGifts) => ({ ...f, stats: getFamilyProgress(f) }))
        .filter((f: FamilyWithGifts & { stats: ReturnType<typeof getFamilyProgress> }) => f.stats.percentComplete < 100)
        .sort((a: FamilyWithGifts & { stats: ReturnType<typeof getFamilyProgress> }, b: FamilyWithGifts & { stats: ReturnType<typeof getFamilyProgress> }) => a.stats.percentComplete - b.stats.percentComplete)
        .slice(0, 5);

    // Get recent claims across all gifts
    const recentClaims = activeCampaign.families
        .flatMap((f: FamilyWithGifts) => f.gifts.flatMap((g: GiftWithClaims) => g.claims.map((c: Claim) => ({
            ...c,
            giftName: g.name,
            familyAlias: f.alias
        }))))
        .sort((a: Claim & { giftName: string; familyAlias: string }, b: Claim & { giftName: string; familyAlias: string }) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight uppercase">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of the &quot;{activeCampaign.name}&quot; campaign.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 py-1 px-3">
                        <span className="mr-1.5 h-2 w-2 rounded-full bg-primary" />
                        Active
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/campaigns">Manage</Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Completion"
                    value={`${progress.percentComplete}%`}
                    description={`${progress.claimedQuantity} of ${progress.totalQuantity} items claimed`}
                    icon={<TrendingUp className="h-5 w-5 text-primary" />}
                />
                <StatCard
                    title="Families"
                    value={progress.totalFamilies.toString()}
                    description="Participating families"
                    icon={<Users className="h-5 w-5 text-primary" />}
                />
                <StatCard
                    title="Gifts"
                    value={progress.totalGifts.toString()}
                    description="Total gift listing items"
                    icon={<Gift className="h-5 w-5 text-primary" />}
                />
                <StatCard
                    title="Claims"
                    value={progress.claimedQuantity.toString()}
                    description="Total quantities claimed"
                    icon={<Heart className="h-5 w-5 text-primary" />}
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Needs Attention */}
                <Card className="shadow-sm border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-semibold">Needs Attention</CardTitle>
                            <CardDescription>Families with the most unclaimed gifts.</CardDescription>
                        </div>
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 pt-4">
                            {incompleteFamilies.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic text-center py-4">All families are fully claimed! 🎉</p>
                            ) : (
                                incompleteFamilies.map((family: FamilyWithGifts & { stats: ReturnType<typeof getFamilyProgress> }) => (
                                    <div key={family.id} className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-foreground">{family.alias}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {family.stats.claimedGifts} of {family.stats.totalGifts} gifts claimed
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full"
                                                    style={{ width: `${family.stats.percentComplete}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-muted-foreground w-8 text-right">
                                                {family.stats.percentComplete}%
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-8">
                            <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10" asChild>
                                <Link href="/admin/families">View all families</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="shadow-sm border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-semibold">Recent Claims</CardTitle>
                            <CardDescription>The latest gift claims across the campaign.</CardDescription>
                        </div>
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 pt-4">
                            {recentClaims.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic text-center py-4">No claims yet.</p>
                            ) : (
                                recentClaims.map((claim: Claim & { giftName: string; familyAlias: string }) => (
                                    <div key={claim.id} className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-foreground">
                                                {claim.donorName} <span className="text-muted-foreground font-normal">claimed</span> {claim.giftName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                For {claim.familyAlias} • {format(claim.createdAt, "MMM d, h:mm a")}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground border-0">
                                            Qty: {claim.quantity}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-8">
                            <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10" asChild>
                                <Link href="/admin/claims">View all claims</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    description,
    icon
}: {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <Card className="shadow-sm border-border overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
                {icon}
            </div>
            <CardHeader className="pb-2 space-y-0">
                <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</CardDescription>
                <CardTitle className="text-3xl font-bold text-foreground">{value}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
