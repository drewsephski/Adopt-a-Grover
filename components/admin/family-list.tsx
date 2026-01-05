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
import { getFamilyProgress } from "@/lib/types";
import type { FamilyWithGifts } from "@/lib/types";
import { FamilyActions } from "./family-actions";
import Link from "next/link";
import { ChevronRight, Gift, Package } from "lucide-react";

interface FamilyListProps {
    families: FamilyWithGifts[];
}

export function FamilyList({ families }: FamilyListProps) {
    if (families.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl mb-4 shadow-sm">
                    <Gift className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No families yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                    Start by adding families to organize and track gift donations.
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
                            <TableHead className="font-semibold">Family Alias</TableHead>
                            <TableHead className="font-semibold">Gift Status</TableHead>
                            <TableHead className="font-semibold">Donation Progress</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {families.map((family) => {
                            const stats = getFamilyProgress(family);
                            const isComplete = stats.percentComplete === 100;

                            return (
                                <TableRow key={family.id} className="group transition-colors hover:bg-muted/30">
                                    <TableCell className="font-medium">
                                        <Link
                                            href={`/admin/families/${family.id}`}
                                            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                                        >
                                            <span className="truncate max-w-[120px] sm:max-w-none">{family.alias}</span>
                                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            <Badge variant="outline" className="bg-background font-normal">
                                                <Package className="h-3 w-3 mr-1.5" />
                                                {stats.totalGifts} Types
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {stats.claimedGifts} claimed
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-2.5 w-32 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        isComplete ? 'bg-green-500' : 'bg-primary'
                                                    }`}
                                                    style={{ width: `${stats.percentComplete}%` }}
                                                />
                                            </div>
                                            <span className={`text-sm font-semibold tabular-nums min-w-[3ch] ${
                                                isComplete ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'
                                            }`}>
                                                {stats.percentComplete}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <FamilyActions family={family} />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View - Shown only on mobile */}
            <div className="md:hidden space-y-4">
                {families.map((family) => {
                    const stats = getFamilyProgress(family);
                    const isComplete = stats.percentComplete === 100;

                    return (
                        <Card key={family.id} className="overflow-hidden hover:shadow-md transition-all duration-200 border-border/50">
                            <Link
                                href={`/admin/families/${family.id}`}
                                className="block p-4 space-y-3 active:bg-muted/50 transition-colors"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base truncate mb-1.5">
                                            {family.alias}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <Package className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span>{stats.totalGifts} {stats.totalGifts === 1 ? 'type' : 'types'}</span>
                                            </div>
                                            <span className="text-muted-foreground/50">•</span>
                                            <span>{stats.claimedGifts} claimed</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                                </div>

                                {/* Progress Section */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground font-medium">Progress</span>
                                        <span className={`font-bold tabular-nums ${
                                            isComplete ? 'text-green-600 dark:text-green-500' : 'text-foreground'
                                        }`}>
                                            {stats.percentComplete}%
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden shadow-inner">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                isComplete 
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                                    : 'bg-gradient-to-r from-primary to-primary/80'
                                            }`}
                                            style={{ width: `${stats.percentComplete}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Status Badge */}
                                {isComplete && (
                                    <div className="flex items-center gap-1.5">
                                        <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-300/50 dark:border-green-700/50 hover:bg-green-500/15 text-xs font-medium">
                                            <span className="mr-1">✓</span>
                                            Fully Funded
                                        </Badge>
                                    </div>
                                )}
                            </Link>
                            
                            {/* Actions Section */}
                            <div className="px-4">
                                <FamilyActions family={family} />
                            </div>
                        </Card>
                    );
                })}
            </div>
        </>
    );
}
