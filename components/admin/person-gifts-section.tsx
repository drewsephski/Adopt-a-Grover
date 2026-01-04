"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GiftList } from "@/components/admin/gift-list";
import { CreateGiftDialog } from "@/components/admin/create-gift-dialog";
import { Plus, User, Gift } from "lucide-react";
import type { GiftWithClaims } from "@/lib/types";

interface Person {
    id: string;
    firstName: string;
    lastName: string;
    role?: string | null;
    age?: number | null;
    gifts: GiftWithClaims[];
    fullName?: string;
}

interface PersonGiftsSectionProps {
    familyId: string;
    persons: Person[];
    unassignedGifts: GiftWithClaims[];
    familyAlias: string;
}

export function PersonGiftsSection({ familyId, persons, unassignedGifts, familyAlias }: PersonGiftsSectionProps) {
    const [expandedPersons, setExpandedPersons] = useState<Set<string>>(new Set());

    const togglePerson = (personId: string) => {
        setExpandedPersons(prev => {
            const newSet = new Set(prev);
            if (newSet.has(personId)) {
                newSet.delete(personId);
            } else {
                newSet.add(personId);
            }
            return newSet;
        });
    };

    return (
        <div className="space-y-6">
            {/* Persons with their gifts */}
            {persons.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground uppercase flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Family Members
                    </h2>
                    <div className="grid gap-4">
                        {persons.map((person) => {
                            const giftCount = person.gifts.length;
                            const isExpanded = expandedPersons.has(person.id);

                            return (
                                <Card key={person.id} className="border border-border bg-card overflow-hidden">
                                    {/* Person Header */}
                                    <div className="p-4 border-b border-border bg-muted/30">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-primary/10">
                                                    <User className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground text-lg">
                                                        {person.firstName} {person.lastName}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {person.role && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {person.role}
                                                            </Badge>
                                                        )}
                                                        {person.age && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Age {person.age}
                                                            </Badge>
                                                        )}
                                                        <Badge variant="secondary" className="text-xs">
                                                            <Gift className="h-3 w-3 mr-1" />
                                                            {giftCount} {giftCount === 1 ? 'gift' : 'gifts'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CreateGiftDialog familyId={familyId} personId={person.id} personName={`${person.firstName} ${person.lastName}`}>
                                                    <Button size="sm" variant="outline" className="gap-2">
                                                        <Plus className="h-4 w-4" />
                                                        Add Gift
                                                    </Button>
                                                </CreateGiftDialog>
                                                {giftCount > 0 && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => togglePerson(person.id)}
                                                    >
                                                        {isExpanded ? 'Hide' : 'Show'} Gifts
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Person's Gifts */}
                                    {isExpanded && giftCount > 0 && (
                                        <div className="p-0">
                                            <div className="rounded-lg overflow-hidden border-0">
                                                <GiftList gifts={person.gifts} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty state for person */}
                                    {isExpanded && giftCount === 0 && (
                                        <div className="p-8 text-center">
                                            <Gift className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                                            <p className="text-sm text-muted-foreground">No gifts added yet</p>
                                            <p className="text-xs text-muted-foreground/70 mt-1">Add gift ideas for {person.firstName}</p>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Unassigned Gifts */}
            {unassignedGifts.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground uppercase flex items-center gap-2">
                        <Gift className="h-5 w-5" />
                        Unassigned Gifts
                    </h2>
                    <Card className="border border-border bg-card overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <p className="text-sm text-muted-foreground">
                                These gifts are not assigned to any specific family member
                            </p>
                        </div>
                        <div className="p-0">
                            <GiftList gifts={unassignedGifts} />
                        </div>
                    </Card>
                </div>
            )}

            {/* No persons or gifts */}
            {persons.length === 0 && unassignedGifts.length === 0 && (
                <Card className="border border-border bg-card p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-muted">
                            <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground">No family members yet</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Add people to this family to start managing their gift lists. Each person can have their own set of requested gifts.
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
