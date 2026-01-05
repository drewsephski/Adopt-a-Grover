import { getCampaigns } from "@/lib/actions/campaign";
import { CampaignList } from "@/components/admin/campaign-list";
import { CreateEventDialog } from "@/components/admin/create-event-dialog";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default async function AdminCampaignsPage() {
    const campaigns = await getCampaigns();

    return (
        <div className="space-y-6 sm:space-y-8">
            <AdminBreadcrumbs />
            <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Campaigns</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage your seasonal donation drives.</p>
                </div>
                <CreateEventDialog>
                    <Button size="default" className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Event
                    </Button>
                </CreateEventDialog>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <CampaignList initialCampaigns={campaigns} />
            </div>
        </div>
    );
}
