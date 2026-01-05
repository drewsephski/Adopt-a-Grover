"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFamilyProgress, getAvailableQuantity, groupGiftsByPerson, isPersonFullyClaimed } from "@/lib/types";
import type { FamilyWithGifts, GiftWithClaims, PersonWithGifts } from "@/lib/types";
import {
    ExternalLink,
    Users,
    CheckCircle2,
    User,
    Gift,
    Heart
} from "lucide-react";
import { ClaimDialog } from "@/components/donor/claim-dialog";
import { ClaimFamilyDialog } from "@/components/donor/claim-family-dialog";

export function FamilyCard({ family }: { family: FamilyWithGifts }) {
    const stats = getFamilyProgress(family);
    const isComplete = stats.percentComplete === 100;
    const persons = groupGiftsByPerson(family);

    return (
        <Card className="overflow-hidden border-border/50 hover:border-primary/20 transition-all hover:shadow-md group bg-card">
            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {family.alias}
                    </CardTitle>
                    <Badge variant="outline" className="bg-background/50 font-mono text-[10px]">
                        {persons.length} {persons.length === 1 ? 'person' : 'people'}
                    </Badge>
                </div>
                {!isComplete && (
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-muted-foreground">
                            {stats.totalGifts - stats.claimedGifts} {stats.totalGifts - stats.claimedGifts === 1 ? 'gift' : 'gifts'} still needed
                        </p>
                        <ClaimFamilyDialog family={family} disabled={isComplete}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg h-8 px-4 text-xs font-bold text-primary hover:bg-primary/10 border-primary/20"
                            >
                                <Heart className="h-3.5 w-3.5 mr-1.5" />
                                Claim Items
                            </Button>
                        </ClaimFamilyDialog>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                    {persons.map((person: PersonWithGifts) => (
                        <PersonSection key={person.fullName} person={person} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function PersonSection({ person }: { person: PersonWithGifts }) {
    const isComplete = isPersonFullyClaimed(person);

    // Format person display name with role and age
    const getPersonDisplayName = (p: PersonWithGifts) => {
        const role = p.role ? p.role : "Person";
        const age = p.age ? `, ${p.age}` : "";
        return `${role}${age}`;
    };

    const displayName = getPersonDisplayName(person);

    return (
        <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-foreground">{displayName}</div>
                        {!isComplete && (
                            <div className="text-xs text-muted-foreground">
                                {person.gifts.filter((g: GiftWithClaims) => getAvailableQuantity(g) > 0).length} {person.gifts.filter((g: GiftWithClaims) => getAvailableQuantity(g) > 0).length === 1 ? 'item' : 'items'} left
                            </div>
                        )}
                    </div>
                </div>
                {isComplete ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                            <CheckCircle2 className="h-4 w-4" />
                            Complete
                        </div>
                    ) : null}
            </div>
            <div className="space-y-2.5 pl-5 border-l-2 border-muted">
                {person.gifts.map((gift: GiftWithClaims) => (
                    <GiftRow key={gift.id} gift={gift} />
                ))}
            </div>
        </div>
    );
}

function GiftRow({ gift }: { gift: GiftWithClaims }) {
    const available = getAvailableQuantity(gift);
    const isClaimed = available === 0;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground flex-1 min-w-0">
                    <Gift className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className={isClaimed ? "line-through text-muted-foreground" : ""}>{gift.name}</span>
                    {gift.productUrl && !isClaimed && (
                        <a
                            href={gift.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                            title="View product details"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {!isClaimed && (
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                            {available} {available === 1 ? 'needed' : 'needed'}
                        </span>
                    )}
                    {isClaimed ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-primary">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Claimed
                        </div>
                    ) : (
                        <ClaimDialog gift={gift}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-lg h-7 px-3 text-xs font-bold text-primary hover:bg-primary/10"
                            >
                                Claim Item
                            </Button>
                        </ClaimDialog>
                    )}
                </div>
            </div>
        </div>
    );
}
