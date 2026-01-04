import { getCampaigns } from "@/lib/actions/campaign";
import { CampaignList } from "@/components/admin/campaign-list";
import { CreateCampaignDialog } from "@/components/admin/create-campaign-dialog";
import { PlusCircle } from "lucide-react";

export default async function AdminCampaignsPage() {
    const campaigns = await getCampaigns();

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Campaigns</h1>
                    <p className="text-slate-500">Manage your seasonal donation drives.</p>
                </div>
                <CreateCampaignDialog>
                    <button className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Campaign
                    </button>
                </CreateCampaignDialog>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <CampaignList initialCampaigns={campaigns} />
            </div>
        </div>
    );
}
