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
import { updateFamily } from "@/lib/actions/family";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Family } from "@/lib/types";

interface EditFamilyDialogProps {
    family: Family;
    children: React.ReactNode;
}

export function EditFamilyDialog({ family, children }: EditFamilyDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alias, setAlias] = useState(family.alias);

    async function handleSubmit(e: any) {
        e.preventDefault();
        if (!alias.trim() || alias === family.alias) {
            setOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            await updateFamily(family.id, alias);
            toast.success("Family updated successfully");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to update family");
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
                        <DialogTitle>Edit Family</DialogTitle>
                        <DialogDescription>
                            Update the anonymous alias for this family.
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
                        <Button type="submit" disabled={isLoading || !alias.trim() || alias === family.alias} className="w-full sm:w-auto h-11">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
