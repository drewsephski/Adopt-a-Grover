"use client";

import { useState } from "react";
import type { Campaign } from "@/lib/types";
import { updateCampaign } from "@/lib/actions/campaign";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CampaignStatus } from "@/lib/types";
import { Loader2, Save } from "lucide-react";
import { format } from "date-fns";

interface CampaignSettingsFormProps {
    campaign: Campaign;
}

export function CampaignSettingsForm({ campaign }: CampaignSettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: campaign?.name || "",
        startsAt: (campaign?.startsAt && !isNaN(new Date(campaign.startsAt).getTime()))
            ? format(new Date(campaign.startsAt), "yyyy-MM-dd")
            : "",
        endsAt: (campaign?.endsAt && !isNaN(new Date(campaign.endsAt).getTime()))
            ? format(new Date(campaign.endsAt), "yyyy-MM-dd")
            : "",
        status: campaign?.status || CampaignStatus.DRAFT,
    });

    async function handleSubmit(e: any) {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsLoading(true);
        try {
            await updateCampaign(campaign.id, {
                name: formData.name,
                startsAt: formData.startsAt ? new Date(formData.startsAt) : null,
                endsAt: formData.endsAt ? new Date(formData.endsAt) : null,
                status: formData.status as CampaignStatus,
            });
            toast.success("Campaign settings updated successfully");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to update campaign";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/50 border-b border-border">
                <CardTitle className="text-xl">Basic Information</CardTitle>
                <CardDescription>
                    Identify and schedule your holiday donation campaign.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-bold text-foreground ml-1">Campaign Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Christmas 2024"
                            className="h-12 rounded-xl bg-muted border-border focus:bg-background transition-all text-foreground"
                            required
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="startsAt" className="text-sm font-bold text-foreground ml-1">Start Date</Label>
                            <Input
                                id="startsAt"
                                type="date"
                                className="h-12 rounded-xl bg-muted border-border focus:bg-background transition-all text-foreground"
                                value={formData.startsAt || ""}
                                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endsAt" className="text-sm font-bold text-foreground ml-1">End Date / Deadline</Label>
                            <Input
                                id="endsAt"
                                type="date"
                                className="h-12 rounded-xl bg-muted border-border focus:bg-background transition-all text-foreground"
                                value={formData.endsAt || ""}
                                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-bold text-foreground ml-1">Campaign Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value as CampaignStatus })}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-muted border-border focus:bg-background transition-all text-foreground">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={CampaignStatus.DRAFT}>Draft (Not visible to donors)</SelectItem>
                                    <SelectItem value={CampaignStatus.ACTIVE}>Active (Visible to donors)</SelectItem>
                                    <SelectItem value={CampaignStatus.CLOSED}>Closed (No more donations)</SelectItem>
                                    <SelectItem value={CampaignStatus.ARCHIVED}>Archived (Hidden from dashboard)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground ml-1 italic">
                                Note: Only one campaign can be Active at a time.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-8 pt-0 flex justify-end">
                    <Button
                        type="submit"
                        className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] text-primary-foreground"
                        disabled={isLoading || !formData.name.trim()}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
