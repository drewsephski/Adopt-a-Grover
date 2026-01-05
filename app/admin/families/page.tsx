import { getActiveCampaign } from "@/lib/actions/campaign";
import { FamilyList } from "@/components/admin/family-list";
import { CreateFamilyDialog } from "@/components/admin/create-family-dialog";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminFamiliesPage() {
    const activeCampaign = await getActiveCampaign();

    if (!activeCampaign) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-semibold text-foreground">No Active Campaign</h2>
                <p className="text-muted-foreground max-w-sm mt-2">
                    Create or activate a campaign first to manage families.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <AdminBreadcrumbs />
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight uppercase">Families</h1>
                    <p className="text-muted-foreground">Manage participating families for &quot;{activeCampaign.name}&quot;.</p>
                </div>
                <CreateFamilyDialog campaignId={activeCampaign.id}>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Family
                    </Button>
                </CreateFamilyDialog>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <FamilyList families={activeCampaign.families} />
            </div>
        </div>
    );
}
