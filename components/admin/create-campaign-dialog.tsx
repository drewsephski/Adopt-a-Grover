"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCampaign } from "@/lib/actions/campaign";
import { OrganizationType } from "@prisma/client";

type OrgTypeString = "SCHOOL" | "CHURCH" | "NONPROFIT" | "BUSINESS";
import { toast } from "sonner";
import { Loader2, Building2 } from "lucide-react";

interface CreateCampaignDialogProps {
    children: React.ReactNode;
}

export function CreateCampaignDialog({ children }: CreateCampaignDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [organizationType, setOrganizationType] = useState<OrgTypeString>("NONPROFIT");
    const router = useRouter();

    const handleOrganizationTypeChange = (value: string) => {
        if (["SCHOOL", "CHURCH", "NONPROFIT", "BUSINESS"].includes(value)) {
            setOrganizationType(value as OrgTypeString);
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const result = await createCampaign(name, organizationType as OrganizationType);
            if (result.success && result.campaign) {
                toast.success(`Campaign created successfully for ${organizationType.toLowerCase() === 'nonprofit' ? 'Nonprofit' : organizationType}`);
                setOpen(false);
                setName("");
                router.push(`/admin/campaigns/${result.campaign.id}`);
            } else {
                throw new Error(result.error || "Failed to create campaign");
            }
        } catch (error) {
            toast.error("Failed to create campaign");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-w-md sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Campaign</DialogTitle>
                        <DialogDescription>
                            Set up a new donation drive for your organization.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 px-2 sm:px-0">
                        <div className="grid gap-2">
                            <Label htmlFor="organizationType">Organization Type</Label>
                            <Select
                                value={organizationType}
                                onValueChange={handleOrganizationTypeChange}
                            >
                                <SelectTrigger id="organizationType" className="h-11 px-3 sm:px-4 py-3">
                                    <SelectValue placeholder="Select organization type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NONPROFIT">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Nonprofit
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="SCHOOL">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            School
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="CHURCH">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Church
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="BUSINESS">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Business
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Campaign Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Christmas 2025"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                className="h-11 px-3 sm:px-4"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-4 px-2 sm:px-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                            size="default"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !name.trim()} className="w-full sm:w-auto" size="default">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Campaign
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
