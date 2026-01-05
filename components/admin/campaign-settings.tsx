"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Bell } from "lucide-react";
import { updateCampaignSettings } from "@/lib/actions/admin";

interface CampaignSettingsProps {
    campaignId: string;
    currentSettings?: {
        dropOffAddress?: string;
        dropOffDeadline?: Date;
    };
}

export function CampaignSettings({ campaignId, currentSettings }: CampaignSettingsProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [dropOffAddress, setDropOffAddress] = useState(currentSettings?.dropOffAddress || "");
    const [dropOffDeadline, setDropOffDeadline] = useState(
        currentSettings?.dropOffDeadline ? 
        new Date(currentSettings.dropOffDeadline).toISOString().split('T')[0] : 
        ""
    );

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            await updateCampaignSettings(campaignId, {
                dropOffAddress: dropOffAddress || undefined,
                dropOffDeadline: dropOffDeadline ? new Date(dropOffDeadline) : undefined,
            });
        } catch (error) {
            console.error("Failed to update campaign settings:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Campaign Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="space-y-2">
                    <Label htmlFor="dropOffAddress" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Drop-off Address
                    </Label>
                    <Input
                        id="dropOffAddress"
                        placeholder="624 Ellington Court, Fox River Grove, IL 60021"
                        value={dropOffAddress}
                        onChange={(e) => setDropOffAddress(e.target.value)}
                        className="h-10 sm:h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dropOffDeadline" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Drop-off Deadline
                    </Label>
                    <Input
                        id="dropOffDeadline"
                        type="date"
                        value={dropOffDeadline}
                        onChange={(e) => setDropOffDeadline(e.target.value)}
                        className="h-10 sm:h-11"
                    />
                </div>

                <Button 
                    onClick={handleUpdate} 
                    disabled={isUpdating}
                    className="w-full"
                    size="default"
                >
                    {isUpdating ? "Updating..." : "Update Settings"}
                </Button>
            </CardContent>
        </Card>
    );
}
