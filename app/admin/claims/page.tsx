import { getActiveCampaign } from "@/lib/actions/campaign";
import { getClaimsByCampaign } from "@/lib/actions/claim";
import { ClaimList } from "@/components/admin/claim-list";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

export default async function AdminClaimsPage() {
    const activeCampaign = await getActiveCampaign();

    if (!activeCampaign) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <p className="text-muted-foreground">No active campaign to view claims for.</p>
            </div>
        );
    }

    const claims = await getClaimsByCampaign(activeCampaign.id);

    return (
        <div className="space-y-8">
            <AdminBreadcrumbs />
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight uppercase">Donations &amp; Claims</h1>
                    <p className="text-muted-foreground">Track all items claimed by donors for &quot;{activeCampaign.name}&quot;.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <Heart className="mr-1 h-3 w-3 fill-primary text-primary" />
                        {claims.length} total claims
                    </Badge>
                </div>
            </div>

            <ClaimList claims={claims} />
        </div>
    );
}
