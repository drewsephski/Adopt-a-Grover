"use client";

import { useState } from "react";
import type { Campaign } from "@/lib/types";
import { updateCampaign } from "@/lib/actions/campaign";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsLoading(true);
        try {
            await updateCampaign(campaign.id, {
                name: formData.name,
                startsAt: formData.startsAt ? new Date(formData.startsAt) : null,
                endsAt: formData.endsAt ? new Date(formData.endsAt) : null,
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
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-xl">Basic Information</CardTitle>
                <CardDescription>
                    Identify and schedule your holiday donation campaign.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-bold text-slate-700 ml-1">Campaign Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Christmas 2024"
                            className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all text-slate-900"
                            required
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="startsAt" className="text-sm font-bold text-slate-700 ml-1">Start Date</Label>
                            <Input
                                id="startsAt"
                                type="date"
                                className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all text-slate-900"
                                value={formData.startsAt || ""}
                                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endsAt" className="text-sm font-bold text-slate-700 ml-1">End Date / Deadline</Label>
                            <Input
                                id="endsAt"
                                type="date"
                                className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all text-slate-900"
                                value={formData.endsAt || ""}
                                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-8 pt-0 flex justify-end">
                    <Button
                        type="submit"
                        className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] text-white"
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
