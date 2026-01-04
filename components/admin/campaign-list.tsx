"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CampaignActions } from "@/components/admin/campaign-actions";
import { getCampaignProgress } from "@/lib/types";
import type { CampaignWithFamilies } from "@/lib/types";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CampaignListProps {
    initialCampaigns: CampaignWithFamilies[];
}

const CAMPAIGN_STATUS = {
    DRAFT: "DRAFT",
    ACTIVE: "ACTIVE",
    CLOSED: "CLOSED",
    ARCHIVED: "ARCHIVED",
} as const;

export function CampaignList({ initialCampaigns }: CampaignListProps) {
    if (initialCampaigns.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-slate-500 mb-4">No campaigns found.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-slate-50/50">
                    <TableHead className="w-[300px] uppercase text-[10px] font-bold tracking-wider">Campaign Name</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-wider">Status</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-wider">Progress</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-wider">Created</TableHead>
                    <TableHead className="text-right uppercase text-[10px] font-bold tracking-wider">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {initialCampaigns.map((campaign) => {
                    const stats = getCampaignProgress(campaign);
                    return (
                        <TableRow key={campaign.id} className="group transition-colors hover:bg-slate-50/30">
                            <TableCell className="font-medium">
                                <Link
                                    href={`/admin/campaigns/${campaign.id}`}
                                    className="flex items-center gap-2 text-slate-900 hover:text-indigo-600 transition-colors"
                                >
                                    {campaign.name}
                                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={campaign.status} />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${stats.percentComplete === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                                                }`}
                                            style={{ width: `${stats.percentComplete}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-slate-600">
                                        {stats.percentComplete}%
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-slate-500 text-xs">
                                {format(campaign.createdAt, "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                                <CampaignActions campaign={campaign} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

function StatusBadge({ status }: { status: CampaignWithFamilies['status'] }) {
    const styles: Record<string, string> = {
        [CAMPAIGN_STATUS.DRAFT]: "bg-slate-100 text-slate-600 border-slate-200",
        [CAMPAIGN_STATUS.ACTIVE]: "bg-emerald-50 text-emerald-700 border-emerald-200",
        [CAMPAIGN_STATUS.CLOSED]: "bg-amber-50 text-amber-700 border-amber-200",
        [CAMPAIGN_STATUS.ARCHIVED]: "bg-rose-50 text-rose-700 border-rose-200",
    };

    return (
        <Badge variant="outline" className={`${styles[status as string] || styles[CAMPAIGN_STATUS.DRAFT]} font-medium text-[10px] uppercase tracking-wider`}>
            {status === CAMPAIGN_STATUS.ACTIVE && (
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
            {status}
        </Badge>
    );
}
