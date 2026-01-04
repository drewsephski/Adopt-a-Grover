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
import { getFamilyProgress } from "@/lib/types";
import type { FamilyWithGifts } from "@/lib/types";
import { FamilyActions } from "./family-actions";
import Link from "next/link";
import { ChevronRight, Gift } from "lucide-react";

interface FamilyListProps {
    families: FamilyWithGifts[];
}

export function FamilyList({ families }: FamilyListProps) {
    if (families.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <Gift className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">No families added yet.</p>
                <p className="text-slate-400 text-xs mt-1">Add families to start listing gifts.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-slate-50/50">
                    <TableHead className="w-[300px]">Family Alias</TableHead>
                    <TableHead>Gift Status</TableHead>
                    <TableHead>Donation Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {families.map((family) => {
                    const stats = getFamilyProgress(family);
                    const isComplete = stats.percentComplete === 100;

                    return (
                        <TableRow key={family.id} className="group transition-colors hover:bg-slate-50/30 font-medium">
                            <TableCell>
                                <Link
                                    href={`/admin/families/${family.id}`}
                                    className="flex items-center gap-2 text-slate-900 hover:text-indigo-600 transition-colors"
                                >
                                    {family.alias}
                                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-slate-50 text-slate-600 font-normal">
                                        {stats.totalGifts} Gift Types
                                    </Badge>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-xs text-slate-500">
                                        {stats.claimedGifts} of {stats.totalGifts} types claimed
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'
                                                }`}
                                            style={{ width: `${stats.percentComplete}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-semibold ${isComplete ? 'text-emerald-600' : 'text-slate-600'}`}>
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
    );
}
