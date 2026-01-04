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
            const family = await createFamily(campaignId, alias);
            toast.success("Family added successfully");
            setOpen(false);
            setAlias("");
            router.push(`/admin/families/${family.id}`);
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
            <DialogContent className="sm:max-w-[425px]">
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
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Rule: Use aliases only. No personally identifiable information.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !alias.trim()}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Family
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
