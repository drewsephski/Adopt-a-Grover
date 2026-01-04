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
    Settings2,
    Loader2,
    Edit2,
    Users
} from "lucide-react";
import { deleteFamily } from "@/lib/actions/family";
import { EditFamilyDialog } from "./edit-family-dialog";
import { ManagePersonsDialog } from "./manage-persons-dialog";
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
import type { FamilyWithGifts } from "@/lib/types";

interface FamilyActionsProps {
    family: FamilyWithGifts;
}

export function FamilyActions({ family }: FamilyActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    async function handleDelete() {
        setIsLoading(true);
        try {
            await deleteFamily(family.id);
            toast.success("Family removed from campaign");
            setShowDeleteDialog(false);
        } catch {
            toast.error("Failed to remove family");
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
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                    <DropdownMenuItem asChild>
                        <Link href={`/admin/families/${family.id}`}>
                            <Settings2 className="mr-2 h-4 w-4 text-muted-foreground" />
                            Manage Gifts
                        </Link>
                    </DropdownMenuItem>

                    <EditFamilyDialog family={family}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit2 className="mr-2 h-4 w-4 text-muted-foreground" />
                            Edit Details
                        </DropdownMenuItem>
                    </EditFamilyDialog>

                    <DropdownMenuSeparator />

                    <ManagePersonsDialog familyId={family.id} familyAlias={family.alias}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            Manage People
                        </DropdownMenuItem>
                    </ManagePersonsDialog>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Family
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove &quot;{family.alias}&quot; and all their gift listings and claims from the campaign. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Remove Family
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
