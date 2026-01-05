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
    Edit,
    Loader2,
    FileText
} from "lucide-react";
import { deleteGift } from "@/lib/actions/gift";
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
import type { GiftWithClaims } from "@/lib/types";
import { EditGiftDialog } from "./edit-gift-dialog";

interface GiftActionsProps {
    gift: GiftWithClaims;
}

export function GiftActions({ gift }: GiftActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);

    async function handleDelete() {
        setIsLoading(true);
        try {
            await deleteGift(gift.id);
            toast.success("Gift removed");
            setShowDeleteDialog(false);
        } catch {
            toast.error("Failed to remove gift");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                        <span className="sr-only">Open menu</span>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <MoreHorizontal className="h-4 w-4" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                    <DropdownMenuLabel className="uppercase text-[10px] font-bold tracking-wider text-muted-foreground">Actions</DropdownMenuLabel>

                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                        Edit Details
                    </DropdownMenuItem>

                    <DropdownMenuItem disabled={gift.claims.length === 0}>
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        View Claims ({gift.claims.length})
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Gift
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditGiftDialog
                gift={gift}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold text-foreground">Remove this gift?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground leading-relaxed">
                            This will permanently remove the gift &quot;{gift.name}&quot; and any claims already made for it. Donors who claimed this will not be notified by the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel disabled={isLoading} className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e: any) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive hover:bg-destructive/90 text-background rounded-xl font-bold shadow-lg shadow-destructive/20 transition-all active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Remove Gift
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
