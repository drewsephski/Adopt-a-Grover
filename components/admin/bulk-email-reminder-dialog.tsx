"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Users, Calendar, AlertTriangle } from "lucide-react";
import { sendRemindersToAllDonors } from "@/lib/actions/admin";
import { toast } from "sonner";

interface BulkEmailReminderDialogProps {
    campaignId: string;
    campaignName: string;
    donorCount: number;
    dropOffDeadline?: Date;
    children: React.ReactNode;
}

export function BulkEmailReminderDialog({
    campaignId,
    campaignName,
    donorCount,
    dropOffDeadline,
    children,
}: BulkEmailReminderDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleSendReminders = async () => {
        setIsSending(true);
        try {
            const result = await sendRemindersToAllDonors(campaignId);
            
            if (result.success) {
                toast.success(`Successfully sent ${result.sent} reminder emails to donors!`);
                if (result.failed && result.failed > 0) {
                    toast.warning(`${result.failed} emails failed to send. Check admin notifications for details.`);
                }
            } else {
                toast.error(result.error || "Failed to send reminder emails");
            }
        } catch (error) {
            console.error("Error sending bulk reminders:", error);
            toast.error("An unexpected error occurred while sending reminders");
        } finally {
            setIsSending(false);
            setIsOpen(false);
        }
    };

    const getDaysUntilDeadline = () => {
        if (!dropOffDeadline) return null;
        const today = new Date();
        const diffTime = dropOffDeadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilDeadline = getDaysUntilDeadline();
    const urgencyLevel = daysUntilDeadline === null ? 'normal' : 
                        daysUntilDeadline <= 3 ? 'high' : 
                        daysUntilDeadline <= 7 ? 'medium' : 'low';

    const getUrgencyColor = () => {
        switch (urgencyLevel) {
            case 'high': return 'destructive';
            case 'medium': return 'secondary';
            case 'low': return 'outline';
            default: return 'outline';
        }
    };

    const getUrgencyText = () => {
        if (daysUntilDeadline === null) return 'No deadline set';
        if (daysUntilDeadline < 0) return 'Deadline passed';
        if (daysUntilDeadline === 0) return 'Due today';
        if (daysUntilDeadline === 1) return '1 day remaining';
        return `${daysUntilDeadline} days remaining`;
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Send Bulk Email Reminders
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                        <div className="space-y-2">
                            <p>
                                Send reminder emails to all donors who have claimed gifts in the <strong>{campaignName}</strong> campaign.
                            </p>
                            
                            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Campaign:</span>
                                    <span className="text-sm">{campaignName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Total Donors:</span>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {donorCount}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Deadline:</span>
                                    <Badge variant={getUrgencyColor()} className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {getUrgencyText()}
                                    </Badge>
                                </div>
                            </div>

                            {urgencyLevel === 'high' && (
                                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-medium text-destructive">Urgent: Deadline approaching!</p>
                                        <p className="text-muted-foreground">Donors will receive an urgent reminder about the upcoming deadline.</p>
                                    </div>
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground space-y-1">
                                <p>• Each donor will receive one email with all their claimed items</p>
                                <p>• Emails include drop-off location and deadline information</p>
                                <p>• You&apos;ll receive a summary email with delivery results</p>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSendReminders}
                        disabled={isSending || donorCount === 0}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isSending ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Send {donorCount} Reminder{donorCount !== 1 ? 's' : ''}
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
