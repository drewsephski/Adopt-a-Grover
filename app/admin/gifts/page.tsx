import { getActiveCampaign } from "@/lib/actions/campaign";
import { getGiftsByCampaign } from "@/lib/actions/gift";
import { GiftList } from "@/components/admin/gift-list";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export default async function AdminGiftsPage() {
    const activeCampaign = await getActiveCampaign();

    if (!activeCampaign) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <p className="text-muted-foreground">No active campaign to view gifts for.</p>
            </div>
        );
    }

    const gifts = await getGiftsByCampaign(activeCampaign.id);

    return (
        <div className="space-y-8">
            <AdminBreadcrumbs />
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight uppercase">Gift Inventory</h1>
                    <p className="text-muted-foreground">Manage all gifts listed for &quot;{activeCampaign.name}&quot; across all families.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <ShoppingCart className="mr-1 h-3 w-3" />
                        {gifts.length} total items
                    </Badge>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <GiftList gifts={gifts} showFamily={true} />
            </div>
        </div>
    );
}
