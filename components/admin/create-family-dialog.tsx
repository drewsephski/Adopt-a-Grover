"use client";

import { useState } from "react";
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
import { createFamily } from "@/lib/actions/family";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateFamilyDialogProps {
    campaignId: string;
    children: React.ReactNode;
}

export function CreateFamilyDialog({ campaignId, children }: CreateFamilyDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alias, setAlias] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!alias.trim()) return;

        setIsLoading(true);
        try {
            const result = await createFamily(campaignId, alias);
            if (result.success && result.family) {
                toast.success("Family added successfully");
                setOpen(false);
                setAlias("");
                router.push(`/admin/families/${result.family.id}`);
            } else {
                throw new Error(result.error || "Failed to add family");
            }
        } catch (error) {
            toast.error("Failed to add family");
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
                        <DialogTitle>Add Family</DialogTitle>
                        <DialogDescription>
                            Create an anonymous alias for a family in this campaign.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="alias">Family Alias</Label>
                            <Input
                                id="alias"
                                placeholder="e.g. Family 101, Smith Family (Alias)"
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                                autoFocus
                                className="h-11"
                            />
                            <p className="text-xs text-muted-foreground">
                                Rule: Use aliases only. No personally identifiable information.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                            className="w-full sm:w-auto h-11"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !alias.trim()} className="w-full sm:w-auto h-11">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Family
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
