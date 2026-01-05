"use client";

import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    Trash2,
    Play,
    Archive,
    PauseCircle,
    Loader2,
    Settings
} from "lucide-react";
import { updateCampaignStatus, deleteCampaign } from "@/lib/actions/campaign";
import { CampaignStatus } from "@/lib/types";
import type { CampaignWithFamilies } from "@/lib/types";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface CampaignActionsProps {
    campaign: CampaignWithFamilies;
}

export function CampaignActions({ campaign }: CampaignActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    async function handleStatusUpdate(status: CampaignStatus) {
        setIsLoading(true);
        try {
            await updateCampaignStatus(campaign.id, status);
            toast.success(`Campaign ${status.toLowerCase()}ed`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to update status";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete() {
        setIsLoading(true);
        try {
            await deleteCampaign(campaign.id);
            toast.success("Campaign deleted");
            setShowDeleteDialog(false);
        } catch (error) {
            toast.error("Failed to delete campaign");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" size="icon" disabled={isLoading}>
                        <span className="sr-only">Open menu</span>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <MoreHorizontal className="h-4 w-4" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Campaign Management</DropdownMenuLabel>

                    <DropdownMenuItem asChild>
                        <Link href={`/admin/campaigns/${campaign.id}`}>
                            <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                            Manage Details
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {campaign.status === CampaignStatus.DRAFT && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate(CampaignStatus.ACTIVE)}>
                            <Play className="mr-2 h-4 w-4 text-primary" />
                            Activate Campaign
                        </DropdownMenuItem>
                    )}

                    {campaign.status === CampaignStatus.ACTIVE && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate(CampaignStatus.CLOSED)}>
                            <PauseCircle className="mr-2 h-4 w-4 text-secondary-foreground" />
                            Close Donations
                        </DropdownMenuItem>
                    )}

                    {(campaign.status === CampaignStatus.CLOSED || campaign.status === CampaignStatus.ACTIVE) && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate(CampaignStatus.ARCHIVED)}>
                            <Archive className="mr-2 h-4 w-4 text-muted-foreground" />
                            Archive Campaign
                        </DropdownMenuItem>
                    )}

                    {campaign.status === CampaignStatus.ARCHIVED && (
                        <DropdownMenuItem onClick={() => handleStatusUpdate(CampaignStatus.DRAFT)}>
                            <Play className="mr-2 h-4 w-4 text-muted-foreground" />
                            Restore to Draft
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Campaign
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the campaign &quot;{campaign.name}&quot; and all associated families, gifts, and donor claims. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading} size="sm">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            size="sm"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Campaign
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
