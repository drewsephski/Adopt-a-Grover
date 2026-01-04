"use client";

import { useState } from "react";
import { PAST_EVENTS, ArchiveFamily } from "@/lib/archive-data";
import {
    Search,
    Users,
    History,
    User,
    Gift
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/admin/export-button";

export default function PastEventsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedYear, setSelectedYear] = useState("2025");

    const campaign = PAST_EVENTS.find(c => c.year === selectedYear);

    const filteredFamilies = campaign?.families.filter(f => {
        const searchLower = searchQuery.toLowerCase();
        const matchesFamily = f.alias.toLowerCase().includes(searchLower);
        const matchesMember = f.members.some(m =>
            m.relation.toLowerCase().includes(searchLower) ||
            m.claims.some(c =>
                c.donor.toLowerCase().includes(searchLower) ||
                c.comment.toLowerCase().includes(searchLower)
            )
        );
        return matchesFamily || matchesMember;
    }) || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Past Events</h1>
                    <p className="text-muted-foreground">
                        Archive of previous holiday campaigns and claims.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-card border rounded-xl p-1 shadow-sm">
                        {PAST_EVENTS.map(ev => (
                            <button
                                key={ev.year}
                                onClick={() => setSelectedYear(ev.year)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${selectedYear === ev.year
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                            >
                                {ev.year}
                            </button>
                        ))}
                    </div>

                    <ExportButton
                        campaignId={selectedYear}
                        campaignName={`${selectedYear} Christmas Archive`}
                        type="archive"
                        label="Export Year"
                        variant="default"
                        className="rounded-xl shadow-sm"
                    />
                </div>
            </div>

            <Card className="border-none shadow-sm bg-muted/30">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by family, donor name, or item..."
                            className="pl-9 bg-background border-none shadow-none focus-visible:ring-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFamilies.map((family) => (
                    <FamilyArchiveCard key={family.alias} family={family} />
                ))}

                {filteredFamilies.length === 0 && (
                    <div className="col-span-full py-12 text-center">
                        <History className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground">No records found</h3>
                        <p className="text-muted-foreground">Try adjusting your search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FamilyArchiveCard({ family }: { family: ArchiveFamily }) {
    return (
        <Card className="overflow-hidden border-border/50 hover:border-primary/20 transition-all hover:shadow-md group bg-card">
            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {family.alias}
                    </CardTitle>
                    <Badge variant="outline" className="bg-background/50 font-mono text-[10px]">
                        {family.members.length} MEMBERS
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                    {family.members.map((member, idx) => (
                        <div key={idx} className="p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                {member.relation}
                            </div>
                            <div className="space-y-3 pl-5 border-l-2 border-muted">
                                {member.claims.map((claim, cIdx) => (
                                    <div key={cIdx} className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                                            <Gift className="h-3 w-3" />
                                            {claim.donor}
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                                            &ldquo;{claim.comment}&rdquo;
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
