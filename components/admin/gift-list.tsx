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
import { getAvailableQuantity, getGiftStatus, getClaimedQuantity } from "@/lib/types";
import type { GiftWithClaims } from "@/lib/types";
import { GiftActions } from "./gift-actions";
import { ExternalLink, ShoppingCart } from "lucide-react";

interface GiftListProps {
    gifts: GiftWithClaims[];
}

export function GiftList({ gifts }: GiftListProps) {
    if (gifts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No gifts listed yet.</p>
                <p className="text-muted-foreground/70 text-xs mt-1">Add items that donors can claim for this family.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-muted/50">
                    <TableHead className="w-[300px]">Gift Name</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Claimed</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {gifts.map((gift) => {
                    const claimedTotal = getClaimedQuantity(gift);
                    const available = getAvailableQuantity(gift);
                    const status = getGiftStatus(gift);

                    return (
                        <TableRow key={gift.id} className="group transition-colors hover:bg-muted/30">
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground">{gift.name}</span>
                                        {gift.productUrl && (
                                            <a
                                                href={gift.productUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                                title="View product"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                    {gift.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px] font-normal" title={gift.description}>
                                            {gift.description}
                                        </p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                                {gift.quantity}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className={`text - sm font - semibold ${claimedTotal > 0 ? 'text-primary' : 'text-muted-foreground'} `}>
                                        {claimedTotal}
                                    </span>
                                    {claimedTotal > 0 && (
                                        <span className="text-[10px] text-muted-foreground font-normal">
                                            from {gift.claims.length} {gift.claims.length === 1 ? 'donor' : 'donors'}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <GiftBadge status={status} />
                                    <span className="text-xs text-muted-foreground">
                                        {available} left
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <GiftActions gift={gift} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

function GiftBadge({ status }: { status: "available" | "partial" | "claimed" }) {
    const styles = {
        available: "bg-primary/10 text-primary border-primary/20",
        partial: "bg-secondary/10 text-secondary-foreground border-secondary/20",
        claimed: "bg-muted text-muted-foreground border-border",
    };

    const labels = {
        available: "Open",
        partial: "Partial",
        claimed: "Full",
    };

    return (
        <Badge variant="outline" className={`${styles[status]} font - medium text - [10px] py - 0 px - 1.5 uppercase`}>
            {labels[status]}
        </Badge>
    );
}
