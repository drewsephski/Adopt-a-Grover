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
import { Card } from "@/components/ui/card";
import { getAvailableQuantity, getGiftStatus, getClaimedQuantity } from "@/lib/types";
import type { GiftWithClaims, GiftWithFamily } from "@/lib/types";
import { GiftActions } from "./gift-actions";
import { ExternalLink, ShoppingCart, User } from "lucide-react";

interface GiftListProps {
    gifts: (GiftWithClaims | GiftWithFamily)[];
    showFamily?: boolean;
}

export function GiftList({ gifts, showFamily = false }: GiftListProps) {
    if (gifts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl mb-4 shadow-sm">
                    <ShoppingCart className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No gifts listed yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                    Add items that donors can claim for this family.
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
                            {showFamily && <TableHead className="font-semibold">Family</TableHead>}
                            <TableHead className="font-semibold">Gift Name</TableHead>
                            <TableHead className="font-semibold">Required</TableHead>
                            <TableHead className="font-semibold">Claimed</TableHead>
                            <TableHead className="font-semibold">Availability</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {gifts.map((gift) => {
                            const claimedTotal = getClaimedQuantity(gift);
                            const available = getAvailableQuantity(gift);
                            const status = getGiftStatus(gift);
                            // Get person name if gift is associated with a person
                            const personName = "person" in gift && gift.person
                                ? gift.person.firstName
                                : null;

                            return (
                                <TableRow key={gift.id} className="group transition-colors hover:bg-muted/30">
                                    {showFamily && (
                                        <TableCell className="font-medium text-primary">
                                            {"family" in gift ? (gift as GiftWithFamily).family?.alias : "N/A"}
                                        </TableCell>
                                    )}
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
                                            {personName && (
                                                <div className="flex items-center gap-1.5 opacity-80 mt-1">
                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-500/5 text-blue-500 border-blue-500/20 font-medium">
                                                        <User className="h-3 w-3 mr-1" />
                                                        {personName}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground">
                                        {gift.quantity}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold {claimedTotal > 0 ? 'text-primary' : 'text-muted-foreground'}">
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
            </div>

            {/* Mobile Card View - Shown only on mobile */}
            <div className="md:hidden space-y-4">
                {gifts.map((gift) => {
                    const claimedTotal = getClaimedQuantity(gift);
                    const available = getAvailableQuantity(gift);
                    const status = getGiftStatus(gift);
                    const personName = "person" in gift && gift.person
                        ? gift.person.firstName
                        : null;

                    return (
                        <Card key={gift.id} className="overflow-hidden hover:shadow-md transition-all duration-200 border-border/50">
                            <div className="p-4 space-y-3">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-base truncate">{gift.name}</h3>
                                            {gift.productUrl && (
                                                <a
                                                    href={gift.productUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                                                    title="View product"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                        {showFamily && "family" in gift && (
                                            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider w-fit">
                                                {(gift as GiftWithFamily).family?.alias}
                                            </Badge>
                                        )}
                                    </div>
                                    <GiftBadge status={status} />
                                </div>

                                {/* Description */}
                                {gift.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2" title={gift.description}>
                                        {gift.description}
                                    </p>
                                )}

                                {/* Person Badge */}
                                {personName && (
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="outline" className="text-sm px-2 py-1 text-blue-500 border-blue-500/20 font-medium">
                                            <User className="h-3 w-3 mr-1" />
                                            {personName}
                                        </Badge>
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-muted/30 rounded-lg p-2">
                                        <div className="text-xs text-muted-foreground mb-1">Required</div>
                                        <div className="font-bold text-foreground">{gift.quantity}</div>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-2">
                                        <div className="text-xs text-muted-foreground mb-1">Claimed</div>
                                        <div className={`font-bold ${claimedTotal > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {claimedTotal}
                                        </div>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-2">
                                        <div className="text-xs text-muted-foreground mb-1">Available</div>
                                        <div className="font-bold text-foreground">{available}</div>
                                    </div>
                                </div>

                                {/* Donor Info */}
                                {claimedTotal > 0 && (
                                    <div className="text-xs text-muted-foreground text-center">
                                        From {gift.claims.length} {gift.claims.length === 1 ? 'donor' : 'donors'}
                                    </div>
                                )}
                            </div>
                            
                            {/* Actions Section */}
                            <div className="px-4 max-w-fit">
                                <GiftActions gift={gift} />
                            </div>
                        </Card>
                    );
                })}
            </div>
        </>
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
        <Badge variant="outline" className={`${styles[status]} font-medium text-[10px] py-0 px-1.5 uppercase`}>
            {labels[status]}
        </Badge>
    );
}
