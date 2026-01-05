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
import { Card } from "@/components/ui/card";
import { removeClaim } from "@/lib/actions/claim";
import { toast } from "sonner";
import { format } from "date-fns";
import { Trash2, User, Mail, Gift, Loader2, Calendar } from "lucide-react";
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
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl mb-4 shadow-sm">
                    <Gift className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No claims recorded yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                    Once donors start claiming gifts, they will appear here.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block rounded-lg border overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="font-semibold">Donor</TableHead>
                            <TableHead className="font-semibold">Gift Item</TableHead>
                            <TableHead className="font-semibold">Family</TableHead>
                            <TableHead className="font-semibold">Qty</TableHead>
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
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
            </div>

            {/* Mobile Card View - Shown only on mobile */}
            <div className="md:hidden space-y-3">
                {claims.map((claim) => (
                    <Card key={claim.id} className="overflow-hidden hover:shadow-md transition-all duration-200 border-border/50">
                        <div className="p-4 space-y-2">
                            {/* Header with Donor Info */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="font-semibold text-base truncate">{claim.donorName}</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        <span className="truncate">{claim.donorEmail}</span>
                                    </div>
                                </div>
                                <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider shrink-0">
                                    {claim.gift.family.alias}
                                </Badge>
                            </div>

                            {/* Gift Info */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Gift</span>
                                    <span className="text-sm font-semibold text-foreground truncate ml-2">{claim.gift.name}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Quantity</span>
                                    <span className="text-sm font-bold text-foreground">{claim.quantity}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Date</span>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {format(claim.createdAt, "MMM d, h:mm a")}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Actions Section */}
                        <div className="px-4 bg-muted/30 max-w-md mx-auto">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        disabled={deletingId === claim.id}
                                    >
                                        {deletingId === claim.id ? (
                                            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Removing...</>
                                        ) : (
                                            <><Trash2 className="h-4 w-4 mr-2" />Remove Claim</>
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
                        </div>
                    </Card>
                ))}
            </div>
        </>
    );
}
