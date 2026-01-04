"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFamilyProgress, getAvailableQuantity } from "@/lib/types";
import type { FamilyWithGifts, GiftWithClaims } from "@/lib/types";
import {
    ExternalLink,
    Users,
    CheckCircle2
} from "lucide-react";
import { ClaimDialog } from "@/components/donor/claim-dialog";
import { AdoptFamilyDialog } from "@/components/donor/adopt-family-dialog";

export function FamilyCard({ family }: { family: FamilyWithGifts }) {
    const stats = getFamilyProgress(family);
    const isComplete = stats.percentComplete === 100;

    return (
        <Card className={`group flex flex-col h-full border-border shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden rounded-3xl ${isComplete ? "opacity-75 bg-muted/50" : "bg-card"}`}>
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="p-2.5 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <Badge
                        variant="outline"
                        className={`font-bold text-[10px] uppercase tracking-wider ${isComplete
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-secondary/10 text-secondary-foreground border-secondary/20"
                            }`}
                    >
                        {isComplete ? "Fully Claimed" : `${stats.totalGifts - stats.claimedGifts} gifts left`}
                    </Badge>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{family.alias}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-muted-foreground uppercase tracking-widest">Progress</span>
                        <span className={isComplete ? "text-primary" : "text-foreground"}>{stats.percentComplete}%</span>
                    </div>
                    <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${isComplete ? "bg-primary" : "bg-secondary"
                                }`}
                            style={{ width: `${stats.percentComplete}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Shopping List</p>
                    <div className="space-y-3">
                        {family.gifts.map((gift) => (
                            <GiftRow key={gift.id} gift={gift} />
                        ))}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-6 border-t border-border bg-muted/50">
                {!isComplete ? (
                    <AdoptFamilyDialog family={family}>
                        <Button
                            className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-2xl h-12 font-bold shadow-lg shadow-border transition-all active:scale-[0.98]"
                        >
                            Adopt Entire Family
                        </Button>
                    </AdoptFamilyDialog>
                ) : (
                    <div className="flex items-center justify-center w-full h-12 gap-2 text-primary font-bold">
                        <CheckCircle2 className="h-5 w-5" />
                        Everything Claimed!
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}

function GiftRow({ gift }: { gift: GiftWithClaims }) {
    const available = getAvailableQuantity(gift);
    const isClaimed = available === 0;

    return (
        <div className={`group/item flex items-center justify-between p-3 rounded-2xl border transition-all ${isClaimed
            ? "bg-primary/10 border-primary/20 opacity-60"
            : "bg-card border-border hover:border-primary/20 hover:bg-primary/5"
            }`}>
            <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-bold truncate ${isClaimed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {gift.name}
                    </p>
                    {gift.productUrl && !isClaimed && (
                        <a
                            href={gift.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isClaimed ? (
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Fully Claimed</span>
                    ) : (
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {available} of {gift.quantity} available
                        </span>
                    )}
                </div>
            </div>

            {!isClaimed && (
                <ClaimDialog gift={gift}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl h-9 px-4 text-primary font-bold hover:bg-primary/10"
                    >
                        Claim
                    </Button>
                </ClaimDialog>
            )}

            {isClaimed && (
                <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
            )}
        </div>
    );
}
