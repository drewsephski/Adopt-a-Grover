"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { removeClaim } from "@/lib/actions/claim";
import { toast } from "sonner";
import { format } from "date-fns";
import { Trash2, User, Mail, Gift, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ClaimWithGift } from "@/lib/types";

interface ClaimListProps {
    claims: ClaimWithGift[];
}

export function ClaimList({ claims }: ClaimListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function handleDelete(claimId: string) {
        setDeletingId(claimId);
        try {
            await removeClaim(claimId);
            toast.success("Claim removed successfully. The gift is now available again.");
        } catch {
            toast.error("Failed to remove claim");
        } finally {
            setDeletingId(null);
        }
    }

    if (claims.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <Gift className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">No claims recorded yet.</p>
                <p className="text-muted-foreground/70 text-xs mt-1 italic">Once donors start claiming gifts, they will appear here.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-muted/50">
                    <TableHead className="w-[200px] uppercase text-[10px] font-bold tracking-wider text-foreground">Donor</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-wider text-foreground">Gift Item</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-wider text-foreground">Family</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-wider text-foreground">Qty</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-wider text-foreground">Date</TableHead>
                    <TableHead className="text-right uppercase text-[10px] font-bold tracking-wider text-foreground">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {claims.map((claim) => (
                    <TableRow key={claim.id} className="group transition-colors hover:bg-muted/30">
                        <TableCell>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 font-bold text-foreground">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    {claim.donorName}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {claim.donorEmail}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                            {claim.gift.name}
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                                {claim.gift.family.alias}
                            </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                            {claim.quantity}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                            {format(claim.createdAt, "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell className="text-right">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        disabled={deletingId === claim.id}
                                    >
                                        {deletingId === claim.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-2xl font-bold text-foreground">Remove donor claim?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground">
                                            This will remove {claim.donorName}&apos;s claim for {claim.quantity}x &quot;{claim.gift.name}&quot;.
                                            The gift will immediately become available for other donors.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="pt-4">
                                        <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDelete(claim.id)}
                                            className="bg-destructive hover:bg-destructive/90 text-background rounded-xl font-bold shadow-lg shadow-destructive/20 transition-all active:scale-[0.98]"
                                        >
                                            Remove Claim
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
