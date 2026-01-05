"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    sendCampaignSummary, 
    sendDeadlineReminders, 
    checkLowAvailability 
} from "@/lib/actions/admin";
import { 
    BarChart3, 
    Bell, 
    Calendar, 
    AlertTriangle,
    Mail,
    TrendingUp
} from "lucide-react";

interface AdminNotificationsProps {
    campaignId: string;
    campaignName: string;
}

export function AdminNotifications({ campaignId, campaignName }: AdminNotificationsProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleAction = async (action: string, actionFn: () => Promise<any>) => {
        setIsLoading(action);
        try {
            const result = await actionFn();
            console.log(`${action} result:`, result);
        } catch (error) {
            console.error(`Failed to ${action}:`, error);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Campaign Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        onClick={() => handleAction("summary", () => sendCampaignSummary(campaignId))}
                        disabled={isLoading === "summary"}
                        variant="outline"
                        className="w-full justify-start"
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Daily Summary
                        {isLoading === "summary" && " (Sending...)"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Get a comprehensive overview of campaign progress, recent claims, and admin action items.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Donor Communications
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        onClick={() => handleAction("reminders", () => sendDeadlineReminders(campaignId))}
                        disabled={isLoading === "reminders"}
                        variant="outline"
                        className="w-full justify-start"
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Send Deadline Reminders
                        {isLoading === "reminders" && " (Sending...)"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Automatically sends reminder emails to donors 7 days and 3 days before the deadline.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Availability Monitoring
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        onClick={() => handleAction("availability", () => checkLowAvailability(campaignId))}
                        disabled={isLoading === "availability"}
                        variant="outline"
                        className="w-full justify-start"
                    >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Check Low Availability
                        {isLoading === "availability" && " (Checking...)"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Identifies gifts with only 1-2 items remaining and sends alerts to promote last-minute donations.
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-muted/50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Pro Tip</Badge>
                    </div>
                    <h4 className="font-semibold mb-2">Automated Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                        High-value claims (3+ items or expensive gifts like bikes/tablets) automatically trigger admin notifications. 
                        You can customize these thresholds in the admin settings.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
