"use client";

import { FamilyCard } from "./family-card";
import type { CampaignWithFamilies } from "@/lib/types";

export function FamilyGrid({ campaign }: { campaign: CampaignWithFamilies }) {
    if (campaign.families.length === 0) {
        return (
            <div className="text-center py-20 px-4">
                <p className="text-slate-500 italic">No families are currently listed. Please check back later.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaign.families.map((family) => (
                <FamilyCard key={family.id} family={family} />
            ))}
        </div>
    );
}
