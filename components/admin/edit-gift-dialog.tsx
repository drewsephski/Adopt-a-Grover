"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateGift } from "@/lib/actions/gift";
import { getPersonsByFamily } from "@/lib/actions/person";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Gift } from "@/lib/types";

interface EditGiftDialogProps {
    gift: Gift;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditGiftDialog({ gift, open, onOpenChange }: EditGiftDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [persons, setPersons] = useState<Array<{ id: string; firstName: string }>>([]);

    const [formData, setFormData] = useState({
        name: gift.name,
        quantity: gift.quantity,
        description: gift.description || "",
        productUrl: gift.productUrl || "",
        personId: gift.personId || "unassigned"
    });

    // Load persons when dialog opens
    useEffect(() => {
        async function loadPersons() {
            try {
                const result = await getPersonsByFamily(gift.familyId);
                setPersons(result);
            } catch (error) {
                console.error("Failed to load persons:", error);
            }
        }

        if (open) {
            loadPersons();
        }
    }, [open, gift.familyId]);

    async function handleSubmit(e: any) {
        e.preventDefault();
        if (!formData.name.trim() || formData.quantity < 1) return;

        setIsLoading(true);
        try {
            await updateGift(gift.id, {
                name: formData.name,
                quantity: formData.quantity,
                description: formData.description || null,
                productUrl: formData.productUrl || null,
                personId: formData.personId === "unassigned" ? null : formData.personId
            });
            toast.success("Gift updated successfully");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update gift");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] max-w-md sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Gift Details</DialogTitle>
                        <DialogDescription>
                            Update the details for &quot;{gift.name}&quot;.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-1.5 py-2">
                        {persons.length > 0 && (
                            <div className="grid gap-0.5">
                                <Label htmlFor="edit-personId" className="text-[10px]">Person</Label>
                                <Select
                                    value={formData.personId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, personId: value }))}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {persons.map((person) => (
                                            <SelectItem key={person.id} value={person.id}>
                                                {person.firstName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                className="text-foreground h-11"
                                placeholder="e.g. LEGO Star Wars Set"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-quantity">Quantity</Label>
                            <Input
                                id="edit-quantity"
                                type="number"
                                min="1"
                                className="text-foreground h-11"
                                value={formData.quantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                className="text-foreground min-h-[50px] px-3 py-2 text-xs"
                                placeholder="Size, color, or specific details for the donor..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-productUrl">Link (opt)</Label>
                            <Input
                                id="edit-productUrl"
                                className="text-foreground h-11"
                                placeholder="Amazon, Target, Walmart link..."
                                value={formData.productUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, productUrl: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="w-full sm:w-auto h-9 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !formData.name.trim()} className="w-full sm:w-auto h-9 text-xs">
                            {isLoading && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
